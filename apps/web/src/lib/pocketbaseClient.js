import Pocketbase from 'pocketbase';

// Set VITE_POCKETBASE_URL in a .env file at build time (e.g. https://iayo.pockethost.io)
// Falls back to '/hcgi/platform' which only works inside Hostinger Horizons.
const POCKETBASE_API_URL = import.meta.env.VITE_POCKETBASE_URL || '/hcgi/platform';

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

// The SDK auto-cancels an in-flight request when another request targets
// the same collection, on the assumption that the newer call supersedes the
// older one (e.g. a search box re-querying as the user types). That doesn't
// hold here: the header's own research/notifications fetch runs independent
// of whatever the current page also fetches from those same collections, so
// the header's request kept losing the race and silently never loading —
// confirmed live (the "Latest Articles" ticker and notification badge never
// populated on any page that also fetches research/notifications itself).
pocketbaseClient.autoCancellation(false);

export default pocketbaseClient;

export { pocketbaseClient };
