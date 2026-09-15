/// <reference path="../pb_data/types.d.ts" />

/*
 * Server-side login counting.
 *
 * There was previously no login-count feature anywhere in this codebase
 * (frontend or PocketBase) — confirmed by exhaustive search during the
 * audit. This adds one: every genuinely COMPLETED authentication (citizen
 * passwordless OTP, President password+MFA, Admin password) inserts one
 * row here (see pb_hooks/login-count.pb.js for exactly which hook does the
 * counting and why it cannot double- or under-count).
 *
 * Append-only by design: createRule/updateRule/deleteRule are all null
 * (superuser only) so no client — not even the President — can inflate,
 * edit, or erase the count through the REST API. The counting hook writes
 * via $app.save(), which runs with elevated privileges and bypasses these
 * rules entirely, exactly like the existing audit_log hook.
 */
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const collection = new Collection({
      type: "base",
      name: "login_events",
      listRule: "@request.auth.role = 'president'",
      viewRule: "@request.auth.role = 'president'",
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
        {
          name: "role",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["citizen", "admin", "president"],
        },
        { name: "created", type: "autodate", onCreate: true, onUpdate: false },
      ],
    });

    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("login_events");
    if (collection) app.delete(collection);
  },
);
