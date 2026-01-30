import { NextResponse } from 'next/server';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "mega-jwels.myshopify.com";
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "7018d1d15983f208ef99107369784a08";
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

export async function POST(request) {
    try {
        const { query, variables } = await request.json();

        const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
            },
            body: JSON.stringify({ query, variables }),
        });

        const json = await response.json();

        if (json.errors) {
            console.error("Shopify Auth Proxy Error:", json.errors);
            return NextResponse.json({ errors: json.errors }, { status: 401 });
        }

        return NextResponse.json({ data: json.data });

    } catch (error) {
        console.error("Auth Proxy internal error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
