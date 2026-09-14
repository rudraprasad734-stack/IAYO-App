/// <reference path="../pb_data/types.d.ts" />

/*
 * Security fix: `investigations.evidence` was created in
 * 1775800000_iayo_setup.js with no `mimeTypes` restriction, unlike every
 * other file field in the schema (images, documents, reports, and the
 * equivalent findings.evidence field, all of which restrict mimeTypes).
 * That let any authorised uploader (Admin or President) attach a file of
 * any type — including HTML/SVG/script content — to a collection whose
 * records can end up publicly `status = 'published'`, with no equivalent
 * safeguard to the sibling fields.
 *
 * Align it with findings.evidence's existing allow-list (pdf/png/jpeg/webp),
 * which already covers the realistic evidence formats (scanned/photographed
 * documents); investigations already has dedicated `images`/`documents`/
 * `reports` fields for other formats, and video evidence is linked via the
 * separate `video_url` text field, not a file upload.
 */
migrate(
  (app) => {
    const investigations = app.findCollectionByNameOrId("investigations");
    const evidence = investigations.fields.getByName("evidence");
    if (evidence) {
      evidence.mimeTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp",
      ];
      app.save(investigations);
    }
  },
  (app) => {
    const investigations = app.findCollectionByNameOrId("investigations");
    const evidence = investigations.fields.getByName("evidence");
    if (evidence) {
      evidence.mimeTypes = [];
      app.save(investigations);
    }
  },
);
