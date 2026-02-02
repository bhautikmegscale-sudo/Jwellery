/**
 * Simple Cart Client using LocalStorage
 * Stores items as an array in 'aurum_cart'
 */

export const getCart = () => {
    if (typeof window === 'undefined') return [];
    try {
        const cart = localStorage.getItem('aurum_cart');
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error("Error reading cart", e);
        return [];
    }
};

// Helper to sync with backend
const syncCartToBackend = async (cart) => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('shopify_customer_token');
    if (!token) return;

    try {
        const res = await fetch('/api/auth/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cart })
        });
        if (!res.ok) {
            const err = await res.json();
            console.error("Sync failed:", err);
        } else {
            console.log("Cart synced to backend successfully.");
        }
    } catch (e) {
        console.error("Failed to sync cart to backend", e);
    }
};

const saveCart = (cart) => {
    localStorage.setItem('aurum_cart', JSON.stringify(cart));
    // Dispatch event so other components can update
    window.dispatchEvent(new Event('cart-updated'));
    // Sync to backend
    syncCartToBackend(cart);
};

const addToCartClient = async ({ variantId, quantity, product }) => {
    // Simulate delay (reduced for better UX)
    await new Promise(resolve => setTimeout(resolve, 100));

    const currentCart = getCart();
    const existingItemIndex = currentCart.findIndex(item => item.variantId === variantId);

    if (existingItemIndex > -1) {
        // Update quantity
        currentCart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item

        // Normalize variants to array, handling both direct array and GraphQL edges
        let variants = [];
        if (Array.isArray(product.variants)) {
            variants = product.variants;
        } else if (product.variants?.edges) {
            variants = product.variants.edges.map(e => e.node);
        }

        // Find the specific variant or fallback to the first one at all costs
        let variant = variants.find(v => v.id.includes(variantId) || v.id === variantId);

        if (!variant && variants.length > 0) {
            variant = variants[0];
            // If we fell back, update the variantId to match what we actually found
            // This prevents "ghost" items with IDs that don't match data
            variantId = variant.id;
        }

        // Ensure we have a valid image (Variant Image > Product Display Image > Placeholder)
        const image = variant?.image?.url ||
            product.images?.[0]?.url ||
            product.featuredImage?.url ||
            "https://placehold.co/100";

        const price = variant?.price?.amount || variant?.price || 0;
        const title = product.title;

        const variantTitle = variant?.selectedOptions
            ? variant.selectedOptions.map(opt => `${opt.name}: ${opt.value}`).join(' / ')
            : variant?.title || "Default Variant";

        currentCart.push({
            variantId, // Use the potentially corrected ID
            productId: product.id,
            title,
            variantTitle,
            price,
            image,
            quantity,
            handle: product.handle
        });
    }

    saveCart(currentCart);
    return true;
};

export const removeFromCart = (variantId) => {
    const currentCart = getCart();
    const newCart = currentCart.filter(item => item.variantId !== variantId);
    saveCart(newCart);
};

export const updateQuantity = (variantId, newQuantity) => {
    const currentCart = getCart();
    const existingItemIndex = currentCart.findIndex(item => item.variantId === variantId);

    if (existingItemIndex > -1) {
        if (newQuantity <= 0) {
            // Remove item if quantity is 0 or less
            removeFromCart(variantId);
        } else {
            // Update quantity
            currentCart[existingItemIndex].quantity = newQuantity;
            saveCart(currentCart);
        }
    }
};

export const clearCart = () => {
    saveCart([]);
};

export const mergeCart = (serverCart) => {
    if (!Array.isArray(serverCart) || serverCart.length === 0) return;

    const localCart = getCart();
    // Create a map of existing items by variantId
    const cartMap = new Map(localCart.map(item => [item.variantId, item]));

    serverCart.forEach(serverItem => {
        if (cartMap.has(serverItem.variantId)) {
            // Item exists locally. Sum the quantity.
            const localItem = cartMap.get(serverItem.variantId);
            localItem.quantity += serverItem.quantity;
            cartMap.set(serverItem.variantId, localItem);
        } else {
            cartMap.set(serverItem.variantId, serverItem);
        }
    });

    // Convert map back to array
    const merged = Array.from(cartMap.values());
    saveCart(merged);
};



export const setCart = (cart) => {
    if (!Array.isArray(cart)) return;
    saveCart(cart);
};

export default addToCartClient;
