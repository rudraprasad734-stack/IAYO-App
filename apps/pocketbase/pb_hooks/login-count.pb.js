/// <reference path="../pb_data/types.d.ts" />

/*
 * Server-side login counting.
 *
 * Each hook below places its counting call AFTER e.next(). e.next() runs
 * the actual PocketBase auth check and throws on any failed or incomplete
 * authentication attempt - a wrong password, an invalid/expired OTP, or
 * (critically) a correct password that still needs a second MFA factor.
 * Code placed after e.next() therefore only ever runs once a login has
 * genuinely, fully completed. This was verified empirically against a
 * live PocketBase instance for all three roles before relying on it here:
 * a President's password step (which returns only an mfaId, HTTP 401)
 * never reaches past e.next() in onRecordAuthWithPasswordRequest, so a
 * President is never counted there - only once, when their MFA/OTP second
 * factor completes in onRecordAuthWithOTPRequest below. That means:
 *
 *  - Admin (password only, no MFA): counted in onRecordAuthWithPasswordRequest.
 *  - Citizen (passwordless OTP, no MFA): counted in onRecordAuthWithOTPRequest.
 *  - President (password + mandatory MFA): the password step is never
 *    counted; counted exactly once in onRecordAuthWithOTPRequest when the
 *    OTP second factor (tied to the password step via mfaId) completes.
 *
 * A page refresh, route change, or restored session never calls either of
 * these auth endpoints at all (the PocketBase SDK just reads the cached
 * token), so none of those can inflate the count. authRefresh() would hit
 * a separate, unrelated endpoint (onRecordAuthRefreshRequest) that this
 * file does not hook, for the same reason.
 *
 * The recordLogin logic is duplicated in each hook below (rather than
 * shared via a top-level helper) to match the pattern already used
 * elsewhere in this codebase (see the duplicated sendPresidentAlert in
 * pb_hooks/president-access.pb.js): a top-level function is not reliably
 * visible from a hook callback invoked later from this JSVM's pool.
 */

onRecordAuthWithPasswordRequest((e) => {
  e.next();
  // Citizens never have a usable password (create-user-on-otp-request.pb.js
  // sets a random one they never see) and the President always needs a
  // second MFA factor, so in practice only Admin completes a login here.
  if (e.record) {
    try {
      const collection = $app.findCollectionByNameOrId("login_events");
      const rec = new Record(collection);
      rec.set("user", e.record.id);
      rec.set("role", e.record.getString("role") || "");
      $app.save(rec);
    } catch (err) {
      $app.logger().error("login event record failed", "err", String(err));
    }
  }
}, "users");

onRecordAuthWithOTPRequest((e) => {
  // Admin accounts are documented (president-access.pb.js,
  // PresidentAdminManagementPage.jsx) to authenticate only with an
  // Admin ID + password. Nothing previously stopped an Admin who knows
  // their own account email from signing in via the citizen
  // passwordless-OTP endpoint instead - same account and permissions
  // either way, but it bypasses that design and would otherwise need
  // special-casing here to avoid mis-attributing the login. Block it
  // before the OTP is even checked.
  if (e.record && e.record.getString("role") === "admin") {
    throw new BadRequestError("Admin accounts must sign in with an Admin ID and password.");
  }

  e.next();
  // Citizens complete their one-and-only factor here. Presidents complete
  // their second (MFA) factor here, tied to the password step by mfaId.
  // e.next() throws on an invalid/expired OTP or a mismatched mfaId, so
  // this only runs once the login has genuinely completed.
  if (e.record) {
    try {
      const collection = $app.findCollectionByNameOrId("login_events");
      const rec = new Record(collection);
      rec.set("user", e.record.id);
      rec.set("role", e.record.getString("role") || "");
      $app.save(rec);
    } catch (err) {
      $app.logger().error("login event record failed", "err", String(err));
    }
  }
}, "users");
