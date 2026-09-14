/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    let applications;
    try {
      applications = app.findCollectionByNameOrId("research_applications");
    } catch (_) {
      applications = new Collection({
        type: "base",
        name: "research_applications",
        listRule: "@request.auth.role = 'president'",
        viewRule: "@request.auth.role = 'president'",
        createRule: null,
        updateRule: "@request.auth.role = 'president'",
        deleteRule: "@request.auth.role = 'president'",
        fields: [],
      });
      app.save(applications);
    }

    const users = app.findCollectionByNameOrId("users");
    const add = (field) => {
      if (!applications.fields.getByName(field.name)) applications.fields.add(field);
    };

    add(new TextField({ name: "name", required: true, max: 160 }));
    add(new TextField({ name: "phone", required: true, max: 30 }));
    add(new EmailField({ name: "email", required: true, max: 200 }));
    add(new TextField({ name: "field_of_interest", required: true, max: 200 }));
    add(new TextField({ name: "area", required: true, max: 200 }));
    add(new TextField({ name: "education_qualification", required: true, max: 200 }));
    add(new TextField({ name: "motivation", required: true, max: 2000 }));
    add(new BoolField({ name: "oath_agreed", required: true }));
    add(new SelectField({
      name: "status",
      required: true,
      maxSelect: 1,
      values: ["pending", "approved", "rejected"],
    }));
    add(new TextField({ name: "president_note", max: 2000 }));
    add(new DateField({ name: "reviewed_at" }));
    add(new RelationField({
      name: "reviewed_by",
      maxSelect: 1,
      collectionId: users.id,
    }));

    applications.listRule = "@request.auth.role = 'president'";
    applications.viewRule = "@request.auth.role = 'president'";
    applications.createRule = null;
    applications.updateRule = "@request.auth.role = 'president'";
    applications.deleteRule = "@request.auth.role = 'president'";
    app.save(applications);
  },
  (app) => {
    // Do not delete applicant records on rollback. They are submitted records
    // and must remain recoverable in a production environment.
  },
);
