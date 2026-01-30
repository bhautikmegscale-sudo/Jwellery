import { NextResponse } from "next/server";

// Use environment variables for security
const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || "mega-jwels.myshopify.com";
const ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "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";
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

/**
 * Core Shopify Admin API request
 */
async function request(query, variables = {}) {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      // Disable cache to ensure real-time updates for reviews and stock
      cache: "no-store",
    }
  );

  const json = await res.json();

  if (json.errors) {
    console.error("Shopify Admin API Error:", JSON.stringify(json.errors, null, 2));
    throw new Error("Failed to fetch Shopify data");
  }

  return json.data;
}

/**
 * ✅ Get all products (max 250 per request)
 */
/**
 * ✅ Get all products (max 250 per request)
 * Deduplicates products sharing the same 'common_id' metafield.
 */
export async function getAllProducts(first = 250) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
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

            collections(first: 10) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }

            metafields(first: 20) {
              edges {
                node {
                  namespace
                  key
                  value
                }
              }
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
                  price
                  compareAtPrice
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
  `;

  const data = await request(query, { first });

  const products = data.products.edges.map(({ node }) => {
    const variants = node.variants.edges.map(e => e.node);
    const defaultVariant = variants[0] || null;

    return {
      // 🔑 Core product
      id: node.id,
      title: node.title,
      handle: node.handle,
      vendor: node.vendor,
      productType: node.productType, // ✅ FILTER
      tags: node.tags, // ✅ FILTER
      description: node.description,

      // 🏷 Metafields
      metafields: node.metafields.edges.map(e => e.node),

      // 🖼 Image
      featuredImage: node.featuredImage,

      // 📦 Collections (filter / category)
      collections: node.collections.edges.map(e => e.node),

      // 💰 Price range (filter / badge)
      priceRange: node.priceRange,

      // 🧩 Variants
      variants,

      // ⭐ Default variant
      defaultVariant,

      // ⚡ Convenience fields (cards, sliders, cart)
      variantId: defaultVariant?.id || null,
      price: defaultVariant?.price || null,
      compareAtPrice: defaultVariant?.compareAtPrice || null,
      availableForSale: defaultVariant?.availableForSale ?? false,
    };
  });

  // Group products by common_id for siblings
  const productsByCommonId = new Map();
  products.forEach(product => {
    const commonId = product.metafields.find(m => m.key === 'common_id' && m.namespace === 'custom')?.value;
    if (commonId) {
      if (!productsByCommonId.has(commonId)) {
        productsByCommonId.set(commonId, []);
      }
      productsByCommonId.get(commonId).push({
        id: product.id,
        title: product.title,
        handle: product.handle,
        metafields: product.metafields,
        featuredImage: product.featuredImage,
      });
    }
  });

  // Deduplicate and attach siblings
  const seenCommonIds = new Set();
  const uniqueProducts = [];

  for (const product of products) {
    const commonId = product.metafields.find(m => m.key === 'common_id' && m.namespace === 'custom')?.value;

    if (commonId) {
      if (!seenCommonIds.has(commonId)) {
        seenCommonIds.add(commonId);
        // Attach siblings (products with same common_id, excluding self)
        const siblings = productsByCommonId.get(commonId)?.filter(p => p.id !== product.id) || [];
        uniqueProducts.push({ ...product, siblings });
      }
      // If already seen, skip (it's a duplicate variant equivalent)
    } else {
      // If no common_id, include with empty siblings
      uniqueProducts.push({ ...product, siblings: [] });
    }
  }

  return uniqueProducts;
}

export async function getProductByHandle(handle) {
  const query = `
    query getProduct($handle: String!) {
      productByHandle(handle: $handle) {
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

        media(first: 20) {
          edges {
            node {
              ... on MediaImage {
                mediaContentType
                image {
                  url
                  altText
                }
              }
              ... on Model3d {
                mediaContentType
                sources {
                  url
                  mimeType
                }
                preview {
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }

        metafields(first: 20) {
            edges {
                node {
                    namespace
                    key
                    value
                }
            }
        }

        priceRange {
          minVariantPrice {
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
              price
              compareAtPrice
              image {
                url
                altText
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
  `;

  const data = await request(query, { handle });

  if (!data.productByHandle) return null;

  const product = data.productByHandle;
  const variants = product.variants.edges.map(e => e.node);
  const defaultVariant = variants[0] || null;
  const metafields = product.metafields?.edges?.map(e => e.node) || [];

  // Process Media
  const media = product.media.edges.map(e => {
    const node = e.node;
    if (node.mediaContentType === 'IMAGE') {
      return {
        type: 'image',
        url: node.image.url,
        altText: node.image.altText
      };
    } else if (node.mediaContentType === 'MODEL_3D') {
      // Prefer GLB format
      const source = node.sources.find(s => s.mimeType === 'model/gltf-binary') || node.sources[0];
      return {
        type: 'model',
        url: source.url,
        previewUrl: node.preview?.image?.url,
        altText: "3D Model"
      };
    }
    return null;
  }).filter(Boolean);

  // Find common_id in metafields (Namespace: custom, Key: common_id)
  const commonIdField = metafields.find(m => m.key === 'common_id' && m.namespace === 'custom');
  const commonId = commonIdField ? commonIdField.value : null;

  let siblings = [];

  if (commonId) {
    // Fetch raw products to find siblings without deduplication
    const productsQuery = `
        query getProducts($first: Int!) {
        products(first: $first) {
            edges {
            node {
                id
                title
                handle
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

    const productsData = await request(productsQuery, { first: 250 });
    const allRawProducts = productsData.products.edges.map(e => ({
      ...e.node,
      metafields: e.node.metafields.edges.map(m => m.node)
    }));

    siblings = allRawProducts.filter(p => {
      const pCommonId = p.metafields?.find(m => m.key === 'common_id' && m.namespace === 'custom')?.value;
      return pCommonId === commonId;
    });
  }

  return {
    ...product,
    media, // New media field
    // images: product.media.edges.filter(e => e.node.mediaContentType === 'IMAGE').map(e => e.node.image), // Backward compatibility if needed, but we should use media
    images: media.filter(m => m.type === 'image').map(m => ({ url: m.url, altText: m.altText })), // Keep 'images' as array of objects for simple compatibility
    variants,
    defaultVariant,
    metafields,
    siblings // Return the found siblings
  };
}

/**
 * Next.js App Router GET handler
 * 
 * Usage:
 * - GET /api/products - Get all products
 * - GET /api/products?handle=product-handle - Get specific product by handle
 * - GET /api/products?first=100 - Get first 100 products
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    const first = parseInt(searchParams.get("first") || "250");

    // If handle is provided, fetch single product
    if (handle) {
      const product = await getProductByHandle(handle);

      if (!product) {
        return NextResponse.json(
          { error: "Product not found", handle },
          { status: 404 }
        );
      }

      return NextResponse.json({ product }, { status: 200 });
    }

    // Otherwise, fetch all products
    const products = await getAllProducts(first);

    return NextResponse.json(
      {
        products,
        count: products.length,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("API Route Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch products",
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
