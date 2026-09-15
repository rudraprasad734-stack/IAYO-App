/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // ------------------------------------------------------------------
    // users auth collection — citizens (OTP) + presidents (President ID) + admins
    // ------------------------------------------------------------------
    let users;
    try {
      users = app.findCollectionByNameOrId("users");
    } catch (_) {
      users = new Collection({
        type: "auth",
        name: "users",
        fields: [{ name: "name", type: "text", max: 100 }],
        passwordAuth: { enabled: true },
      });
      app.save(users);
    }

    if (!users.fields.getByName("role")) {
      users.fields.add(
        new SelectField({
          name: "role",
          required: true,
          maxSelect: 1,
          values: ["citizen", "president", "admin"],
        }),
      );
    }
    if (!users.fields.getByName("president_id")) {
      users.fields.add(new TextField({ name: "president_id", max: 50 }));
    }
    if (!users.fields.getByName("bio")) {
      users.fields.add(new TextField({ name: "bio", max: 600 }));
    }
    if (!users.fields.getByName("district")) {
      users.fields.add(new TextField({ name: "district", max: 100 }));
    }
    if (!users.fields.getByName("state")) {
      users.fields.add(new TextField({ name: "state", max: 100 }));
    }
    if (!users.fields.getByName("phone")) {
      users.fields.add(new TextField({ name: "phone", max: 20 }));
    }

    users.passwordAuth.enabled = true;
    users.passwordAuth.identityFields = ["email"];
    users.otp.enabled = true;
    users.otp.duration = 300;
    users.otp.length = 6;
    users.authAlert.enabled = false;

    const pw = users.fields.getByName("password");
    if (pw) pw.min = Math.max(pw.min || 0, 10);

    users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'";
    users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'";
    users.createRule = "@request.auth.role = 'admin'";
    users.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'";
    users.deleteRule = "@request.auth.role = 'admin'";
    app.save(users);

    // ------------------------------------------------------------------
    // research — articles & reports (president/admin author, public reads published)
    // ------------------------------------------------------------------
    let research;
    try {
      research = app.findCollectionByNameOrId("research");
    } catch (_) {
      research = new Collection({
        type: "base",
        name: "research",
        listRule:
          "status = 'published' || @request.auth.id = author || @request.auth.role = 'admin'",
        viewRule:
          "status = 'published' || @request.auth.id = author || @request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'president' || @request.auth.role = 'admin'",
        updateRule: "@request.auth.id = author || @request.auth.role = 'admin'",
        deleteRule: "@request.auth.id = author || @request.auth.role = 'admin'",
        fields: [
          { name: "title", type: "text", required: true, max: 300 },
          { name: "category", type: "text", required: true, max: 80 },
          { name: "summary", type: "text", required: true, max: 500 },
          { name: "body", type: "editor" },
          { name: "cover", type: "text", max: 500 },
          { name: "author", type: "relation", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
          { name: "status", type: "select", required: true, maxSelect: 1, values: ["draft", "published"] },
          { name: "featured", type: "bool" },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
      app.save(research);
    }

    // ------------------------------------------------------------------
    // investigations — video, documents, images, evidence, reports
    // ------------------------------------------------------------------
    let investigations;
    try {
      investigations = app.findCollectionByNameOrId("investigations");
    } catch (_) {
      investigations = new Collection({
        type: "base",
        name: "investigations",
        listRule:
          "status = 'published' || @request.auth.id = author || @request.auth.role = 'admin'",
        viewRule:
          "status = 'published' || @request.auth.id = author || @request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'president' || @request.auth.role = 'admin'",
        updateRule: "@request.auth.id = author || @request.auth.role = 'admin'",
        deleteRule: "@request.auth.id = author || @request.auth.role = 'admin'",
        fields: [
          { name: "title", type: "text", required: true, max: 300 },
          { name: "category", type: "text", required: true, max: 80 },
          { name: "summary", type: "text", required: true, max: 600 },
          { name: "body", type: "editor" },
          { name: "video_url", type: "url", max: 500 },
          { name: "images", type: "file", maxSelect: 10, maxSize: 26214400, mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"] },
          { name: "documents", type: "file", maxSelect: 10, maxSize: 26214400, mimeTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"] },
          { name: "evidence", type: "file", maxSelect: 10, maxSize: 26214400 },
          { name: "reports", type: "file", maxSelect: 10, maxSize: 26214400, mimeTypes: ["application/pdf"] },
          { name: "author", type: "relation", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
          { name: "status", type: "select", required: true, maxSelect: 1, values: ["draft", "published"] },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
      app.save(investigations);
    }

    // ------------------------------------------------------------------
    // site_stats — dynamic hero statistics (admin-managed)
    // ------------------------------------------------------------------
    let siteStats;
    try {
      siteStats = app.findCollectionByNameOrId("site_stats");
    } catch (_) {
      siteStats = new Collection({
        type: "base",
        name: "site_stats",
        listRule: "",
        viewRule: "",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
          { name: "key", type: "text", required: true, max: 60 },
          { name: "label", type: "text", required: true, max: 120 },
          { name: "value", type: "text", required: true, max: 60 },
          { name: "sort", type: "number", onlyInt: true },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
      app.save(siteStats);
    }

    // ------------------------------------------------------------------
    // notifications — public updates (admin/president authored)
    // ------------------------------------------------------------------
    let notifications;
    try {
      notifications = app.findCollectionByNameOrId("notifications");
    } catch (_) {
      notifications = new Collection({
        type: "base",
        name: "notifications",
        listRule: "",
        viewRule: "",
        createRule: "@request.auth.role = 'admin' || @request.auth.role = 'president'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
          { name: "title", type: "text", required: true, max: 200 },
          { name: "body", type: "text", required: true, max: 600 },
          { name: "type", type: "select", required: true, maxSelect: 1, values: ["update", "alert", "investigation", "research", "event"] },
          { name: "link", type: "text", max: 300 },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
      app.save(notifications);
    }

    // ------------------------------------------------------------------
    // seed admin + president accounts
    // ------------------------------------------------------------------
    let admin;
    try {
      admin = app.findAuthRecordByEmail("users", "admin@iayo.in");
    } catch (_) {
      admin = new Record(users);
      admin.setEmail("admin@iayo.in");
      admin.setPassword("IAYO@Admin2026");
      admin.set("name", "IAYO Administrator");
      admin.set("role", "admin");
      admin.set("president_id", "IAYO-ADMIN-001");
      admin.set("verified", true);
      app.save(admin);
    }

    let president;
    try {
      president = app.findAuthRecordByEmail("users", "president@iayo.in");
    } catch (_) {
      president = new Record(users);
      president.setEmail("president@iayo.in");
      president.setPassword("IAYO@President2026");
      president.set("name", "Aarav Mehta");
      president.set("role", "president");
      president.set("president_id", "IAYO-PRES-001");
      president.set("district", "New Delhi");
      president.set("state", "Delhi");
      president.set("bio", "National President, IAYO. Leading transparency and accountability research across districts.");
      president.set("verified", true);
      app.save(president);
    }

    // ------------------------------------------------------------------
    // seed site_stats
    // ------------------------------------------------------------------
    const stats = [
      { key: "members", label: "Members Joined", value: "12,481", sort: 1 },
      { key: "districts", label: "Districts Reached", value: "42+", sort: 2 },
      { key: "rtis", label: "RTIs Filed", value: "213", sort: 3 },
      { key: "corruption", label: "Corruption Identified", value: "₹12.2 Cr+", sort: 4 },
    ];
    for (const s of stats) {
      let exists = false;
      try {
        app.findFirstRecordByFilter("site_stats", `key = "${s.key}"`);
        exists = true;
      } catch (_) {}
      if (!exists) {
        const rec = new Record(siteStats);
        rec.set("key", s.key);
        rec.set("label", s.label);
        rec.set("value", s.value);
        rec.set("sort", s.sort);
        app.save(rec);
      }
    }

    // ------------------------------------------------------------------
    // seed notifications
    // ------------------------------------------------------------------
    const notifs = [
      { title: "New investigation published: Public Distribution System leaks", body: "IAYO field teams document diversion of ration supplies across three districts.", type: "investigation", link: "/investigations" },
      { title: "213rd RTI filed this year", body: "The transparency cell filed 14 new RTI applications targeting municipal expenditure.", type: "update", link: "/transparency" },
      { title: "Youth research fellowship open", body: "Applications for the 2027 IAYO Research Fellowship are now open to members.", type: "event", link: "/research" },
    ];
    for (const n of notifs) {
      let exists = false;
      try {
        app.findFirstRecordByFilter("notifications", `title = "${n.title}"`);
        exists = true;
      } catch (_) {}
      if (!exists) {
        const rec = new Record(notifications);
        rec.set("title", n.title);
        rec.set("body", n.body);
        rec.set("type", n.type);
        rec.set("link", n.link);
        app.save(rec);
      }
    }

    // ------------------------------------------------------------------
    // seed research articles
    // ------------------------------------------------------------------
    const articles = [
      {
        title: "Mapping Municipal Expenditure: Where the Money Goes",
        category: "Accountability",
        summary: "A district-level analysis of municipal budgets across 12 cities, tracking the gap between sanctioned spend and on-ground delivery.",
        body: "<h2>Overview</h2><p>This study examines municipal budget allocations versus actual expenditure across 12 Indian cities between 2021 and 2025.</p><h2>Methodology</h2><p>Requests were filed under the Right to Information Act to obtain quarterly expenditure reports. Data was normalised against population and service-area benchmarks.</p><h2>Findings</h2><p>On average, 31% of sanctioned capital expenditure remained unspent at fiscal year-end, with significant variance between wards.</p>",
        status: "published",
        featured: true,
      },
      {
        title: "RTI Compliance Index 2026",
        category: "Transparency",
        summary: "Which public authorities answer citizens fastest — and which stay silent. A compliance index built from 213 RTI responses.",
        body: "<h2>Overview</h2><p>The RTI Compliance Index ranks public authorities by response rate, timeliness, and completeness of disclosures.</p><h2>Methodology</h2><p>Each of 213 filed RTIs was scored on three axes: whether a response was received, whether it arrived within the statutory 30 days, and whether it substantively answered the query.</p>",
        status: "published",
        featured: true,
      },
      {
        title: "Youth Employment Guarantee: A Fiscal Feasibility Study",
        category: "Research",
        summary: "Modelling the cost and coverage of a one-year employment guarantee for graduates under 30, district by district.",
        body: "<h2>Overview</h2><p>This paper models the fiscal cost of a Youth Employment Guarantee using NSSO labour-force data and state budget envelopes.</p>",
        status: "published",
        featured: false,
      },
    ];
    for (const a of articles) {
      let exists = false;
      try {
        app.findFirstRecordByFilter("research", `title = "${a.title}"`);
        exists = true;
      } catch (_) {}
      if (!exists) {
        const rec = new Record(research);
        rec.set("title", a.title);
        rec.set("category", a.category);
        rec.set("summary", a.summary);
        rec.set("body", a.body);
        rec.set("author", president.id);
        rec.set("status", a.status);
        rec.set("featured", a.featured);
        app.save(rec);
      }
    }

    // ------------------------------------------------------------------
    // seed investigations
    // ------------------------------------------------------------------
    const invs = [
      {
        title: "Public Distribution System: Tracking Ration Diversion",
        category: "Investigation",
        summary: "Field investigation into the diversion of subsidised foodgrains across three districts, with documentary evidence and sworn testimonies.",
        body: "<h2>Overview</h2><p>IAYO field teams tracked the movement of subsidised foodgrains from fair-price shops to private resale channels.</p><h2>Evidence</h2><p>Attached documents include shop ledgers, transport receipts, and recorded testimonies of beneficiaries denied their entitlement.</p>",
        video_url: "",
        status: "published",
      },
      {
        title: "Road Contract Irregularities: District X",
        category: "Investigation",
        summary: "An investigation into inflated road-contract billing, comparing tender documents with on-ground measurement of completed works.",
        body: "<h2>Overview</h2><p>This investigation compares awarded road-contract values against independently measured completed work.</p>",
        video_url: "",
        status: "published",
      },
    ];
    for (const it of invs) {
      let exists = false;
      try {
        app.findFirstRecordByFilter("investigations", `title = "${it.title}"`);
        exists = true;
      } catch (_) {}
      if (!exists) {
        const rec = new Record(investigations);
        rec.set("title", it.title);
        rec.set("category", it.category);
        rec.set("summary", it.summary);
        rec.set("body", it.body);
        rec.set("video_url", it.video_url);
        rec.set("author", president.id);
        rec.set("status", it.status);
        app.save(rec);
      }
    }
  },
  (app) => {
    for (const name of ["investigations", "research", "notifications", "site_stats"]) {
      try {
        app.delete(app.findCollectionByNameOrId(name));
      } catch (e) {
        if (!e.message.includes("no rows in result set")) throw e;
      }
    }
  },
);
