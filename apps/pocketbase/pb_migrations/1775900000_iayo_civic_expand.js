/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const research = app.findCollectionByNameOrId("research");
    const investigations = app.findCollectionByNameOrId("investigations");

    // ------------------------------------------------------------------
    // members — public registration, PII private by default
    // ------------------------------------------------------------------
    let members;
    try {
      members = app.findCollectionByNameOrId("members");
    } catch (_) {
      members = new Collection({
        type: "base",
        name: "members",
        // Public can submit; only admins can list/view full records.
        // Public verification goes through a sanitized Express endpoint (superuser).
        listRule: "@request.auth.role = 'admin'",
        viewRule: "@request.auth.role = 'admin'",
        createRule: "",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
          { name: "full_name", type: "text", required: true, max: 120 },
          { name: "phone", type: "text", required: true, max: 20 },
          { name: "email", type: "text", max: 200 },
          { name: "state", type: "text", required: true, max: 100 },
          { name: "district", type: "text", required: true, max: 100 },
          { name: "town", type: "text", required: true, max: 120 },
          {
            name: "age_group",
            type: "select",
            maxSelect: 1,
            values: ["18-25", "26-35", "36-45", "46-60", "60+"],
          },
          { name: "occupation", type: "text", max: 120 },
          { name: "membership_code", type: "text", required: true, max: 40 },
          {
            name: "status",
            type: "select",
            maxSelect: 1,
            values: ["active", "inactive"],
          },
          { name: "consent", type: "bool" },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
        indexes: [
          "CREATE UNIQUE INDEX `idx_members_code` ON `members` (`membership_code`)",
        ],
      });
      app.save(members);
    }

    // ------------------------------------------------------------------
    // rti_cases — RTI transparency database (created before findings so
    // findings can relation-link to it; the reverse link is added after).
    // ------------------------------------------------------------------
    let rti;
    try {
      rti = app.findCollectionByNameOrId("rti_cases");
    } catch (_) {
      rti = new Collection({
        type: "base",
        name: "rti_cases",
        listRule:
          "status = 'published' || @request.auth.id = author || @request.auth.role = 'admin'",
        viewRule:
          "status = 'published' || @request.auth.id = author || @request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'president' || @request.auth.role = 'admin'",
        updateRule: "@request.auth.id = author || @request.auth.role = 'admin'",
        deleteRule: "@request.auth.id = author || @request.auth.role = 'admin'",
        fields: [
          { name: "rti_id", type: "text", required: true, max: 60 },
          { name: "title", type: "text", required: true, max: 300 },
          { name: "department", type: "text", required: true, max: 160 },
          { name: "public_authority", type: "text", max: 160 },
          { name: "state", type: "text", max: 100 },
          { name: "district", type: "text", max: 100 },
          { name: "date_filed", type: "date" },
          { name: "reply_date", type: "date" },
          { name: "summary", type: "text", required: true, max: 800 },
          { name: "key_findings", type: "text", max: 1000 },
          { name: "appeal_info", type: "text", max: 600 },
          {
            name: "application_pdf",
            type: "file",
            maxSelect: 1,
            maxSize: 26214400,
            mimeTypes: ["application/pdf"],
          },
          {
            name: "reply_pdf",
            type: "file",
            maxSelect: 1,
            maxSize: 26214400,
            mimeTypes: ["application/pdf"],
          },
          {
            name: "appeal_pdf",
            type: "file",
            maxSelect: 1,
            maxSize: 26214400,
            mimeTypes: ["application/pdf"],
          },
          {
            name: "status",
            type: "select",
            required: true,
            maxSelect: 1,
            values: ["filed", "awaiting_reply", "reply_received", "published", "appeal_filed", "resolved"],
          },
          {
            name: "related_research",
            type: "relation",
            maxSelect: 5,
            collectionId: research.id,
          },
          {
            name: "related_video",
            type: "relation",
            maxSelect: 5,
            collectionId: investigations.id,
          },
          {
            name: "author",
            type: "relation",
            required: true,
            maxSelect: 1,
            collectionId: users.id,
            cascadeDelete: true,
          },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
      app.save(rti);
    }

    // ------------------------------------------------------------------
    // findings — corruption findings (allegation vs verified distinction)
    // ------------------------------------------------------------------
    let findings;
    try {
      findings = app.findCollectionByNameOrId("findings");
    } catch (_) {
      findings = new Collection({
        type: "base",
        name: "findings",
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
          { name: "department", type: "text", max: 160 },
          { name: "location", type: "text", max: 160 },
          { name: "finding_date", type: "date" },
          { name: "summary", type: "text", required: true, max: 800 },
          { name: "body", type: "editor" },
          {
            name: "nature",
            type: "select",
            required: true,
            maxSelect: 1,
            values: ["allegation", "verified", "documented_fact", "iayo_analysis"],
          },
          {
            name: "status",
            type: "select",
            required: true,
            maxSelect: 1,
            values: ["under_research", "evidence_collected", "rti_filed", "rti_reply_received", "published", "referred", "resolved", "closed"],
          },
          {
            name: "evidence",
            type: "file",
            maxSelect: 10,
            maxSize: 26214400,
            mimeTypes: ["application/pdf", "image/png", "image/jpeg", "image/webp"],
          },
          {
            name: "photos",
            type: "file",
            maxSelect: 10,
            maxSize: 26214400,
            mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
          },
          { name: "sources", type: "text", max: 1000 },
          { name: "right_of_reply", type: "editor" },
          {
            name: "related_rti",
            type: "relation",
            maxSelect: 5,
            collectionId: rti.id,
          },
          {
            name: "related_research",
            type: "relation",
            maxSelect: 5,
            collectionId: research.id,
          },
          {
            name: "related_video",
            type: "relation",
            maxSelect: 5,
            collectionId: investigations.id,
          },
          {
            name: "author",
            type: "relation",
            required: true,
            maxSelect: 1,
            collectionId: users.id,
            cascadeDelete: true,
          },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
      app.save(findings);
    }

    // Add the reverse relation: rti_cases.related_finding -> findings
    if (!rti.fields.getByName("related_finding")) {
      rti.fields.add(
        new RelationField({
          name: "related_finding",
          maxSelect: 5,
          collectionId: findings.id,
        }),
      );
      app.save(rti);
    }

    // ------------------------------------------------------------------
    // comments — citizen voices with moderation workflow
    // ------------------------------------------------------------------
    let comments;
    try {
      comments = app.findCollectionByNameOrId("comments");
    } catch (_) {
      comments = new Collection({
        type: "base",
        name: "comments",
        // Public reads only approved; admins see all for moderation.
        listRule: "status = 'approved' || @request.auth.role = 'admin'",
        viewRule: "status = 'approved' || @request.auth.role = 'admin'",
        createRule: "",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
          { name: "name", type: "text", required: true, max: 120 },
          { name: "town", type: "text", max: 120 },
          { name: "district", type: "text", max: 100 },
          { name: "state", type: "text", max: 100 },
          { name: "message", type: "text", required: true, max: 800 },
          { name: "consent", type: "bool" },
          {
            name: "status",
            type: "select",
            maxSelect: 1,
            values: ["pending", "approved", "rejected"],
          },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
      app.save(comments);
    }

    // ------------------------------------------------------------------
    // seed demo RTI cases (fictional, clearly marked)
    // ------------------------------------------------------------------
    const president = app.findAuthRecordByEmail("users", "president@iayo.in");

    const rtis = [
      {
        rti_id: "IAYO/RTI/2026/001",
        title: "Municipal Procurement Expenditure — Demo Case",
        department: "Municipal Corporation",
        public_authority: "Office of the Municipal Commissioner",
        state: "West Bengal",
        district: "Kolkata",
        date_filed: "2026-01-14",
        reply_date: "2026-02-09",
        summary:
          "RTI seeking itemised procurement expenditure for road works awarded in Ward 22 across FY2024-25. Reply disclosed a 19% variance between tendered and executed values.",
        key_findings:
          "Reply revealed three contracts exceeded sanctioned value without revised administrative approval. Flagged for follow-up audit.",
        appeal_info: "",
        status: "published",
      },
      {
        rti_id: "IAYO/RTI/2026/002",
        title: "Public Distribution System Stock Registers — Demo Case",
        department: "Department of Food & Public Distribution",
        public_authority: "District Supply Office",
        state: "Bihar",
        district: "Gaya",
        date_filed: "2026-02-03",
        reply_date: "",
        summary:
          "RTI requesting monthly stock registers for 14 fair-price shops. Awaiting reply beyond the statutory 30-day window; first appeal prepared.",
        key_findings: "",
        appeal_info: "First appeal drafted pending expiry of response window.",
        status: "awaiting_reply",
      },
      {
        rti_id: "IAYO/RTI/2026/003",
        title: "Primary School Infrastructure Audit — Demo Case",
        department: "Department of Education",
        public_authority: "District Education Office",
        state: "Uttar Pradesh",
        district: "Varanasi",
        date_filed: "2026-03-11",
        reply_date: "2026-04-02",
        summary:
          "RTI seeking status of toilet and drinking-water infrastructure grants disbursed to 38 government primary schools.",
        key_findings:
          "Reply confirmed 11 of 38 schools had non-functional toilets despite grant utilisation certificates filed.",
        appeal_info: "",
        status: "published",
      },
    ];
    for (const r of rtis) {
      let exists = false;
      try {
        app.findFirstRecordByFilter("rti_cases", `rti_id = "${r.rti_id}"`);
        exists = true;
      } catch (_) {}
      if (!exists) {
        const rec = new Record(rti);
        rec.set("rti_id", r.rti_id);
        rec.set("title", r.title);
        rec.set("department", r.department);
        rec.set("public_authority", r.public_authority);
        rec.set("state", r.state);
        rec.set("district", r.district);
        rec.set("date_filed", r.date_filed);
        rec.set("reply_date", r.reply_date);
        rec.set("summary", r.summary);
        rec.set("key_findings", r.key_findings);
        rec.set("appeal_info", r.appeal_info);
        rec.set("status", r.status);
        rec.set("author", president.id);
        app.save(rec);
      }
    }

    // ------------------------------------------------------------------
    // seed demo findings (fictional, clearly marked, allegation vs verified)
    // ------------------------------------------------------------------
    let rti001;
    try {
      rti001 = app.findFirstRecordByFilter("rti_cases", `rti_id = "IAYO/RTI/2026/001"`);
    } catch (_) {}

    const findingSeeds = [
      {
        title: "Municipal Procurement Review — Demo Case",
        category: "Procurement",
        department: "Municipal Corporation, Ward 22",
        location: "Kolkata, West Bengal",
        finding_date: "2026-02-15",
        summary:
          "A documentary review of road-works procurement in Ward 22. RTI replies indicate variance between tendered and executed contract values. This is an IAYO analysis based on official records, not a judicial finding of corruption against any individual.",
        body: "<h2>Overview</h2><p>This demo finding illustrates how IAYO presents a documentary trail. It is built on official records obtained under the RTI Act.</p><h2>What the records show</h2><p>Three contracts exceeded their sanctioned value without a revised administrative approval on file.</p><h2>What this is NOT</h2><p>This is not a finding of personal corruption. It is a documented variance that warrants audit follow-up.</p>",
        nature: "documented_fact",
        status: "published",
        sources: "RTI reply IAYO/RTI/2026/001; municipal expenditure ledger FY2024-25.",
        right_of_reply:
          "<p>The Municipal Corporation has been invited to respond. Any official response received will be published here unedited.</p>",
      },
      {
        title: "Fair-Price Shop Stock Discrepancy — Demo Case (Under Research)",
        category: "Public Distribution",
        department: "District Supply Office",
        location: "Gaya, Bihar",
        finding_date: "2026-03-01",
        summary:
          "Beneficiaries report denial of entitled foodgrains at two fair-price shops. IAYO is collecting testimonies and has filed an RTI for stock registers. This is currently an ALLEGATION — no verified finding has been made.",
        body: "<h2>Status: Under Research</h2><p>Testimonies have been recorded. Stock registers have been requested via RTI. No conclusion has been reached.</p>",
        nature: "allegation",
        status: "published",
        sources: "Sworn beneficiary testimonies (on file); RTI IAYO/RTI/2026/002 pending.",
        right_of_reply: "<p>The District Supply Officer has been invited to respond.</p>",
      },
    ];
    for (const f of findingSeeds) {
      let exists = false;
      try {
        app.findFirstRecordByFilter("findings", `title = "${f.title}"`);
        exists = true;
      } catch (_) {}
      if (!exists) {
        const rec = new Record(findings);
        rec.set("title", f.title);
        rec.set("category", f.category);
        rec.set("department", f.department);
        rec.set("location", f.location);
        rec.set("finding_date", f.finding_date);
        rec.set("summary", f.summary);
        rec.set("body", f.body);
        rec.set("nature", f.nature);
        rec.set("status", f.status);
        rec.set("sources", f.sources);
        rec.set("right_of_reply", f.right_of_reply);
        rec.set("author", president.id);
        if (rti001) rec.set("related_rti", [rti001.id]);
        app.save(rec);
      }
    }

    // ------------------------------------------------------------------
    // seed approved citizen voices
    // ------------------------------------------------------------------
    const voices = [
      { name: "Sneha Roy", town: "Howrah", district: "Howrah", state: "West Bengal", message: "Transparency begins when citizens start asking questions. IAYO's RTI work gave me the courage to file my first application." },
      { name: "Imran Khan", town: "Gaya", district: "Gaya", state: "Bihar", message: "For the first time, I could see the stock register of my local ration shop. That is what accountability feels like." },
      { name: "Priya Nair", town: "Kochi", district: "Ernakulam", state: "Kerala", message: "Research that respects evidence over rhetoric. This is the kind of politics young India needs." },
      { name: "Rahul Verma", town: "Varanasi", district: "Varanasi", state: "Uttar Pradesh", message: "I downloaded my membership certificate and verified it online. The whole process felt serious and legitimate." },
    ];
    for (const v of voices) {
      let exists = false;
      try {
        app.findFirstRecordByFilter("comments", `message = "${v.message}"`);
        exists = true;
      } catch (_) {}
      if (!exists) {
        const rec = new Record(comments);
        rec.set("name", v.name);
        rec.set("town", v.town);
        rec.set("district", v.district);
        rec.set("state", v.state);
        rec.set("message", v.message);
        rec.set("consent", true);
        rec.set("status", "approved");
        app.save(rec);
      }
    }
  },
  (app) => {
    for (const name of ["comments", "findings", "rti_cases", "members"]) {
      try {
        app.delete(app.findCollectionByNameOrId(name));
      } catch (e) {
        if (!e.message.includes("no rows in result set")) throw e;
      }
    }
  },
);
