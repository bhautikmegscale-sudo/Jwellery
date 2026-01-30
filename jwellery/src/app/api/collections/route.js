import { NextResponse } from "next/server";

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "mega-jwels.myshopify.com";
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "7018d1d15983f208ef99107369784a08";
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

/**
 * Core Shopify Storefront API request
 */
async function request(query, variables = {}) {
    try {
        const res = await fetch(
            `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
                },
                body: JSON.stringify({ query, variables }),
                next: { revalidate: 60 },
            }
        );

        if (!res.ok) {
            console.error("Shopify API HTTP Error:", res.status, res.statusText);
            throw new Error(`HTTP Error: ${res.status}`);
        }

        const json = await res.json();

        if (json.errors) {
            console.error("Shopify Storefront API Error:", JSON.stringify(json.errors, null, 2));
            throw new Error(json.errors[0]?.message || "Failed to fetch Shopify data");
        }

        return json.data;
    } catch (error) {
        console.error("Request error:", error);
        throw error;
    }
}

/**
 * Get all collections
 */
export async function getAllCollections(first = 50) {
    const query = `
    query getCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
            products(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

    const data = await request(query, { first });

    // Fetch individual collection counts
    const collectionsWithCounts = await Promise.all(
        data.collections.edges.map(async ({ node }) => {
            // Get actual product count by fetching the collection with products
            const countQuery = `
                query getCollectionCount($handle: String!) {
                    collection(handle: $handle) {
                        products(first: 250) {
                            edges {
                                node {
                                    id
                                }
                            }
                        }
                    }
                }
            `;

            try {
                const countData = await request(countQuery, { handle: node.handle });
                const productsCount = countData.collection?.products?.edges?.length || 0;

                return {
                    id: node.id,
                    title: node.title,
                    handle: node.handle,
                    description: node.description,
                    image: node.image,
                    productsCount,
                };
            } catch (error) {
                console.error(`Error fetching count for ${node.handle}:`, error);
                return {
                    id: node.id,
                    title: node.title,
                    handle: node.handle,
                    description: node.description,
                    image: node.image,
                    productsCount: 0,
                };
            }
        })
    );

    return collectionsWithCounts;
}

/**
 * Get collection by handle with products
 */
export async function getCollectionByHandle(handle, productsFirst = 50) {
    const query = `
    query getCollection($handle: String!, $productsFirst: Int!) {
      collection(handle: $handle) {
        id
        title
        handle
        description
        image {
          url
          altText
        }
        products(first: $productsFirst) {
          edges {
            node {
              id
              title
              handle
              vendor
              productType
              tags
              description
              featuredImage {
                url
                altText
              }
              metafields(identifiers: [
                {namespace: "custom", key: "common_id"},
                {namespace: "custom", key: "variant_id"}
              ]) {
                namespace
                key
                value
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 150) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

    const data = await request(query, { handle, productsFirst });

    if (!data.collection) return null;

    const collection = data.collection;

    // Process products
    const products = collection.products.edges.map(({ node }) => {
        const variants = node.variants.edges.map(e => ({
            ...e.node,
            price: e.node.price?.amount || null,
            compareAtPrice: e.node.compareAtPrice?.amount || null,
        }));
        const defaultVariant = variants[0] || null;

        return {
            id: node.id,
            title: node.title,
            handle: node.handle,
            vendor: node.vendor,
            productType: node.productType,
            tags: node.tags,
            description: node.description,
            metafields: node.metafields || [],
            featuredImage: node.featuredImage,
            priceRange: node.priceRange,
            variants,
            defaultVariant,
            variantId: defaultVariant?.id || null,
            price: defaultVariant?.price || null,
            compareAtPrice: defaultVariant?.compareAtPrice || null,
            availableForSale: defaultVariant?.availableForSale ?? false,
        };
    });

    // Fetch siblings for all products
    // First, get all unique common_ids
    const commonIds = [...new Set(
        products
            .map(p => p.metafields.find(m => m.key === 'common_id' && m.namespace === 'custom')?.value)
            .filter(Boolean)
    )];

    // Fetch all products with these common_ids to get siblings
    let allProductsMap = new Map();

    if (commonIds.length > 0) {
        // Query to get all products from the collection (we already have them)
        // Group by common_id
        products.forEach(product => {
            const commonId = product.metafields.find(m => m.key === 'common_id' && m.namespace === 'custom')?.value;
            if (commonId) {
                if (!allProductsMap.has(commonId)) {
                    allProductsMap.set(commonId, []);
                }
                allProductsMap.get(commonId).push({
                    id: product.id,
                    title: product.title,
                    handle: product.handle,
                    metafields: product.metafields,
                    featuredImage: product.featuredImage,
                });
            }
        });
    }

    // Attach siblings to each product
    const productsWithSiblings = products.map(product => {
        const commonId = product.metafields.find(m => m.key === 'common_id' && m.namespace === 'custom')?.value;

        if (commonId && allProductsMap.has(commonId)) {
            // Get all products with same common_id, excluding self
            const siblings = allProductsMap.get(commonId)
                .filter(p => p.id !== product.id);

            return {
                ...product,
                siblings,
            };
        }

        return {
            ...product,
            siblings: [],
        };
    });

    // Deduplicate products by common_id
    const seenCommonIds = new Set();
    const uniqueProducts = [];

    for (const product of productsWithSiblings) {
        const commonId = product.metafields.find(m => m.key === 'common_id' && m.namespace === 'custom')?.value;

        if (commonId) {
            if (!seenCommonIds.has(commonId)) {
                seenCommonIds.add(commonId);
                uniqueProducts.push(product);
            }
            // Skip duplicates - they have the same common_id
        } else {
            // If no common_id, include the product
            uniqueProducts.push(product);
        }
    }

    return {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        description: collection.description,
        image: collection.image,
        products: uniqueProducts,
        productsCount: uniqueProducts.length,
    };
}

/**
 * Next.js App Router GET handler
 * 
 * Usage:
 * - GET /api/collections - Get all collections
 * - GET /api/collections?handle=collection-handle - Get specific collection with products
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const handle = searchParams.get("handle");
        const first = parseInt(searchParams.get("first") || "50");
        const productsFirst = parseInt(searchParams.get("productsFirst") || "50");

        // If handle is provided, fetch single collection with products
        if (handle) {
            const collection = await getCollectionByHandle(handle, productsFirst);

            if (!collection) {
                return NextResponse.json(
                    { error: "Collection not found", handle },
                    { status: 404 }
                );
            }

            return NextResponse.json({ collection }, { status: 200 });
        }

        // Otherwise, fetch all collections
        const collections = await getAllCollections(first);

        return NextResponse.json(
            {
                collections,
                count: collections.length,
                timestamp: new Date().toISOString()
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("API Route Error:", error);

        return NextResponse.json(
            {
                error: "Failed to fetch collections",
                message: error.message,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
