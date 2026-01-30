import { NextResponse } from 'next/server';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "mega-jwels.myshopify.com";
const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "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";
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "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";
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

async function shopifyStorefrontWait(query, variables) {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
    });
    return response.json();
}

async function shopifyAdminWait(query, variables) {
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

export async function POST(request) {
    try {
        const { customer, cart, paymentMethod } = await request.json();

        // 1. Create Customer (Storefront API)
        const customerMutation = `
            mutation customerCreate($input: CustomerCreateInput!) {
                customerCreate(input: $input) {
                    customer { id firstName lastName email phone }
                    customerUserErrors { field message code }
                }
            }
        `;

        const customerVariables = {
            input: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                acceptsMarketing: true
            }
        };

        const customerResponse = await shopifyStorefrontWait(customerMutation, customerVariables);

        let customerId = customerResponse.data?.customerCreate?.customer?.id;

        // Ignore "Email has already been taken" error, proceed with order creation
        // If critical error, you might want to stop here.
        if (!customerId) {
            console.warn("Customer creation warning:", customerResponse.data?.customerCreate?.customerUserErrors);
            // Optionally fetch existing customer or just proceed with email in order
        }

        // 2. Create Order (Admin API)
        const orderMutation = `
            mutation orderCreate($order: OrderCreateOrderInput!) {
                orderCreate(order: $order) {
                    userErrors { field message }
                    order { id name totalTaxSet { shopMoney { amount currencyCode } } }
                }
            }
        `;

        const lineItems = cart.items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity
        }));

        // Determine transaction status based on Payment Method
        // COD = PENDING
        // CARD = SUCCESS (Following user logic, but strictly this should be integrated with a gateway)
        const transactions = [];
        const totalAmount = cart.subtotal + cart.tax; // Simplified calculation sync

        if (paymentMethod === 'card') {
            transactions.push({
                kind: "SALE",
                status: "SUCCESS",
                amountSet: {
                    shopMoney: {
                        amount: totalAmount,
                        currencyCode: "INR" // Assuming INR based on frontend
                    }
                }
            });
        } else {
            // COD: We can mark it as PENDING or omit transaction to leave it as "Payment Pending"
            // User example showed "SUCCESS" transaction, but for COD "Pending" is correct.
            transactions.push({
                kind: "SALE",
                status: "PENDING",
                amountSet: {
                    shopMoney: {
                        amount: totalAmount,
                        currencyCode: "INR"
                    }
                }
            });
        }

        const orderVariables = {
            order: {
                currency: "INR",
                email: customer.email,
                phone: customer.phone,
                shippingAddress: {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    address1: customer.address1,
                    city: customer.city,
                    zip: customer.zip,
                    phone: customer.phone,
                    countryCode: "IN" // Hardcoded for now or add to form
                },
                lineItems: lineItems,
                transactions: transactions
            }
        };

        const orderResponse = await shopifyAdminWait(orderMutation, orderVariables);

        if (orderResponse.data?.orderCreate?.userErrors?.length > 0) {
            console.error("Order creation errors:", orderResponse.data.orderCreate.userErrors);
            return NextResponse.json({ error: 'Order creation failed', details: orderResponse.data.orderCreate.userErrors }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            customer: customerResponse.data?.customerCreate?.customer,
            order: orderResponse.data?.orderCreate?.order
        });

    } catch (error) {
        console.error("Checkout API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
