/// <reference path="../pb_data/types.d.ts" />

/*
 * President password reset, by email OTP code.
 *
 * Why this exists as its own flow instead of reusing the login OTP
 * endpoints: verified live that PocketBase's native MFA enforcement on
 * the President account requires two DIFFERENT auth methods to complete
 * a login (a bare OTP, or two sequential OTPs, both correctly get
 * rejected). That's exactly right and must not be weakened — but it also
 * means a President who has forgotten their password can never finish a
 * login at all, so there is no way to "prove identity via OTP, then
 * change password" using those endpoints. This file is a separate,
 * narrowly-scoped mechanism: it proves email ownership with its own
 * one-time code (see pb_migrations/1788861213_president_password_resets.js),
 * then sets a new password directly, with superuser privileges, via
 * $app.save() — it never authenticates a session and never touches the
 * login/MFA path.
 *
 * Note: the 10-minute TTL and 5-attempt cap are inlined as literals in
 * each callback below (rather than shared top-level constants) because a
 * top-level binding is not reliably visible from a hook callback invoked
 * later from this JSVM's pool — confirmed by a live ReferenceError
 * ("RESET_CODE_TTL_MS is not defined") when first written with a shared
 * constant. Same root cause and same fix pattern already used elsewhere
 * in this codebase (pb_hooks/login-count.pb.js, pb_hooks/president-
 * access.pb.js's duplicated sendPresidentAlert).
 */

routerAdd("POST", "/api/president/password-reset/request", (e) => {
  const email = String(e.requestInfo().body?.email || "").trim().toLowerCase();

  // Always return the same response whether or not the email exists / is
  // a President, so this route can't be used to enumerate accounts.
  const ok = () => e.json(200, { ok: true });

  if (!email) return e.json(422, { error: "email is required." });

  let user;
  try {
    user = $app.findAuthRecordByEmail("users", email);
  } catch (_) {
    return ok();
  }

  if (user.getString("role") !== "president") return ok();

  try {
    const outstanding = $app.findRecordsByFilter(
      "president_password_resets",
      `user = "${user.id}" && used = false`,
      "",
      100,
      0,
    );
    for (const rec of outstanding) {
      rec.set("used", true);
      $app.save(rec);
    }
  } catch (_) {
    // No outstanding resets — fine, nothing to invalidate.
  }

  const code = $security.randomStringWithAlphabet(6, "0123456789");

  const collection = $app.findCollectionByNameOrId("president_password_resets");
  const resetRecord = new Record(collection);
  resetRecord.set("user", user.id);
  resetRecord.set("code_hash", $security.sha256(code));
  resetRecord.set("expires", new Date(Date.now() + 10 * 60 * 1000).toISOString());
  resetRecord.set("used", false);
  resetRecord.set("attempts", 0);
  $app.save(resetRecord);

  try {
    const message = new MailerMessage({
      from: { name: "IAYO Security" },
      to: [{ address: email }],
      subject: "Your IAYO password reset code: " + code,
      html:
        "<div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0b1b33'>" +
        "<h2 style='color:#0b1b33'>Reset your President password</h2>" +
        "<p>Hello,</p>" +
        "<p>You requested to reset your IAYO President password. Use the code below to continue. " +
        "This code is valid for 10 minutes.</p>" +
        "<div style='margin:24px 0;text-align:center'>" +
        "<span style='display:inline-block;font-family:Menlo,Consolas,monospace;font-size:30px;font-weight:800;letter-spacing:0.35em;color:#1d4ed8;background:#f4f6f9;border:1px solid #e8ecf1;padding:16px 28px;border-radius:6px'>" +
        code +
        "</span></div>" +
        "<p style='color:#5a6a7e;font-size:13px'>If you did not request this, you can safely ignore this email — your password will not change.</p>" +
        "<p style='color:#5a6a7e;font-size:12px'>— IAYO Security</p>" +
        "</div>",
    });
    $app.newMailClient().send(message);
  } catch (err) {
    $app.logger().error("president password reset email failed", "err", String(err));
  }

  return ok();
});

routerAdd("POST", "/api/president/password-reset/confirm", (e) => {
  const body = e.requestInfo().body || {};
  const email = String(body.email || "").trim().toLowerCase();
  const code = String(body.code || "").trim();
  const newPassword = String(body.password || "");

  const invalid = () => e.json(400, { error: "Invalid or expired code." });

  if (!email || !code || !newPassword) {
    return e.json(422, { error: "email, code and password are required." });
  }
  if (newPassword.length < 10) {
    return e.json(422, { error: "Password must be at least 10 characters." });
  }

  let user;
  try {
    user = $app.findAuthRecordByEmail("users", email);
  } catch (_) {
    return invalid();
  }
  if (user.getString("role") !== "president") return invalid();

  let resetRecord;
  try {
    const rows = $app.findRecordsByFilter(
      "president_password_resets",
      `user = "${user.id}" && used = false`,
      "-created",
      1,
      0,
    );
    resetRecord = rows[0];
  } catch (_) {
    resetRecord = null;
  }

  if (!resetRecord) return invalid();
  if (new Date(resetRecord.getString("expires")).getTime() < Date.now()) return invalid();
  if (resetRecord.getInt("attempts") >= 5) {
    return e.json(400, { error: "Too many attempts. Please request a new code." });
  }

  if (!$security.equal($security.sha256(code), resetRecord.getString("code_hash"))) {
    resetRecord.set("attempts", resetRecord.getInt("attempts") + 1);
    $app.save(resetRecord);
    return invalid();
  }

  resetRecord.set("used", true);
  $app.save(resetRecord);

  user.setPassword(newPassword);
  $app.save(user);

  return e.json(200, { ok: true });
});
