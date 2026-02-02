const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "mega-jwels.myshopify.com";
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "7018d1d15983f208ef99107369784a08";
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('shopify_customer_token');
    if (!token) throw new Error("No session found");

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }
    return data;
}

export const authClient = {
    // 1. Send OTP
    sendOTP: async (email) => {
        const response = await fetch('/api/auth/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send', email })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data;
    },

    // 2. Verify OTP & Login
    verifyOTP: async (email, code) => {
        const response = await fetch('/api/auth/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', email, code })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        // Store Session Token (JWT)
        localStorage.setItem('auth_session_token', data.token);
        localStorage.setItem('shopify_customer_token', data.token);

        // SYNC: Merge Server Cart if available
        console.log("[AuthClient] Verify Response Customer:", data.customer);
        if (data.customer?.metafield?.value) {
            console.log("[AuthClient] Found Cart Value:", data.customer.metafield.value);
            try {
                const serverCart = JSON.parse(data.customer.metafield.value);
                const { mergeCart } = await import('./cartClient');
                mergeCart(serverCart);
            } catch (e) {
                console.error("Failed to merge server cart", e);
            }
        }

        window.dispatchEvent(new Event('auth-updated'));
        return data.customer;
    },

    // 3. Get Current User (Uses Proxy or Session)
    getCustomer: async () => {
        const token = localStorage.getItem('shopify_customer_token');
        if (!token) return null;

        try {
            // Parallel fetch: User Profile + Cart Data
            const [userRes, cartRes] = await Promise.all([
                fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/auth/cart', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!userRes.ok) throw new Error("Session invalid");

            const userData = await userRes.json();

            // Sync Cart if available
            if (cartRes.ok) {
                const cartData = await cartRes.json();
                if (cartData.cart && Array.isArray(cartData.cart)) {
                    try {
                        const { setCart } = await import('./cartClient');
                        setCart(cartData.cart);
                    } catch (err) {
                        console.error("Auto-sync cart failed", err);
                    }
                }
            }

            return userData;
        } catch (e) {
            console.error("Auth check failed:", e);
            localStorage.removeItem('shopify_customer_token');
            return null;
        }
    },

    // 4. Update Profile
    updateProfile: async ({ firstName, lastName, phone }) => {
        const data = await authenticatedFetch('/api/auth/me', {
            method: 'PUT',
            body: JSON.stringify({ firstName, lastName, phone })
        });
        return data.customer;
    },

    // 5. Create Address
    createAddress: async (address) => {
        const data = await authenticatedFetch('/api/auth/address', {
            method: 'POST',
            body: JSON.stringify(address)
        });
        return data.address;
    },

    // 6. Update Address
    updateAddress: async (id, address) => {
        const data = await authenticatedFetch('/api/auth/address', {
            method: 'PUT',
            body: JSON.stringify({ id, ...address })
        });
        return data.address;
    },

    // 7. Delete Address
    deleteAddress: async (id) => {
        await authenticatedFetch(`/api/auth/address?id=${id}`, {
            method: 'DELETE'
        });
        return true;
    },

    // 8. Set Default Address
    setDefaultAddress: async (addressId) => {
        await authenticatedFetch('/api/auth/address/default', {
            method: 'PUT',
            body: JSON.stringify({ addressId })
        });
        return true;
    },

    logout: async () => {
        localStorage.removeItem('shopify_customer_token');
        localStorage.removeItem('auth_session_token');

        // Clear local cart on logout to prevent next user accessing it
        try {
            const { clearCart } = await import('./cartClient');
            clearCart();
        } catch (e) { console.error("Error clearing cart on logout", e); }

        window.dispatchEvent(new Event('auth-updated'));
    },

    getToken: () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('shopify_customer_token');
    }
};
