# IAYO change log — Public Contributions

## New public contribution system

### Public page
Existing route: `/research/contribute`

The Research & Contribute page now provides two separate workflows:

1. Research Contributor Application
2. Submit research, evidence or media

### Material submission
Public users can submit:
- Name
- Phone number
- Email
- Contribution title
- Contribution type
- Area/location
- Description of what the material shows/establishes
- Source/context (optional)
- Up to 8 files
- PDF and video files: PDF, MP4, MOV, WEBM, M4V, AVI
- Maximum 50 MB per file
- Good-faith review/usage confirmation

### Workflow
Public contributor -> PocketBase `contributions` -> pending -> President review -> approved/rejected.

No public contribution is automatically published.

### Privacy/security
- `contributions` list/view: President only.
- `contributions` update/delete: President only.
- Public create is limited by server-side validation in `president-access.pb.js`.
- File type and size limits are enforced by the PocketBase collection schema.
- A hidden honeypot field is checked server-side.

### President notification
On successful contribution creation, the PocketBase hook sends an email notification to the registered President email. The email contains contributor details, title, type, area, description and the uploaded filenames. The actual video/PDF files remain stored in PocketBase and are opened from the President Dashboard rather than being copied into email attachments.

### President Dashboard
New tab: `Public Contributions`.

President can:
- see pending/public contribution submissions
- open/download uploaded files
- review contributor information and context
- add a President note
- Accept Contribution
- Reject

Approved contributions are accepted for IAYO use but are not automatically published to the public website.

### Audit
Public contribution creation is included in the server-side audit tracking list.

## Files changed
- `apps/web/src/pages/ResearchContributePage.jsx`
- `apps/web/src/lib/data.js`
- `apps/web/src/pages/PresidentDashboard.jsx`
- `apps/pocketbase/pb_hooks/president-access.pb.js`
- `apps/pocketbase/pb_hooks/audit-log.pb.js`

## New files
- `apps/pocketbase/pb_migrations/1788861204_public_contributions.js`
- `IAYO_CHANGELOG.md`

## Validation performed
- Node syntax check passed for the modified PocketBase hook, audit hook and new migration.
- Fresh PocketBase migration run passed through `1788861204_public_contributions.js`.
- A live local PocketBase test successfully created a public contribution containing a PDF; the record stored the uploaded filename and `pending` status.
- Full React production build was not completed in this environment because the project's npm dependency installation was unavailable/timed out. Do not treat this as a completed production build test.

## Headquarters details update — 2026-09-09
- Replaced the previous Headquarters address with: House No. 159, Lower Sripatam, Yangang, Namchi District, Sikkim.
- Removed the statement: "Registered with the Election Commission of India".
- Updated homepage quote attribution: removed “Rudra, Darjeeling” and changed it to “Founder Rudra Prasad Sharma”.


## 2026-09-10 — Direct integration into newly uploaded project

- Applied the complete IAYO President/Admin, live metrics, news/announcements, Research & Contribute, public contribution and review workflow to the newly uploaded project tree.
- Preserved the uploaded project-specific PocketBase hooks `superusers-allow-list.js` and `superusers.pb.js`.
- Removed the separate President ID from the President setup UI and setup API; the registered email is the President authentication identity. The legacy `president_id` database field remains only for backward compatibility and is not used for authentication or setup.
- Kept the one-President database uniqueness protection in the Admin workflow migration itself; no missing `1788861200` migration is required.
- Preserved existing production-data safety: no `pb_data` directory was supplied or overwritten by this integration.
