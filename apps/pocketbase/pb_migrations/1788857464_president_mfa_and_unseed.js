/// <reference path="../pb_data/types.d.ts" />

// Enable 2-step (email OTP) verification for president logins, and remove the
// demo-seeded president so the one-time "first setup creates the president"
// flow is available. Seeded authored content is reassigned to the admin first
// so cascadeDelete on the author relation does not wipe it.
migrate(
  (app) => {
    // 1) Enable MFA for presidents only (citizens keep passwordless OTP).
    const users = app.findCollectionByNameOrId("users");
    users.mfa.enabled = true;
    users.mfa.duration = 300; // seconds the mfaId window stays valid
    users.mfa.rule = "role = 'president'";
    users.otp.enabled = true;
    users.otp.duration = 300;
    users.otp.length = 6;
    app.save(users);

    // 2) Locate the seeded admin and the seeded president.
    let admin = null;
    try {
      admin = app.findAuthRecordByEmail("users", "admin@iayo.in");
    } catch (_) {}

    let president = null;
    try {
      president = app.findFirstRecordByFilter("users", "role = 'president'");
    } catch (_) {}

    // 3) Reassign authored content to the admin, then delete the president.
    if (president && admin) {
      const pid = president.id;
      const cols = ["research", "investigations", "findings", "rti_cases"];
      for (const col of cols) {
        let records = [];
        try {
          records = app.findRecordsByFilter(col, `author = "${pid}"`, "", 1000, 0);
        } catch (_) {}
        for (const r of records) {
          r.set("author", admin.id);
          app.save(r);
        }
      }
      app.delete(president);
    }
  },
  (app) => {
    try {
      const users = app.findCollectionByNameOrId("users");
      users.mfa.enabled = false;
      app.save(users);
    } catch (e) {
      if (!e.message.includes("no rows in result set")) throw e;
    }
  },
);
