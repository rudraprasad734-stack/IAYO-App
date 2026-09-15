// Set VITE_API_URL in a .env file at build time (e.g. https://api.iayoparty.org)
// Falls back to '/hcgi/api' which only works inside Hostinger Horizons.
export const API_SERVER_URL = import.meta.env.VITE_API_URL || '/hcgi/api';

const apiServerClient = {
    fetch: async (url, options = {}) => {
        return await window.fetch(API_SERVER_URL + url, options);
    }
};

export default apiServerClient;

export { apiServerClient };
