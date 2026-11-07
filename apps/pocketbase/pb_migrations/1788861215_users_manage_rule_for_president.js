/// <reference path="../pb_data/types.d.ts" />

/*
 * Fix: the President could never actually create an Admin account.
 *
 * users.createRule already allows the President to create a user record
 * (1788861201_president_admin_workflow.js), and that's enough for
 * app-defined fields like role/admin_id/admin_enabled — but `verified`
 * is one of PocketBase's own built-in auth-collection fields, which can
 * only be set directly by a request that has "manage" access to the
 * collection (superuser, or a matching manageRule) — createRule alone
 * does not grant that. Since no manageRule was ever set here, every
 * President's "Create Admin" submission failed with a hard validation
 * error ("verified: Values don't match"), confirmed live.
 *
 * manageRule for 'president' grants exactly the elevated field access
 * this flow needs (verified, and future password-related self-service
 * for the accounts the President manages) without changing createRule/
 * updateRule/deleteRule, which already correctly scope what citizens and
 * admins can do.
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.manageRule = "@request.auth.role = 'president'";
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.manageRule = null;
    app.save(users);
  },
);
