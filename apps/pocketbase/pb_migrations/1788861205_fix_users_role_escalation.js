/// <reference path="../pb_data/types.d.ts" />

/*
 * Security fix: role self-escalation via the `users` update rule.
 *
 * The update rule added in 1788861201_president_admin_workflow.js only
 * checks the CALLER'S CURRENT role ("@request.auth.role = 'citizen'") and
 * that the target record is their own. It never restricted which FIELDS a
 * citizen's request body may touch. Because PocketBase applies the whole
 * submitted body once the rule passes, any authenticated citizen could
 * PATCH their own record with {"role":"admin","admin_enabled":true} (or,
 * before a President exists, {"role":"president"}) and the rule would still
 * evaluate to true, silently granting them Admin or President privileges
 * outside of the President-only /api/president-setup and Admin-management
 * flows.
 *
 * This migration keeps the citizen self-service profile update (name,
 * phone, bio, district, state, avatar, etc.) but blocks the request body
 * from touching any identity/authorization field. The President's own
 * update path is unaffected.
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const guardedFields = [
      "role",
      "admin_enabled",
      "admin_id",
      "president_id",
      "verified",
    ];
    const noEscalation = guardedFields
      .map((field) => `@request.body.${field}:isset = false`)
      .join(" && ");

    users.updateRule =
      `(id = @request.auth.id && @request.auth.role = 'citizen' && ${noEscalation}) || @request.auth.role = 'president'`;

    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.updateRule =
      "(id = @request.auth.id && @request.auth.role = 'citizen') || @request.auth.role = 'president'";
    app.save(users);
  },
);
