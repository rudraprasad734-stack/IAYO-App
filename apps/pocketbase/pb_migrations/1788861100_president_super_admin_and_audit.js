/// <reference path="../pb_data/types.d.ts" />

// Upgrade the President role into a full super-admin control panel:
// grant the president role server-side CRUD over every managed collection
// (members, comments, notifications, site_stats, users) alongside admins,
// and create an audit_log collection that records who changed what and when.
// Authorization is enforced by these access rules (server-side), not the UI.
migrate(
  (app) => {
    const staff = "@request.auth.role = 'president' || @request.auth.role = 'admin'";

    // members — president can now list/view/update/delete; create stays public
    const members = app.findCollectionByNameOrId("members");
    members.listRule = staff;
    members.viewRule = staff;
    members.updateRule = staff;
    members.deleteRule = staff;
    app.save(members);

    // comments (voices) — president sees all + moderates
    const comments = app.findCollectionByNameOrId("comments");
    comments.listRule = "status = 'approved' || " + staff;
    comments.viewRule = "status = 'approved' || " + staff;
    comments.updateRule = staff;
    comments.deleteRule = staff;
    app.save(comments);

    // notifications — president can update/delete (create already allowed)
    const notifications = app.findCollectionByNameOrId("notifications");
    notifications.updateRule = staff;
    notifications.deleteRule = staff;
    app.save(notifications);

    // site_stats — president can manage homepage counters
    const siteStats = app.findCollectionByNameOrId("site_stats");
    siteStats.createRule = staff;
    siteStats.updateRule = staff;
    siteStats.deleteRule = staff;
    app.save(siteStats);

    // users — president can manage office bearer accounts & roles
    const users = app.findCollectionByNameOrId("users");
    users.listRule = staff;
    users.viewRule = staff;
    users.createRule = staff;
    users.updateRule = staff;
    users.deleteRule = staff;
    app.save(users);

    // audit_log — append-only change log (president/admin can read; create via API)
    let audit;
    try {
      audit = app.findCollectionByNameOrId("audit_log");
    } catch (_) {
      audit = new Collection({
        type: "base",
        name: "audit_log",
        listRule: staff,
        viewRule: staff,
        createRule: staff,
        updateRule: null,
        deleteRule: staff,
        fields: [
          { name: "action", type: "text", required: true, max: 20 },
          { name: "collection_name", type: "text", required: true, max: 60 },
          { name: "record_id", type: "text", max: 60 },
          { name: "record_title", type: "text", max: 300 },
          {
            name: "actor",
            type: "relation",
            maxSelect: 1,
            collectionId: users.id,
            cascadeDelete: false,
          },
          { name: "actor_name", type: "text", max: 120 },
          { name: "actor_role", type: "text", max: 20 },
          { name: "summary", type: "text", max: 600 },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
      app.save(audit);
    }
  },
  (app) => {
    // Revert rules to their pre-super-admin state.
    try {
      const members = app.findCollectionByNameOrId("members");
      members.listRule = "@request.auth.role = 'admin'";
      members.viewRule = "@request.auth.role = 'admin'";
      members.updateRule = "@request.auth.role = 'admin'";
      members.deleteRule = "@request.auth.role = 'admin'";
      app.save(members);
    } catch (e) {
      if (!e.message.includes("no rows in result set")) throw e;
    }
    try {
      const comments = app.findCollectionByNameOrId("comments");
      comments.listRule = "status = 'approved' || @request.auth.role = 'admin'";
      comments.viewRule = "status = 'approved' || @request.auth.role = 'admin'";
      comments.updateRule = "@request.auth.role = 'admin'";
      comments.deleteRule = "@request.auth.role = 'admin'";
      app.save(comments);
    } catch (e) {
      if (!e.message.includes("no rows in result set")) throw e;
    }
    try {
      const notifications = app.findCollectionByNameOrId("notifications");
      notifications.updateRule = "@request.auth.role = 'admin'";
      notifications.deleteRule = "@request.auth.role = 'admin'";
      app.save(notifications);
    } catch (e) {
      if (!e.message.includes("no rows in result set")) throw e;
    }
    try {
      const siteStats = app.findCollectionByNameOrId("site_stats");
      siteStats.createRule = "@request.auth.role = 'admin'";
      siteStats.updateRule = "@request.auth.role = 'admin'";
      siteStats.deleteRule = "@request.auth.role = 'admin'";
      app.save(siteStats);
    } catch (e) {
      if (!e.message.includes("no rows in result set")) throw e;
    }
    try {
      const users = app.findCollectionByNameOrId("users");
      users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'";
      users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'";
      users.createRule = "@request.auth.role = 'admin'";
      users.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'";
      users.deleteRule = "@request.auth.role = 'admin'";
      app.save(users);
    } catch (e) {
      if (!e.message.includes("no rows in result set")) throw e;
    }
    try {
      app.delete(app.findCollectionByNameOrId("audit_log"));
    } catch (e) {
      if (!e.message.includes("no rows in result set")) throw e;
    }
  },
);
