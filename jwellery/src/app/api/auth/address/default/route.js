import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "mega-jwels.myshopify.com";
const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "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";
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

// NOTE: Switched to REST API because GraphQL mutations for 'setDefaultAddress' 
// were extremely unreliable/missing in this API version.
async function setAdminDefaultAddress(customerId, addressId) {
    // Extract ID from GID if necessary (e.g. gid://shopify/Customer/123 -> 123)
    const cleanCustomerId = customerId.toString().replace('gid://shopify/Customer/', '');

    // Remove GID prefix and any query parameters (e.g. ?model_name=CustomerAddress)
    let cleanAddressId = addressId.toString()
        .replace('gid://shopify/MailingAddress/', '')
        .replace('gid://shopify/CustomerAddress/', '');

    // Strip query parameters if present
    if (cleanAddressId.includes('?')) {
        cleanAddressId = cleanAddressId.split('?')[0];
    }

    const url = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/customers/${cleanCustomerId}/addresses/${cleanAddressId}/default.json`;

    console.log(`[SetDefault] Calling REST API: PUT ${url}`);

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN,
        }
    });

    return response.json();
}

export async function PUT(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const session = await verifySession(token);

        if (!session || !session.id) {
            return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });
        }

        const body = await request.json();
        const { addressId } = body;

        console.log("[SetDefault] Request:", { customerId: session.id, addressId });

        if (!addressId) {
            return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
        }

        const result = await setAdminDefaultAddress(session.id, addressId);

        console.log("[SetDefault] Shopify Response:", JSON.stringify(result));

        if (result.errors) {
            console.error("Shopify REST Errors:", JSON.stringify(result.errors));
            return NextResponse.json({ error: "Failed to set default address (Shopify Error)." }, { status: 500 });
        }

        // REST API returns { customer_address: { ... } } on success
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Set Default API Crash:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
