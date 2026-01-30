"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, ChevronLeft, Share2 } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function ArticlePage() {
    const { handle } = useParams();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!handle) return;

        async function fetchArticle() {
            try {
                const res = await fetch(`/api/blogs?handle=${handle}`);
                if (!res.ok) throw new Error("Article not found");

                const data = await res.json();

                // Normalize Storefront API → UI format
                setPost({
                    ...data.article,
                    content: data.article.contentHtml,
                    excerpt: data.article.excerpt,
                });
            } catch (error) {
                console.error("Failed to fetch article:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchArticle();
    }, [handle]);

    const formatDate = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const getReadTime = (content) => {
        if (!content) return "1 min";
        const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
        return `${Math.ceil(words / 200)} min`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFCFB]">
                <Navbar />
                <div className="flex h-screen items-center justify-center">
                    <p className="font-serif italic text-stone-400">Loading story...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#FDFCFB]">
                <Navbar />
                <div className="flex h-screen flex-col items-center justify-center gap-4">
                    <p className="font-serif italic text-stone-400">Story not found.</p>
                    <Link
                        href="/journal"
                        className="text-xs uppercase tracking-widest underline"
                    >
                        Return to Journal
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Custom Nav */}
            <nav className="sticky top-0 z-[310] bg-white/90 backdrop-blur-md border-b border-stone-100 px-6 py-6">
                <div className="max-w-[1000px] mx-auto flex justify-between items-center">
                    <Link
                        href="/journal"
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 transition-colors"
                    >
                        <ChevronLeft size={16} /> Back to Journal
                    </Link>
                    <div className="flex items-center gap-6 text-stone-400">
                        <Link href="/journal">
                            <X
                                size={22}
                                className="cursor-pointer hover:text-stone-900 transition-colors"
                            />
                        </Link>
                    </div>
                </div>
            </nav>

            <article className="max-w-[1000px] mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="text-center mb-16 space-y-6">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#C5A059] font-bold">
                        {post.blog}
                    </p>
                    <h1 className="text-4xl md:text-6xl font-serif italic leading-tight text-stone-900">
                        {post.title}
                    </h1>
                    <div className="flex justify-center items-center gap-6 text-[10px] uppercase tracking-widest text-stone-400 pt-4">
                        <span className="flex items-center gap-2">
                            <Calendar size={14} /> {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock size={14} /> {getReadTime(post.content)} Read
                        </span>
                    </div>
                </header>

                {post.image && (
                    <div className="aspect-video w-full mb-16 overflow-hidden bg-stone-100">
                        <img
                            src={post.image.url || post.image}
                            className="w-full h-full object-cover"
                            alt={post.title}
                        />
                    </div>
                )}

                <div className="max-w-[700px] mx-auto">
                    <div
                        className="shopify-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <div className="mt-20 pt-10 border-t border-stone-100 flex justify-between items-center">
                        <div className="flex gap-4 flex-wrap">
                            {post.tags &&
                                post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[10px] uppercase tracking-widest bg-stone-50 px-4 py-2 text-stone-400"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                        </div>
                    </div>
                </div>
            </article>

            <footer className="bg-stone-50 py-20 px-6 text-center">
                <h3 className="text-2xl font-serif italic mb-6">
                    Want more Maison stories?
                </h3>
                <button className="bg-stone-900 text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-[#C5A059] transition-all">
                    Subscribe to the Journal
                </button>
            </footer>
        </div>
    );
}


// "use client";
// import React, { useState, useEffect } from 'react';
// import { X, Calendar, Clock, ChevronLeft, Share2 } from 'lucide-react';
// import { useParams } from 'next/navigation'; // Correct hook for App Router params in client components
// import Link from 'next/link';
// import Navbar from '../../../components/Navbar';
// import Footer from '../../../components/Footer';

// export default function ArticlePage({ params }) {
//     // In Next.js 13+ App Router, params are passed as prop to page, but unwrapping them in client component might require use?
//     // Actually page props receive params directly.
//     const { handle } = React.use(params);

//     const [post, setPost] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         async function fetchArticle() {
//             try {
//                 const res = await fetch(`/api/blogs?handle=${handle}`);
//                 if (!res.ok) throw new Error("Article not found");
//                 const data = await res.json();
//                 setPost(data.article);
//             } catch (error) {
//                 console.error("Failed to fetch article:", error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         if (handle) fetchArticle();
//     }, [handle]);

//     const formatDate = (isoString) => {
//         if (!isoString) return "";
//         return new Date(isoString).toLocaleDateString('en-US', {
//             month: 'long', day: 'numeric', year: 'numeric'
//         });
//     };

//     const getReadTime = (content) => {
//         if (!content) return "1 min";
//         const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
//         return `${Math.ceil(words / 200)} min`;
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-[#FDFCFB]">
//                 <Navbar />
//                 <div className="flex h-screen items-center justify-center">
//                     <p className="font-serif italic text-stone-400">Loading story...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!post) {
//         return (
//             <div className="min-h-screen bg-[#FDFCFB]">
//                 <Navbar />
//                 <div className="flex h-screen flex-col items-center justify-center gap-4">
//                     <p className="font-serif italic text-stone-400">Story not found.</p>
//                     <Link href="/journal" className="text-xs uppercase tracking-widest underline">Return to Journal</Link>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-white">
//             {/* Custom Nav for Article Reading Mode */}
//             <nav className="sticky top-0 z-[310] bg-white/90 backdrop-blur-md border-b border-stone-100 px-6 py-6">
//                 <div className="max-w-[1000px] mx-auto flex justify-between items-center">
//                     <Link
//                         href="/journal"
//                         className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 transition-colors"
//                     >
//                         <ChevronLeft size={16} /> Back to Journal
//                     </Link>
//                     <div className="flex items-center gap-6 text-stone-400">
//                         <Share2 size={18} className="cursor-pointer hover:text-stone-900 transition-colors" />
//                         <Link href="/journal"><X size={22} className="cursor-pointer hover:text-stone-900 transition-colors" /></Link>
//                     </div>
//                 </div>
//             </nav>

//             <article className="max-w-[1000px] mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
//                 <header className="text-center mb-16 space-y-6">
//                     <p className="text-[11px] uppercase tracking-[0.3em] text-[#C5A059] font-bold">{post.blog}</p>
//                     <h1 className="text-4xl md:text-6xl font-serif italic leading-tight text-stone-900">
//                         {post.title}
//                     </h1>
//                     <div className="flex justify-center items-center gap-6 text-[10px] uppercase tracking-widest text-stone-400 pt-4">
//                         <span className="flex items-center gap-2"><Calendar size={14} /> {formatDate(post.publishedAt)}</span>
//                         <span className="flex items-center gap-2"><Clock size={14} /> {getReadTime(post.content)} Read</span>
//                     </div>
//                 </header>

//                 {post.image && (
//                     <div className="aspect-video w-full mb-16 overflow-hidden bg-stone-100">
//                         <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
//                     </div>
//                 )}

//                 <div className="max-w-[700px] mx-auto">
//                     {post.excerpt && (
//                         <div
//                             className="text-xl font-serif italic text-stone-600 mb-10 leading-relaxed border-l-4 border-[#C5A059] pl-8"
//                             dangerouslySetInnerHTML={{ __html: post.excerpt }}
//                         />
//                     )}

//                     <div className="prose prose-stone lg:prose-xl font-light text-stone-700">
//                         <div dangerouslySetInnerHTML={{ __html: post.content }} />
//                     </div>

//                     <div className="mt-20 pt-10 border-t border-stone-100 flex justify-between items-center">
//                         <div className="flex gap-4 flex-wrap">
//                             {post.tags && post.tags.map(tag => (
//                                 <span key={tag} className="text-[10px] uppercase tracking-widest bg-stone-50 px-4 py-2 text-stone-400">#{tag}</span>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </article>

//             <footer className="bg-stone-50 py-20 px-6 text-center">
//                 <h3 className="text-2xl font-serif italic mb-6">Want more Maison stories?</h3>
//                 <button className="bg-stone-900 text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-[#C5A059] transition-all">
//                     Subscribe to the Journal
//                 </button>
//             </footer>
//         </div>
//     );
// }
