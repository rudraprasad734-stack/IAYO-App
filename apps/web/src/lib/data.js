import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

export async function fetchStats() {
    const rows = await pb.collection('site_stats').getFullList({ sort: 'sort' });
    return rows.map((r) => ({
        id: r.id,
        key: r.key,
        label: r.label,
        value: r.value,
        sort: r.sort,
    }));
}

export async function fetchResearch({ filter = '', page = 1, perPage = 12 } = {}) {
    const base = "status = 'published'";
    const f = filter ? `${base} && (${filter})` : base;
    return pb.collection('research').getList(page, perPage, {
        sort: '-created',
        filter: f,
        expand: 'author',
    });
}

export async function fetchResearchByCategory(category) {
    return fetchResearch({ filter: `category = "${category}"` });
}

export async function fetchResearchItem(id) {
    return pb.collection('research').getOne(id, { expand: 'author' });
}

export async function fetchAllResearchForStaff() {
    return pb.collection('research').getFullList({ sort: '-created', expand: 'author' });
}

export async function fetchInvestigations({ filter = '', page = 1, perPage = 12 } = {}) {
    const base = "status = 'published'";
    const f = filter ? `${base} && (${filter})` : base;
    return pb.collection('investigations').getList(page, perPage, {
        sort: '-created',
        filter: f,
        expand: 'author',
    });
}

export async function fetchInvestigationItem(id) {
    return pb.collection('investigations').getOne(id, { expand: 'author' });
}

export async function fetchAllInvestigationsForStaff() {
    return pb.collection('investigations').getFullList({ sort: '-created', expand: 'author' });
}

export async function fetchNotifications({ publishedOnly = false, perPage = null } = {}) {
    const options = { sort: '-created' };
    if (publishedOnly) options.filter = "status = 'published'";
    if (perPage) {
        const result = await pb.collection('notifications').getList(1, perPage, options);
        return result.items;
    }
    return pb.collection('notifications').getFullList(options);
}

/**
 * Homepage metrics are returned by a server-side aggregate endpoint.
 * This keeps private records private while ensuring every displayed figure
 * is calculated from the current PocketBase database rather than hard-coded.
 */
export async function fetchHomepageMetrics() {
    // Use the same configured PocketBase base URL as every other call in this
    // file (pb.buildURL honours VITE_POCKETBASE_URL). The previous hardcoded
    // '/hcgi/platform/...' path only resolves inside Hostinger Horizons — on
    // any other deployment (including local dev, per SETUP_GUIDE) it hit the
    // SPA's own dev server, got back index.html instead of JSON, and silently
    // left every "Live Impact Metrics" tile blank.
    const response = await window.fetch(pb.buildURL('/api/homepage-metrics'), { method: 'GET' });
    if (!response.ok) throw new Error('Homepage metrics unavailable');
    return response.json();
}

export async function submitResearchApplication(payload) {
    const response = await window.fetch('/hcgi/platform/api/research-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || 'Could not submit the research application.');
    return data;
}

export async function fetchResearchApplications() {
    return pb.collection('research_applications').getFullList({ sort: '-created', expand: 'reviewed_by' });
}


export async function submitContribution(formData) {
    return pb.collection('contributions').create(formData);
}

export async function fetchContributions() {
    return pb.collection('contributions').getFullList({ sort: '-created', filter: "status != 'rejected'" });
}

export async function fetchUsers() {
    return pb.collection('users').getFullList({ sort: '-created' });
}

export function fileUrl(record, filename, thumb) {
    if (!record || !filename) return '';
    return pb.files.getUrl(record, filename, thumb ? { thumb } : undefined);
}

// contributions.files is a protected field (see 1788861210_protect_contribution_files.js):
// PocketBase only enforces the collection's viewRule on /api/files/... requests for
// protected fields, and only when the URL carries a short-lived file token.
export async function protectedFileUrl(record, filename) {
    if (!record || !filename) return '';
    const token = await pb.files.getToken();
    return pb.files.getUrl(record, filename, { token });
}

export function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

// ---- Corruption findings ----
export async function fetchFindings({ filter = '', page = 1, perPage = 12 } = {}) {
    const base = "status = 'published'";
    const f = filter ? `${base} && (${filter})` : base;
    return pb.collection('findings').getList(page, perPage, {
        sort: '-created',
        filter: f,
        expand: 'author,related_rti,related_research,related_video',
    });
}

export async function fetchFindingItem(id) {
    return pb.collection('findings').getOne(id, {
        expand: 'author,related_rti,related_research,related_video',
    });
}

// ---- RTI transparency ----
export async function fetchRti({ filter = '', page = 1, perPage = 12 } = {}) {
    const base = "status = 'published' || status = 'reply_received' || status = 'awaiting_reply'";
    const f = filter ? `${base} && (${filter})` : base;
    return pb.collection('rti_cases').getList(page, perPage, {
        sort: '-created',
        filter: f,
        expand: 'author,related_finding,related_research,related_video',
    });
}

export async function fetchRtiItem(id) {
    return pb.collection('rti_cases').getOne(id, {
        expand: 'author,related_finding,related_research,related_video',
    });
}

// ---- Citizen voices / comments ----
export async function fetchApprovedComments({ page = 1, perPage = 50 } = {}) {
    return pb.collection('comments').getList(page, perPage, {
        sort: '-created',
        filter: "status = 'approved'",
    });
}

export async function submitComment(payload) {
    return pb.collection('comments').create({
        ...payload,
        status: 'pending',
    });
}

// ---- Membership ----
const STATE_CODES = {
    'Andhra Pradesh': 'AP', 'Arunachal Pradesh': 'AR', 'Assam': 'AS', 'Bihar': 'BR',
    'Chhattisgarh': 'CG', 'Goa': 'GA', 'Gujarat': 'GJ', 'Haryana': 'HR', 'Himachal Pradesh': 'HP',
    'Jharkhand': 'JH', 'Karnataka': 'KA', 'Kerala': 'KL', 'Madhya Pradesh': 'MP',
    'Maharashtra': 'MH', 'Manipur': 'MN', 'Meghalaya': 'ML', 'Mizoram': 'MZ',
    'Nagaland': 'NL', 'Odisha': 'OD', 'Punjab': 'PB', 'Rajasthan': 'RJ', 'Sikkim': 'SK',
    'Tamil Nadu': 'TN', 'Telangana': 'TG', 'Tripura': 'TR', 'Uttar Pradesh': 'UP',
    'Uttarakhand': 'UK', 'West Bengal': 'WB', 'Delhi': 'DL', 'Jammu and Kashmir': 'JK',
    'Ladakh': 'LA', 'Chandigarh': 'CH', 'Puducherry': 'PY', 'Andaman and Nicobar Islands': 'AN',
    'Dadra and Nagar Haveli and Daman and Diu': 'DH', 'Lakshadweep': 'LD',
};

export function stateCode(state) {
    if (!state) return 'IN';
    return STATE_CODES[state] || state.slice(0, 2).toUpperCase();
}

export function generateMembershipCode(state) {
    const rand = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const padded = rand.padEnd(6, '0');
    return `IAYO-2026-${stateCode(state)}-${padded}`;
}

export async function submitMembership(payload) {
    return pb.collection('members').create({
        ...payload,
        status: 'active',
        consent: true,
    });
}

// ---- Membership verification (sanitized server-side endpoint) ----
export async function verifyMembership(code) {
    const res = await apiServerClient.fetch(`/verify/${encodeURIComponent(code)}`, {
        method: 'GET',
    });
    if (!res.ok && res.status !== 404) {
        throw new Error('Verification service unavailable');
    }
    return res.json();
}

// ---- Staff (president/admin): full lists across every managed collection ----
export async function fetchAllFindingsForStaff() {
    return pb.collection('findings').getFullList({ sort: '-created', expand: 'author' });
}
export async function fetchAllRtiForStaff() {
    return pb.collection('rti_cases').getFullList({ sort: '-created', expand: 'author' });
}
export async function fetchAllCommentsForStaff() {
    return pb.collection('comments').getFullList({ sort: '-created' });
}
export async function fetchAllMembers() {
    return pb.collection('members').getFullList({ sort: '-created' });
}
export async function fetchAuditLogs({ page = 1, perPage = 60 } = {}) {
    return pb.collection('audit_log').getList(page, perPage, {
        sort: '-created',
        expand: 'actor',
    });
}
export async function logAudit(payload) {
    return pb.collection('audit_log').create(payload);
}
