"use client";
import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar2 from "../../components/Navbar2";
import Footer from "../../components/Footer";

export default function JournalPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch("/api/blogs");
        const data = await res.json();

        // 🔥 Flatten blogs → articles
        if (data.blogs) {
          const flat = data.blogs.flatMap(blog =>
            blog.articles.map(article => ({
              ...article,
              blog: blog.title,
              blogHandle: blog.handle,
              content: article.contentHtml, // normalize
              image: article.image?.url || null
            }))
          );
          setArticles(flat);
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getReadTime = (content) => {
    if (!content) return "1 min";
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return `${Math.ceil(words / 200)} min`;
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans flex flex-col">
      <Navbar2 />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-12">
        <header className="text-center mb-20">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#C5A059] mb-4 font-bold">
            The Journal
          </p>
          <h1 className="text-5xl md:text-7xl font-serif italic text-stone-900">
            Maison Stories
          </h1>
        </header>

        {loading ? (
          <div className="py-20 text-center">
            <p className="font-serif italic text-stone-400">
              Loading stories...
            </p>
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
            {articles.map((post) => (
              <article key={post.id} className="group cursor-pointer">
                <Link href={`/journal/${post.handle}`}>
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 mb-8">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400 font-serif italic">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-stone-400 font-bold">
                      <span>{post.blog}</span>
                      <span className="w-8 h-[1px] bg-stone-200" />
                      <span>{getReadTime(post.content)} Read</span>
                    </div>

                    <h2 className="text-2xl font-serif text-stone-800 leading-snug group-hover:text-[#C5A059] transition-colors">
                      {post.title}
                    </h2>

                    <div
                      className="text-stone-500 text-sm font-light leading-relaxed line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: post.excerpt || post.content,
                      }}
                    />

                    <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold pt-2 border-b border-transparent hover:border-stone-900 transition-all">
                      Read Story <ArrowRight size={14} />
                    </button>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}



// "use client";
// import React, { useState, useEffect } from "react";
// import { ArrowRight } from "lucide-react";
// import Link from "next/link";
// import Navbar2 from "../../components/Navbar2";
// import Footer from "../../components/Footer";

// export default function JournalPage() {
//   const [articles, setArticles] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchArticles() {
//       try {
//         const res = await fetch("/api/blogs");
//         const data = await res.json();
//         if (data.articles) {
//           setArticles(data.articles);
//         }
//       } catch (error) {
//         console.error("Failed to fetch articles:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchArticles();
//   }, []);

//   // Format date helper
//   const formatDate = (isoString) => {
//     if (!isoString) return "";
//     return new Date(isoString).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   // Estimate read time helper
//   const getReadTime = (content) => {
//     if (!content) return "1 min";
//     const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
//     return `${Math.ceil(words / 200)} min`;
//   };

//   return (
//     <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans flex flex-col">
//       <Navbar2 />

//       {/* MAIN CONTENT */}
//       <main className="flex-grow pt-32 pb-20 px-6 md:px-12">
//         <header className="text-center mb-20">
//           <p className="text-[10px] uppercase tracking-[0.5em] text-[#C5A059] mb-4 font-bold">
//             The Journal
//           </p>
//           <h1 className="text-5xl md:text-7xl font-serif italic text-stone-900">
//             Maison Stories
//           </h1>
//         </header>

//         {loading ? (
//           <div className="py-20 text-center">
//             <p className="font-serif italic text-stone-400">
//               Loading stories...
//             </p>
//           </div>
//         ) : (
//           <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
//             {articles.map((post) => (
//               <article key={post.id} className="group cursor-pointer">
//                 <Link href={`/journal/${post.handle}`}>
//                   <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 mb-8">
//                     {post.image ? (
//                       <img
//                         src={post.image}
//                         alt={post.title}
//                         className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
//                       />
//                     ) : (
//                       <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400 font-serif italic">
//                         No Image
//                       </div>
//                     )}
//                   </div>

//                   <div className="space-y-4">
//                     <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-stone-400 font-bold">
//                       <span>{post.blog}</span>
//                       <span className="w-8 h-[1px] bg-stone-200" />
//                       <span>{getReadTime(post.content)} Read</span>
//                     </div>

//                     <h2 className="text-2xl font-serif text-stone-800 leading-snug group-hover:text-[#C5A059] transition-colors">
//                       {post.title}
//                     </h2>

//                     <div
//                       className="text-stone-500 text-sm font-light leading-relaxed line-clamp-2"
//                       dangerouslySetInnerHTML={{
//                         __html: post.excerpt || post.content,
//                       }}
//                     />

//                     <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold pt-2 border-b border-transparent hover:border-stone-900 transition-all">
//                       Read Story <ArrowRight size={14} />
//                     </button>
//                   </div>
//                 </Link>
//               </article>
//             ))}
//           </div>
//         )}
//       </main>

//       {/* FOOTER */}
//       <Footer />
//     </div>
//   );
// }
