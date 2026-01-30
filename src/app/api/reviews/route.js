import { NextResponse } from "next/server";

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

async function shopifyRequest(query, variables = {}) {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    }
  );

  const json = await res.json();
  if (json.errors) {
    console.error("Shopify Request Error", JSON.stringify(json.errors, null, 2));
    throw new Error(JSON.stringify(json.errors));
  }
  return json.data;
}

export async function POST(request) {
  try {
    const { productId, name, rating, comment } = await request.json();

    if (!productId || !name || !rating || !comment) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Fetch the Target Product's common_id
    const commonIdQuery = `
          query getCommonId($id: ID!) {
            product(id: $id) {
              metafield(namespace: "custom", key: "common_id") {
                value
              }
            }
          }
        `;
    const commonIdData = await shopifyRequest(commonIdQuery, { id: productId });
    const commonId = commonIdData.product?.metafield?.value;

    // 2. Find ALL products to update
    let productsToUpdate = [];

    if (commonId) {
      const allProductsQuery = `
                query getProducts($first: Int!) {
                    products(first: $first) {
                        edges {
                            node {
                                id
                                metafields(first: 20) {
                                    edges {
                                        node {
                                            namespace
                                            key
                                            value
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `;
      const allProductsData = await shopifyRequest(allProductsQuery, { first: 250 });

      // Filter for products with the same common_id
      productsToUpdate = allProductsData.products.edges
        .map(edge => edge.node)
        .filter(p => {
          const pCommonId = p.metafields.edges.find(m => m.node.namespace === "custom" && m.node.key === "common_id")?.node.value;
          return pCommonId === commonId;
        });
    } else {
      // Fallback: Just the current product
      const singleProductQuery = `
                query getProduct($id: ID!) {
                    product(id: $id) {
                        id
                        metafields(first: 20) {
                             edges {
                                node {
                                    namespace
                                    key
                                    value
                                }
                             }
                        }
                    }
                }
            `;
      const singleData = await shopifyRequest(singleProductQuery, { id: productId });
      if (singleData.product) {
        productsToUpdate = [singleData.product];
      }
    }

    const newReview = {
      id: Date.now().toString(),
      name,
      rating: parseInt(rating),
      comment,
      date: new Date().toISOString(),
    };

    // 3. Update EACH product
    let targetProductReviews = [];

    for (const product of productsToUpdate) {
      const reviewMeta = product.metafields.edges?.find(m => m.node.namespace === "custom" && m.node.key === "reviews")?.node;
      let reviews = [];
      if (reviewMeta && reviewMeta.value) {
        try {
          reviews = JSON.parse(reviewMeta.value);
          if (!Array.isArray(reviews)) reviews = [];
        } catch (e) {
          reviews = [];
        }
      }

      reviews.push(newReview);

      // Capture the updated reviews for the requested product to return to the frontend
      if (product.id === productId) {
        targetProductReviews = reviews;
      }

      const writeQuery = `
              mutation productUpdate($input: ProductInput!) {
                productUpdate(input: $input) {
                  userErrors {
                    field
                    message
                  }
                }
              }
            `;

      const input = {
        id: product.id,
        metafields: [
          {
            namespace: "custom",
            key: "reviews",
            value: JSON.stringify(reviews),
            type: "json"
          }
        ]
      };

      await shopifyRequest(writeQuery, { input });
    }

    return NextResponse.json({ success: true, reviews: targetProductReviews }, { status: 200 });

  } catch (error) {
    console.error("Review API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
