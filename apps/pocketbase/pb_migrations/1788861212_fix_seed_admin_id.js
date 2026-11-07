/// <reference path="../pb_data/types.d.ts" />

/*
 * Fix the seed admin account so it is actually usable.
 *
 * 1775800000_iayo_setup.js creates the default "IAYO Administrator"
 * account (admin@iayo.in) and means for it to be reachable as Admin ID
 * "IAYO-ADMIN-001" — but it mistakenly writes that value into the
 * `president_id` field instead of `admin_id`. Worse, even "admin_id"
 * would have been a no-op there: that field isn't added to the users
 * collection schema until 1788861201_president_admin_workflow.js, which
 * runs *after* the seed migration. Either way, the seeded admin's real
 * `admin_id` field is left blank, so /api/admin/resolve can never find
 * it — confirmed live during a functional audit ("Admin ID not found").
 *
 * admin_enabled was also never set to true. This account is clearly
 * meant to be a working, ready-to-use default: 1788857465_cleanup_test_
 * president.js explicitly preserves it (reassigning every seeded
 * research/investigation/finding/RTI record to it) while deleting the
 * equivalent seeded president — and the President dashboard's Admin
 * Management page has no way to enable an existing-but-disabled admin
 * at all (only "create new" or "revoke already-enabled"), so once
 * disabled this account could never become usable through the app.
 *
 * This migration runs after the admin_id field exists, so it can
 * actually backfill both correctly.
 */
migrate(
  (app) => {
    let admin;
    try {
      admin = app.findAuthRecordByEmail("users", "admin@iayo.in");
    } catch (_) {
      return;
    }

    if (!admin.getString("admin_id")) admin.set("admin_id", "IAYO-ADMIN-001");
    admin.set("admin_enabled", true);
    app.save(admin);
  },
  (app) => {
    let admin;
    try {
      admin = app.findAuthRecordByEmail("users", "admin@iayo.in");
    } catch (_) {
      return;
    }

    if (admin.getString("admin_id") === "IAYO-ADMIN-001") admin.set("admin_id", "");
    admin.set("admin_enabled", false);
    app.save(admin);
  },
);
