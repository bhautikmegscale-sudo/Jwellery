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

// GET: Fetch Cart from Metafield
export async function GET(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const session = await verifySession(token);

    if (!session || !session.id) {
        return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });
    }

    const query = `
        query getCustomerCart($id: ID!) {
            customer(id: $id) {
                id
                metafield(namespace: "custom", key: "cart_data") {
                    value
                }
            }
        }
    `;

    try {
        console.log(`[API/Cart] Fetching cart for user ${session.id}`);
        const json = await fetchAdmin(query, { id: session.id });
        const cartMeta = json.data?.customer?.metafield;
        const cart = cartMeta ? JSON.parse(cartMeta.value) : [];
        return NextResponse.json({ cart });
    } catch (error) {
        console.error("Fetch Cart Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Save Cart to Metafield
export async function POST(request) {
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
    const { cart } = body;

    const mutation = `
        mutation updateCartMetafield($input: CustomerInput!) {
            customerUpdate(input: $input) {
                customer {
                    id
                    metafield(namespace: "custom", key: "cart_data") {
                        value
                    }
                }
                userErrors {
                    message
                }
            }
        }
    `;

    try {
        console.log(`[API/Cart] Saving cart for user ${session.id}. Item count: ${cart.length}`);

        const json = await fetchAdmin(mutation, {
            input: {
                id: session.id,
                metafields: [
                    {
                        namespace: "custom",
                        key: "cart_data",
                        value: JSON.stringify(cart),
                        type: "json"
                    }
                ]
            }
        });

        console.log(`[API/Cart] Shopify Response:`, JSON.stringify(json));


        const result = json.data?.customerUpdate;
        if (result?.userErrors?.length > 0) {
            console.error("Update Cart Errors:", result.userErrors);
            return NextResponse.json({ error: result.userErrors[0].message }, { status: 400 });
        }

        return NextResponse.json({ success: true, cart: cart });
    } catch (error) {
        console.error("Save Cart Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
