// TEMPORARY — FOR TESTING ONLY, before real citizens/admins/a president
// exist on a live deployment.
//
// Lets the President/Admin/Member login pages skip straight to the
// relevant dashboard using a real, fully-authenticated session against an
// existing test account — no PocketBase access rule is changed anywhere,
// so none of the app's existing security is weakened. President MFA still
// applies: auto-login fills the credentials and lands on the OTP step, it
// does not bypass the emailed code.
//
// This is inert wherever the accounts/passwords below don't exist (e.g. a
// real deployment with real users) — authWithPassword just fails and the
// normal manual login form shows, same as if this file didn't exist.
//
// Remove this file and its call sites in PresidentLoginPage.jsx,
// AdminLoginPage.jsx and CitizenLoginPage.jsx once real users are signing
// in for real — auto-login must never be a way into production.
export const DEV_AUTO_LOGIN = true;

export const DEV_TEST_ACCOUNTS = {
    president: { identity: 'president@iayo-test.in', password: 'Demo12345!' },
    admin: { adminId: 'IAYO-ADMIN-001', password: 'Demo12345!' },
    citizen: { identity: 'citizen-demo@iayo.local', password: 'Demo12345!' },
};
