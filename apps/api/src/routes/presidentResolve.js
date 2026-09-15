import pb from '../utils/pocketbaseClient.js';

// Resolve a President ID to the account email so the client can authenticate
// with authWithPassword(email, password). The server-side client authenticates
// as superuser, so it bypasses list/view rules. Only the email is returned.
export default async (req, res) => {
    const presidentId = req.query.president_id;
    if (!presidentId) {
        return res.status(422).json({ error: 'president_id query param is required' });
    }

    let record;
    try {
        record = await pb.collection('users').getFirstListItem(
            pb.filter('president_id = {:presidentId}', { presidentId }),
        );
    } catch (_) {
        return res.status(404).json({ error: 'President not found' });
    }

    res.json({ email: record.email });
};
