import pb from '../utils/pocketbaseClient.js';

// Public membership verification. The server-side client authenticates as
// superuser (bypassing list/view rules), so the raw member record — which
// contains PII (phone, email) — is never exposed to the browser. Only
// non-sensitive public fields are returned.
export default async (req, res) => {
    const code = req.params.code;
    if (!code) {
        return res.status(422).json({ valid: false, error: 'membership code is required' });
    }

    let record;
    try {
        record = await pb
            .collection('members')
            .getFirstListItem(`membership_code = "${code}"`);
    } catch (_) {
        return res.status(404).json({ valid: false });
    }

    res.json({
        valid: record.status === 'active',
        name: record.full_name,
        status: record.status,
        registered: record.created,
        state: record.state,
        district: record.district,
        membership_code: record.membership_code,
    });
};
