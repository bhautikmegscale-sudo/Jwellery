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

    // CHANGED: Use ID from session, not just email
    const customerId = session.id;
    console.log("[Profile] Fetching ID:", customerId);

    // REMOVED 'addresses' connection which was causing schema errors
    const query = `
        query getCustomer($id: ID!) {
            customer(id: $id) {
                id
                firstName
                lastName
                email
                phone
                defaultAddress {
                    id
                    address1
                    city
                    zip
                    country
                    phone
                }
                addresses {
                    id
                    address1
                    city
                    zip
                    country
                    firstName
                    lastName
                    phone
                }
                orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
                    edges {
                        node {
                            name
                            processedAt
                            totalPriceSet { shopMoney { amount currencyCode } }
                            subtotalPriceSet { shopMoney { amount currencyCode } }
                            totalTaxSet { shopMoney { amount currencyCode } }
                            lineItems(first: 20) {
                                edges {
                                    node {
                                        title
                                        quantity
                                        originalTotalSet { shopMoney { amount } }
                                        variant { 
                                            image { url }
                                        }
                                        image { url }
                                    }
                                }
                            }
                            shippingAddress {
                                address1
                                city
                                zip
                                country
                                firstName
                                lastName
                                phone
                            }
                            displayFulfillmentStatus
                        }
                    }
                }
            }
        }
    `;

    try {
        const json = await fetchAdmin(query, { id: customerId });
        const customerNode = json.data?.customer;

        if (!customerNode) {
            console.error("[Profile] Customer not found for ID:", customerId, "JSON:", JSON.stringify(json));
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        const mappedCustomer = {
            ...customerNode,
            phone: customerNode.phone || customerNode.defaultAddress?.phone,
            addresses: customerNode.addresses || [], // It's already a flat list now
            orders: {
                edges: customerNode.orders.edges.map(edge => ({
                    node: {
                        orderNumber: edge.node.name.replace('#', ''),
                        processedAt: edge.node.processedAt,
                        totalPrice: edge.node.totalPriceSet.shopMoney,
                        subtotalPrice: edge.node.subtotalPriceSet?.shopMoney,
                        totalTax: edge.node.totalTaxSet?.shopMoney,
                        fulfillmentStatus: edge.node.displayFulfillmentStatus,
                        shippingAddress: edge.node.shippingAddress,
                        lineItems: {
                            edges: edge.node.lineItems.edges.map(itemEdge => ({
                                node: {
                                    title: itemEdge.node.title,
                                    quantity: itemEdge.node.quantity,
                                    originalTotalPrice: itemEdge.node.originalTotalSet?.shopMoney,
                                    image: itemEdge.node.variant?.image || itemEdge.node.image
                                }
                            }))
                        }
                    }
                }))
            }
        };

        return NextResponse.json(mappedCustomer);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
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
    const { firstName, lastName, phone } = body;

    // 1. Manually check uniqueness for Phone if provided
    if (phone) {
        const checkQuery = `
            query checkPhone($query: String!) {
                customers(first: 10, query: $query) {
                    edges {
                        node { id phone email }
                    }
                }
            }
        `;
        // Search by phone. Note: exact match might be tricky with formats, but basic search works.
        const checkJson = await fetchAdmin(checkQuery, { query: `phone:${phone}` });
        const existingCustomers = checkJson.data?.customers?.edges || [];

        const isTaken = existingCustomers.some(edge => edge.node.id !== session.id);

        if (isTaken) {
            return NextResponse.json({ error: "This phone number is already registered to another account." }, { status: 400 });
        }
    }

    const mutation = `
        mutation customerUpdate($input: CustomerInput!) {
            customerUpdate(input: $input) {
                customer {
                    id
                    firstName
                    lastName
                    phone
                    email
                }
                userErrors {
                    message
                }
            }
        }
    `;

    try {
        const json = await fetchAdmin(mutation, {
            input: {
                id: session.id, // Must include ID to update specific customer
                firstName,
                lastName,
                phone
            }
        });

        const result = json.data?.customerUpdate;
        if (result?.userErrors?.length > 0) {
            const msg = result.userErrors[0].message;
            if (msg.includes("taken")) {
                return NextResponse.json({ error: "This phone number or email is already registered to another account." }, { status: 400 });
            }
            return NextResponse.json({ error: msg }, { status: 400 });
        }

        return NextResponse.json({ success: true, customer: result.customer });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
