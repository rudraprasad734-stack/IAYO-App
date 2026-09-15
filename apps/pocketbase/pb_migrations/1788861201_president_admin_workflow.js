/// <reference path="../pb_data/types.d.ts" />

/*
 * IAYO President/Admin workflow.
 *
 * Rules after this migration:
 *
 * PRESIDENT
 *   - exactly one President remains protected by president-access.pb.js
 *   - can create/revoke Admin accounts
 *   - can approve/reject/publish content
 *   - can update/delete managed data
 *
 * ADMIN
 *   - can log in only with an Admin ID + password
 *   - can read/verify data
 *   - can CREATE new content submissions
 *   - cannot UPDATE or DELETE existing data
 *   - cannot publish anything
 *
 * PUBLIC
 *   - can only see content whose status is published
 *
 * Content workflow:
 *   Admin upload -> pending_president -> President publish/reject
 */

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    // ---------------------------------------------------------------
    // Admin ID
    // ---------------------------------------------------------------
    if (!users.fields.getByName("admin_id")) {
      users.fields.add(new TextField({
        name: "admin_id",
        max: 60,
      }));
    }

    if (!users.fields.getByName("admin_enabled")) {
      users.fields.add(new BoolField({
        name: "admin_enabled",
      }));
    }

    // Disable legacy seeded Admin accounts. They are not removed because
    // existing authored content may still reference them. A new Admin must
    // be explicitly created by the President.
    let legacyAdmins = [];
    try {
      legacyAdmins = app.findRecordsByFilter("users", "role = 'admin'", "", 1000, 0);
    } catch (_) {}
    for (const admin of legacyAdmins) {
      if (!admin.getBool("admin_enabled")) {
        admin.set("admin_enabled", false);
        app.save(admin);
      }
    }

    const adminIdIndex = "idx_users_admin_id";
    if (!users.indexes.some((index) => index.includes(adminIdIndex))) {
      users.indexes.push(
        "CREATE UNIQUE INDEX `idx_users_admin_id` ON `users` (`admin_id`) WHERE `admin_id` != ''",
      );
    }

    const presidentIndex = "idx_users_single_president";
    if (!users.indexes.some((index) => index.includes(presidentIndex))) {
      users.indexes.push(
        "CREATE UNIQUE INDEX `idx_users_single_president` ON `users` (`role`) WHERE `role` = 'president'",
      );
    }

    const activeAdmin = "@request.auth.role = 'admin' && @request.auth.admin_enabled = true";

    // Guests cannot create users. The President creates Admin accounts.
    // Citizens retain the ability to view/update their own profile.
    users.listRule =
      `id = @request.auth.id || @request.auth.role = 'president' || ${activeAdmin}`;
    users.viewRule =
      `id = @request.auth.id || @request.auth.role = 'president' || ${activeAdmin}`;
    users.createRule =
      "@request.auth.role = 'president'";
    users.authRule =
      "role = 'citizen' || role = 'president' || (role = 'admin' && admin_enabled = true)";
    users.updateRule =
      "(id = @request.auth.id && @request.auth.role = 'citizen') || @request.auth.role = 'president'";
    users.deleteRule =
      "@request.auth.role = 'president'";

    app.save(users);

    // ---------------------------------------------------------------
    // Content collections
    // ---------------------------------------------------------------
    const contentCollections = [
      "research",
      "investigations",
      "findings",
      "rti_cases",
    ];

    for (const name of contentCollections) {
      const collection = app.findCollectionByNameOrId(name);
      const status = collection.fields.getByName("status");

      if (status) {
        const values = Array.from(status.values || []);
        for (const value of ["pending_president", "rejected", "published"]) {
          if (!values.includes(value)) values.push(value);
        }
        status.values = values;
      }

      // Public sees only published material. Staff can inspect the queue.
      collection.listRule =
        `status = 'published' || @request.auth.role = 'president' || ${activeAdmin}`;
      collection.viewRule =
        `status = 'published' || @request.auth.role = 'president' || ${activeAdmin}`;

      // Admins can upload only records already marked for Presidential review;
      // the President can create records directly with any valid status.
      collection.createRule =
        `@request.auth.role = 'president' || (@request.auth.role = 'admin' && @request.auth.admin_enabled = true && @request.body.status = 'pending_president'${name === 'notifications' ? '' : ' && @request.body.author = @request.auth.id'})`;

      // ONLY the President can alter an existing content record.
      collection.updateRule =
        "@request.auth.role = 'president'";
      collection.deleteRule =
        "@request.auth.role = 'president'";

      app.save(collection);
    }

    // Existing notifications are already public website notifications.
    // Preserve them as published so this migration does not hide existing data.
    const notifications = app.findCollectionByNameOrId("notifications");
    let notificationStatus = notifications.fields.getByName("status");

    if (!notificationStatus) {
      notificationStatus = new SelectField({
        name: "status",
        required: false,
        maxSelect: 1,
        values: ["pending_president", "published", "rejected"],
      });
      notifications.fields.add(notificationStatus);
      app.save(notifications);
    }

    let existingNotifications = [];
    try {
      existingNotifications = app.findRecordsByFilter(
        "notifications",
        "",
        "",
        1000,
        0,
      );
    } catch (_) {}

    for (const record of existingNotifications) {
      if (!record.getString("status")) {
        record.set("status", "published");
        app.save(record);
      }
    }

    notificationStatus.required = true;

    notifications.listRule =
      `status = 'published' || @request.auth.role = 'president' || ${activeAdmin}`;
    notifications.viewRule =
      `status = 'published' || @request.auth.role = 'president' || ${activeAdmin}`;
    notifications.createRule = "@request.auth.role = 'president' || (@request.auth.role = 'admin' && @request.auth.admin_enabled = true && @request.body.status = 'pending_president')";
    notifications.updateRule = "@request.auth.role = 'president'";
    notifications.deleteRule = "@request.auth.role = 'president'";
    app.save(notifications);

    // ---------------------------------------------------------------
    // Other managed data: admin can inspect, President can moderate.
    // Admin cannot alter or delete these records.
    // ---------------------------------------------------------------
    const members = app.findCollectionByNameOrId("members");
    members.listRule =
      `@request.auth.role = 'president' || ${activeAdmin}`;
    members.viewRule =
      `@request.auth.role = 'president' || ${activeAdmin}`;
    members.updateRule = "@request.auth.role = 'president'";
    members.deleteRule = "@request.auth.role = 'president'";
    app.save(members);

    const comments = app.findCollectionByNameOrId("comments");
    comments.listRule =
      `status = 'approved' || @request.auth.role = 'president' || ${activeAdmin}`;
    comments.viewRule =
      `status = 'approved' || @request.auth.role = 'president' || ${activeAdmin}`;
    comments.updateRule = "@request.auth.role = 'president'";
    comments.deleteRule = "@request.auth.role = 'president'";
    app.save(comments);

    const siteStats = app.findCollectionByNameOrId("site_stats");
    siteStats.listRule = "";
    siteStats.viewRule = "";
    siteStats.createRule = "@request.auth.role = 'president'";
    siteStats.updateRule = "@request.auth.role = 'president'";
    siteStats.deleteRule = "@request.auth.role = 'president'";
    app.save(siteStats);


  },
  (app) => {
    // This migration is a security policy migration. Do not attempt to
    // restore the old permissive rules automatically during a production revert.
  },
);
