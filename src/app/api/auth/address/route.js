import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "mega-jwels.myshopify.com";
const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "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";
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

async function fetchAdmin(query, variables) {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': ADMIN_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
    });
    return response.json();
}

// Helper to get authenticated user ID
async function getAuthUserId(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    const session = await verifySession(token);
    return session?.id; // return Shopify Customer ID (gid://...)
}

export async function POST(request) {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { address1, city, zip, country, firstName, lastName, phone } = body;

    const mutation = `
        mutation customerAddressCreate($customerId: ID!, $address: MailingAddressInput!) {
            customerAddressCreate(customerId: $customerId, address: $address) {
                address { id }
                userErrors { message }
            }
        }
    `;

    const variables = {
        customerId: userId,
        address: { address1, city, zip, country, firstName, lastName, phone }
    };

    const data = await fetchAdmin(mutation, variables);

    // Check for top-level GraphQL errors
    if (data.errors) {
        console.error("Shopify GraphQL Errors:", JSON.stringify(data.errors));
        return NextResponse.json({ error: data.errors[0].message }, { status: 500 });
    }

    const result = data.data?.customerAddressCreate;

    if (!result) {
        console.error("Shopify Unknown Error:", JSON.stringify(data));
        return NextResponse.json({ error: "Failed to create address. No response from Shopify." }, { status: 500 });
    }

    if (result.userErrors?.length > 0) {
        return NextResponse.json({ error: result.userErrors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: true, address: result.address });
}

export async function PUT(request) {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, address1, city, zip, country, firstName, lastName, phone } = body;

    if (!id) return NextResponse.json({ error: 'Address ID required' }, { status: 400 });

    const mutation = `
        mutation customerAddressUpdate($id: ID!, $address: MailingAddressInput!) {
            customerAddressUpdate(id: $id, address: $address) {
                address { id }
                userErrors { message }
            }
        }
    `;

    const variables = {
        id,
        address: { address1, city, zip, country, firstName, lastName, phone }
    };

    const data = await fetchAdmin(mutation, variables);

    if (data.errors) {
        console.error("Shopify GraphQL Errors:", JSON.stringify(data.errors));
        return NextResponse.json({ error: data.errors[0].message }, { status: 500 });
    }

    const result = data.data?.customerAddressUpdate;

    if (!result) {
        console.error("Shopify Unknown Error:", JSON.stringify(data));
        return NextResponse.json({ error: "Failed to update address." }, { status: 500 });
    }

    if (result.userErrors?.length > 0) {
        return NextResponse.json({ error: result.userErrors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: true, address: result.address });
}

export async function DELETE(request) {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Address ID required' }, { status: 400 });

    const mutation = `
        mutation customerAddressDelete($id: ID!) {
            customerAddressDelete(id: $id) {
                deletedCustomerAddressId
                userErrors { message }
            }
        }
    `;

    const data = await fetchAdmin(mutation, { id });

    if (data.errors) {
        console.error("Shopify GraphQL Errors:", JSON.stringify(data.errors));
        return NextResponse.json({ error: data.errors[0].message }, { status: 500 });
    }

    const result = data.data?.customerAddressDelete;

    if (!result) {
        console.error("Shopify Unknown Error:", JSON.stringify(data));
        return NextResponse.json({ error: "Failed to delete address." }, { status: 500 });
    }

    if (result.userErrors?.length > 0) {
        return NextResponse.json({ error: result.userErrors[0].message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
