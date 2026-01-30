import { NextResponse } from "next/server";

const SHOPIFY_DOMAIN = "mega-jwels.myshopify.com";
const STOREFRONT_TOKEN = "7018d1d15983f208ef99107369784a08";
const API_VERSION = "2025-01";

/**
 * Storefront GraphQL Request
 */
async function request(query, variables = {}) {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const json = await res.json();

  if (json.errors) {
    console.error("Shopify Storefront Error:", json.errors);
    throw new Error(json.errors[0].message);
  }

  return json.data;
}

/**
 * Get ALL blogs with articles
 */
export async function getBlogs() {
  const query = `
    query getBlogs {
      blogs(first: 50) {
        edges {
          node {
            id
            handle
            title
            articles(first: 250, reverse: true) {
              edges {
                node {
                  id
                  title
                  handle
                  excerptHtml
                  contentHtml
                  publishedAt
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await request(query);

  return data.blogs.edges.map(edge => ({
    id: edge.node.id,
    handle: edge.node.handle,
    title: edge.node.title,
    articles: edge.node.articles.edges.map(a => ({
      id: a.node.id,
      title: a.node.title,
      handle: a.node.handle,
      excerpt: a.node.excerptHtml || "",
      contentHtml: a.node.contentHtml || "",
      publishedAt: a.node.publishedAt,
      image: a.node.image || null,
    })),
  }));
}

/**
 * Get ONE blog by handle
 */
export async function getBlogByHandle(blogHandle, articlesFirst = 250) {
  const query = `
    query getBlogByHandle($handle: String!, $articlesFirst: Int!) {
      blog(handle: $handle) {
        id
        handle
        title
        articles(first: $articlesFirst, reverse: true) {
          edges {
            node {
              id
              title
              handle
              excerptHtml
              contentHtml
              publishedAt
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  `;

  const data = await request(query, {
    handle: blogHandle,
    articlesFirst,
  });

  if (!data?.blog) return null;

  return {
    id: data.blog.id,
    handle: data.blog.handle,
    title: data.blog.title,
    articles: data.blog.articles.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      excerpt: edge.node.excerptHtml || "",
      contentHtml: edge.node.contentHtml || "",
      publishedAt: edge.node.publishedAt,
      image: edge.node.image || null,
    })),
  };
}

/**
 * API Route
 * /api/blogs                 → All blogs + articles
 * /api/blogs?blog=journal    → One blog
 * /api/blogs?handle=gold-care → One article
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogHandle = searchParams.get("blog");
    const articleHandle = searchParams.get("handle");

    // Single article
    if (articleHandle) {
      const blogs = await getBlogs();
      for (const blog of blogs) {
        const article = blog.articles.find(a => a.handle === articleHandle);
        if (article) {
          return NextResponse.json({ article }, { status: 200 });
        }
      }
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Single blog
    if (blogHandle) {
      const blog = await getBlogByHandle(blogHandle);
      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }
      return NextResponse.json({ blog }, { status: 200 });
    }

    // All blogs
    const blogs = await getBlogs();
    return NextResponse.json({ blogs }, { status: 200 });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs", message: error.message },
      { status: 500 }
    );
  }
}


// import { NextResponse } from "next/server";

// const SHOPIFY_DOMAIN = "mega-jwels.myshopify.com";
// const STOREFRONT_TOKEN = "7018d1d15983f208ef99107369784a08";   // 👈 use this
// const API_VERSION = "2025-01";

// async function request(query, variables = {}) {
//   const res = await fetch(
//     `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
//       },
//       body: JSON.stringify({ query, variables }),
//     }
//   );

//   const json = await res.json();

//   if (json.errors) {
//     throw new Error(json.errors[0].message);
//   }

//   return json.data;
// }

// /**
//  * Get all articles
//  */
// export async function getAllArticles(first = 50) {
//   const query = `
//     query {
//       blogs(first: 10) {
//         edges {
//           node {
//             title
//             handle
//             articles(first: ${first}, reverse: true) {
//               edges {
//                 node {
//                   id
//                   title
//                   handle
//                   publishedAt
//                   tags
//                   excerpt
//                   content
//                   image {
//                     url
//                     altText
//                   }
//                   author {
//                     name
//                   }
//                   blog {
//                     title
//                     handle
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   `;

//   const data = await request(query);
//   const allArticles = [];

//   data.blogs.edges.forEach(blogEdge => {
//     const blogTitle = blogEdge.node.title;
//     const blogHandle = blogEdge.node.handle;

//     blogEdge.node.articles.edges.forEach(articleEdge => {
//       const node = articleEdge.node;

//       allArticles.push({
//         id: node.id,
//         title: node.title,
//         handle: node.handle,
//         publishedAt: node.publishedAt,
//         description: node.excerpt || "",
//         content: "",
//         image: node.image?.url || null,
//         author: node.author?.name || "The Maison",
//         blog: blogTitle,
//         blogHandle: blogHandle,
//         tags: node.tags
//       });
//     });
//   });

//   return allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
// }

// /**
//  * Get single article
//  */
// export async function getArticleByHandle(handle) {
//   const query = `
//     query {
//       blogs(first: 10) {
//         edges {
//           node {
//             title
//             handle
//             articles(first: 100, reverse: true) {
//               edges {
//                 node {
//                   id
//                   title
//                   handle
//                   publishedAt
//                   tags
//                   excerpt
//                   content
//                   image {
//                     url
//                     altText
//                   }
//                   author {
//                     name
//                   }
//                   blog {
//                     title
//                     handle
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   `;

//   const data = await request(query);
//   let foundArticle = null;

//   for (const blogEdge of data.blogs.edges) {
//     for (const articleEdge of blogEdge.node.articles.edges) {
//       if (articleEdge.node.handle === handle) {
//         const node = articleEdge.node;

//         foundArticle = {
//           id: node.id,
//           title: node.title,
//           handle: node.handle,
//           publishedAt: node.publishedAt,
//           description: node.excerpt || "",
//           content: node.content || "",
//           image: node.image?.url || null,
//           author: node.author?.name || "The Maison",
//           blog: blogEdge.node.title,
//           blogHandle: blogEdge.node.handle,
//           tags: node.tags
//         };
//         break;
//       }
//     }
//     if (foundArticle) break;
//   }

//   return foundArticle;
// }

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const handle = searchParams.get("handle");

//     if (handle) {
//       const article = await getArticleByHandle(handle);
//       return NextResponse.json({ article }, { status: 200 });
//     }

//     const articles = await getAllArticles();
//     return NextResponse.json({ articles }, { status: 200 });

//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch articles", message: error.message },
//       { status: 500 }
//     );
//   }
// }



// import { NextResponse } from "next/server";

// const SHOPIFY_DOMAIN = "mega-jwels.myshopify.com";
// const ADMIN_ACCESS_TOKEN = "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";
// const API_VERSION = "2025-01";

// /**
//  * Core Shopify Admin API request
//  */
// async function request(query, variables = {}) {
//   const res = await fetch(
//     `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Access-Token": ADMIN_ACCESS_TOKEN,
//       },
//       body: JSON.stringify({ query, variables }),
//     }
//   );

//   const json = await res.json();

//   if (json.errors) {
//     console.error("Shopify Admin API Error:", JSON.stringify(json.errors, null, 2));
//     throw new Error(json.errors[0].message);
//   }

//   return json.data;
// }

// /**
//  * Get ALL articles (List View)
//  */
// export async function getAllArticles(first = 50) {
//   const query = `
//     query getBlogs {
//       blogs(first: 10) {
//         edges {
//           node {
//             id
//             handle
//             title
//             articles(first: ${first}, reverse: true) {
//               edges {
//                 node {
//                   id
//                   title
//                   handle
//                   publishedAt
//                   tags

//                   contentHtml
//                   summaryHtml

//                   image {
//                     url
//                     altText
//                   }
//                   author {
//                     name
//                   }
//                   blog {
//                     title
//                     handle
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   `;

//   const data = await request(query);

//   const allArticles = [];

//   if (data.blogs && data.blogs.edges) {
//     data.blogs.edges.forEach(blogEdge => {
//       const blogTitle = blogEdge.node.title;
//       const blogHandle = blogEdge.node.handle;

//       if (blogEdge.node.articles && blogEdge.node.articles.edges) {
//         blogEdge.node.articles.edges.forEach(articleEdge => {
//           const node = articleEdge.node;

//           // Prefer Shopify summary, fallback to content
//           const rawBody = node.summaryHtml || node.contentHtml || "";

//           const truncateLength = 200;
//           const generatedExcerpt =
//             rawBody.length > truncateLength
//               ? rawBody.substring(0, truncateLength) + "..."
//               : rawBody;

//           allArticles.push({
//             id: node.id,
//             title: node.title,
//             handle: node.handle,
//             publishedAt: node.publishedAt,
//             content: "",
//             excerpt: generatedExcerpt,
//             image: node.image?.url || null,
//             author: node.author?.name || "The Maison",
//             blog: blogTitle,
//             blogHandle: blogHandle,
//             tags: node.tags
//           });
//         });
//       }
//     });
//   }

//   return allArticles.sort(
//     (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
//   );
// }

// /**
//  * Get SINGLE article by handle (Detail View)
//  */
// export async function getArticleByHandle(handle) {
//   const query = `
//     query getArticle {
//       blogs(first: 10) {
//         edges {
//           node {
//             title
//             handle
//             articles(first: 100, reverse: true) {
//               edges {
//                 node {
//                   id
//                   title
//                   handle
//                   publishedAt
//                   tags

//                   contentHtml
//                   summaryHtml

//                   image {
//                     url
//                     altText
//                   }
//                   author {
//                     name
//                   }
//                   blog {
//                     title
//                     handle
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   `;

//   const data = await request(query);

//   let foundArticle = null;

//   if (data.blogs && data.blogs.edges) {
//     for (const blogEdge of data.blogs.edges) {
//       if (blogEdge.node.articles && blogEdge.node.articles.edges) {
//         for (const articleEdge of blogEdge.node.articles.edges) {
//           if (articleEdge.node.handle === handle) {
//             const node = articleEdge.node;

//             foundArticle = {
//               id: node.id,
//               title: node.title,
//               handle: node.handle,
//               publishedAt: node.publishedAt,
//               content: node.contentHtml || "",
//               excerpt: node.summaryHtml || "",
//               image: node.image?.url || null,
//               author: node.author?.name || "The Maison",
//               blog: blogEdge.node.title,
//               blogHandle: blogEdge.node.handle,
//               tags: node.tags
//             };
//             break;
//           }
//         }
//       }
//       if (foundArticle) break;
//     }
//   }

//   return foundArticle;
// }

// /**
//  * API Route
//  */
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const handle = searchParams.get("handle");

//     if (handle) {
//       const article = await getArticleByHandle(handle);
//       if (!article) {
//         return NextResponse.json({ error: "Article not found" }, { status: 404 });
//       }
//       return NextResponse.json({ article }, { status: 200 });
//     }

//     const articles = await getAllArticles();
//     return NextResponse.json({ articles }, { status: 200 });

//   } catch (error) {
//     console.error("API Route Error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch articles", message: error.message },
//       { status: 500 }
//     );
//   }
// }





// // import { NextResponse } from "next/server";

// // const SHOPIFY_DOMAIN = "mega-jwels.myshopify.com";
// // const ADMIN_ACCESS_TOKEN = "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";
// // const API_VERSION = "2025-01";

// // /**
// //  * Core Shopify Admin API request
// //  */
// // async function request(query, variables = {}) {
// //   const res = await fetch(
// //     `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
// //     {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         "X-Shopify-Access-Token": ADMIN_ACCESS_TOKEN,
// //       },
// //       body: JSON.stringify({ query, variables }),
// //     }
// //   );

// //   const json = await res.json();

// //   if (json.errors) {
// //     console.error("Shopify Admin API Error:", JSON.stringify(json.errors, null, 2));
// //     throw new Error(json.errors[0].message);
// //   }

// //   return json.data;
// // }

// // /**
// //  * Get ALL articles (List View)
// //  * Fetches bodyHtml and truncates it for the excerpt to keep response light.
// //  */
// // export async function getAllArticles(first = 50) {
// //   const query = `
// //     query getBlogs {
// //       blogs(first: 10) {
// //         edges {
// //           node {
// //             id
// //             handle
// //             title
// //             articles(first: ${first}, reverse: true) {
// //               edges {
// //                 node {
// //                   id
// //                   title
// //                   handle
// //                   publishedAt
// //                   tags
// //                   image {
// //                     url
// //                     altText
// //                   }
// //                   author {
// //                     name
// //                   }
// //                   blog {
// //                     title
// //                     handle
// //                   }
// //                 }
// //               }
// //             }
// //           }
// //         }
// //       }
// //     }
// //   `;

// //   const data = await request(query);

// //   // Flatten articles from all blogs
// //   const allArticles = [];

// //   if (data.blogs && data.blogs.edges) {
// //     data.blogs.edges.forEach(blogEdge => {
// //       const blogTitle = blogEdge.node.title;
// //       const blogHandle = blogEdge.node.handle;

// //       if (blogEdge.node.articles && blogEdge.node.articles.edges) {
// //         blogEdge.node.articles.edges.forEach(articleEdge => {
// //           const node = articleEdge.node;
// //           // Create a plain text excerpt from bodyHtml
// //           const rawBody = node.bodyHtml || "";
// //           // Simple truncation, stripping HTML would be better but simple slice works for now as UI handles HTML
// //           const truncateLength = 200;
// //           const generatedExcerpt = rawBody.length > truncateLength
// //             ? rawBody.substring(0, truncateLength) + "..."
// //             : rawBody;

// //           allArticles.push({
// //             id: node.id,
// //             title: node.title,
// //             handle: node.handle,
// //             publishedAt: node.publishedAt,
// //             content: "", // Content not needed for list view
// //             excerpt: generatedExcerpt,
// //             image: node.image?.url || null,
// //             author: node.author?.name || "The Maison",
// //             blog: blogTitle,
// //             blogHandle: blogHandle,
// //             tags: node.tags
// //           });
// //         });
// //       }
// //     });
// //   }

// //   // Sort by date descending
// //   return allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
// // }

// // /**
// //  * Get SINGLE article by handle (Detail View)
// //  * Uses a specific query to find the article and fetches FULL bodyHtml.
// //  */
// // export async function getArticleByHandle(handle) {
// //   const query = `
// //     query getArticle {
// //       blogs(first: 10) {
// //         edges {
// //           node {
// //             title
// //             handle
// //             articles(first: 100, reverse: true) {
// //               edges {
// //                 node {
// //                   id
// //                   title
// //                   handle
// //                   publishedAt
// //                   tags
// //                   image {
// //                     url
// //                     altText
// //                   }
// //                   author {
// //                     name
// //                   }
// //                   blog {
// //                     title
// //                     handle
// //                   }
// //                 }
// //               }
// //             }
// //           }
// //         }
// //       }
// //     }
// //   `;

// //   const data = await request(query);

// //   let foundArticle = null;

// //   if (data.blogs && data.blogs.edges) {
// //     // Find the specific article
// //     for (const blogEdge of data.blogs.edges) {
// //       if (blogEdge.node.articles && blogEdge.node.articles.edges) {
// //         for (const articleEdge of blogEdge.node.articles.edges) {
// //           if (articleEdge.node.handle === handle) {
// //             const node = articleEdge.node;
// //             foundArticle = {
// //               id: node.id,
// //               title: node.title,
// //               handle: node.handle,
// //               publishedAt: node.publishedAt,
// //               content: node.bodyHtml || "",
// //               // Use empty excerpt for detail view to avoid duplicating the intro content
// //               excerpt: "",
// //               image: node.image?.url || null,
// //               author: node.author?.name || "The Maison",
// //               blog: blogEdge.node.title,
// //               blogHandle: blogEdge.node.handle,
// //               tags: node.tags
// //             };
// //             break;
// //           }
// //         }
// //       }
// //       if (foundArticle) break;
// //     }
// //   }

// //   return foundArticle;
// // }

// // /**
// //  * API Route
// //  */
// // export async function GET(request) {
// //   try {
// //     const { searchParams } = new URL(request.url);
// //     const handle = searchParams.get("handle");

// //     if (handle) {
// //       const article = await getArticleByHandle(handle);
// //       if (!article) {
// //         return NextResponse.json({ error: "Article not found" }, { status: 404 });
// //       }
// //       return NextResponse.json({ article }, { status: 200 });
// //     }

// //     const articles = await getAllArticles();
// //     return NextResponse.json({ articles }, { status: 200 });

// //   } catch (error) {
// //     console.error("API Route Error:", error);
// //     return NextResponse.json(
// //       { error: "Failed to fetch articles", message: error.message },
// //       { status: 500 }
// //     );
// //   }
// // }
