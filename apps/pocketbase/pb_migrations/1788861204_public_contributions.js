/// <reference path="../pb_data/types.d.ts" />

/*
 * Public contribution intake.
 *
 * Anyone may submit research material, evidence, RTI documents or videos.
 * Records are private to the President and remain pending until reviewed.
 * Admins cannot read, alter, delete or publish these submissions.
 */

migrate(
  (app) => {
    let contributions;
    try {
      contributions = app.findCollectionByNameOrId("contributions");
    } catch (_) {
      contributions = new Collection({
        type: "base",
        name: "contributions",
        listRule: "@request.auth.role = 'president'",
        viewRule: "@request.auth.role = 'president'",
        createRule: "",
        updateRule: "@request.auth.role = 'president'",
        deleteRule: "@request.auth.role = 'president'",
        fields: [],
      });
      app.save(contributions);
    }

    const add = (field) => {
      if (!contributions.fields.getByName(field.name)) contributions.fields.add(field);
    };

    add(new TextField({ name: "name", required: true, max: 160 }));
    add(new TextField({ name: "phone", required: true, max: 30 }));
    add(new EmailField({ name: "email", required: true, max: 200 }));
    add(new TextField({ name: "title", required: true, max: 300 }));
    add(new SelectField({
      name: "contribution_type",
      required: true,
      maxSelect: 1,
      values: ["research_material", "evidence", "rti", "video", "other"],
    }));
    add(new TextField({ name: "area", required: true, max: 240 }));
    add(new TextField({ name: "description", required: true, max: 5000 }));
    add(new TextField({ name: "source_note", max: 3000 }));
    add(new FileField({
      name: "files",
      required: true,
      maxSelect: 8,
      maxSize: 52428800,
      mimeTypes: [
        "application/pdf",
        "video/mp4",
        "video/quicktime",
        "video/webm",
        "video/x-m4v",
        "video/x-msvideo",
      ],
    }));
    add(new BoolField({ name: "consent_agreed", required: true }));
    add(new TextField({ name: "website", max: 200 }));
    add(new SelectField({
      name: "status",
      required: true,
      maxSelect: 1,
      values: ["pending", "approved", "rejected"],
    }));
    add(new TextField({ name: "president_note", max: 3000 }));
    add(new DateField({ name: "reviewed_at" }));

    contributions.listRule = "@request.auth.role = 'president'";
    contributions.viewRule = "@request.auth.role = 'president'";
    contributions.createRule = "";
    contributions.updateRule = "@request.auth.role = 'president'";
    contributions.deleteRule = "@request.auth.role = 'president'";
    app.save(contributions);
  },
  (app) => {
    // Preserve submitted material on rollback; production records are not deleted automatically.
  },
);
