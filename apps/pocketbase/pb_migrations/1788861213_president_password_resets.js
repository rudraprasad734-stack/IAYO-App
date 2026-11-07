/// <reference path="../pb_data/types.d.ts" />

/*
 * President password reset, by email OTP code.
 *
 * The President's password cannot otherwise be recovered: PocketBase's
 * native MFA enforcement on this account (password + email OTP, verified
 * live) requires two DIFFERENT auth methods to complete a login, so the
 * existing OTP-login endpoints can never, by themselves, authenticate a
 * President who has forgotten their password — that's correct and must
 * stay that way. This collection backs a separate, dedicated reset flow
 * (see pb_hooks/president-password-reset.pb.js) that proves email
 * ownership via its own one-time code, then sets a new password directly
 * with superuser privileges — it never touches or weakens the login MFA
 * path.
 *
 * Only ever written by that hook (via $app.save(), which bypasses these
 * rules) — createRule/updateRule/deleteRule are null so no client, not
 * even the President, can read, forge or tamper with a reset record
 * through the REST API. The code itself is stored only as a SHA-256
 * hash, never in plaintext.
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const collection = new Collection({
      type: "base",
      name: "president_password_resets",
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "user",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        { name: "code_hash", type: "text", required: true },
        { name: "expires", type: "date", required: true },
        { name: "used", type: "bool" },
        { name: "attempts", type: "number", onlyInt: true },
        { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      ],
    });

    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("president_password_resets");
    if (collection) app.delete(collection);
  },
);
