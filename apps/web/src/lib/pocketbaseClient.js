import Pocketbase from 'pocketbase';

// Set VITE_POCKETBASE_URL in a .env file at build time (e.g. https://iayo.pockethost.io)
// Falls back to '/hcgi/platform' which only works inside Hostinger Horizons.
const POCKETBASE_API_URL = import.meta.env.VITE_POCKETBASE_URL || '/hcgi/platform';

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient };
