"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar2 from '../../components/Navbar2';
import Footer from '../../components/Footer';

const CollectionPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/collections');
                const data = await response.json();

                if (response.ok) {
                    setCollections(data.collections);
                } else {
                    setError(data.error || 'Failed to load collections');
                }
            } catch (err) {
                console.error('Error fetching collections:', err);
                setError('Failed to load collections');
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    return (
        <div className="bg-[#FCFBFA] min-h-screen">
            <Navbar2 />

            {/* Hero Header */}
            <header className="pt-40  px-6 text-center max-w-4xl mx-auto">
                <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-4 block">
                    Curated Selections
                </span>
                <h1 className="text-5xl md:text-6xl font-serif text-stone-900 mb-6 italic">
                    Categories
                </h1>
            </header>

            {/* Grid Layout */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
                            <p className="text-stone-500 text-sm">Loading categories...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-stone-900 underline"
                        >
                            Try Again
                        </button>
                    </div>
                ) : collections.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-stone-500 text-lg">No categories found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {collections.map((col) => (
                            <Link
                                key={col.id}
                                href={`/category/${col.handle}`}
                                className="group cursor-pointer border border-stone-200 rounded-2xl bg-white p-4 transition-all duration-300 hover:border-stone-400 hover:shadow-sm"
                            >
                                {/* Image Container with Fixed Aspect Ratio */}
                                <div className="relative overflow-hidden rounded-xl bg-stone-100 aspect-[4/5]">
                                    {col.image ? (
                                        <img
                                            src={col.image.url}
                                            alt={col.image.altText || col.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                                            <span className="text-stone-400 text-sm">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                                </div>

                                <div className="mt-6 space-y-2">
                                    <div className="flex justify-between items-end">
                                        <h3 className="text-xl font-serif text-stone-800">{col.title}</h3>

                                    </div>
                                    {col.description && (
                                        <p className="text-stone-500 font-light text-sm leading-relaxed line-clamp-2">
                                            {col.description}
                                        </p>
                                    )}
                                    <div className="pt-2 text-[10px] uppercase tracking-[0.2em] font-medium border-b border-stone-300 pb-1 group-hover:border-stone-900 transition-all inline-block">
                                        Explore Categories
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CollectionPage;
