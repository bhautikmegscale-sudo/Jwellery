"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar2 from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';


const CollectionDetailPage = () => {
    const params = useParams();
    const handle = params?.handle;
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!handle) return;

        const fetchCollection = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/collections?handle=${handle}`);
                const data = await response.json();

                if (response.ok) {
                    setCollection(data.collection);
                } else {
                    setError(data.error || 'Failed to load collection');
                }
            } catch (err) {
                console.error('Error fetching collection:', err);
                setError('Failed to load collection');
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [handle]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
                    <p className="text-stone-500 text-sm">Loading collection...</p>
                </div>
            </div>
        );
    }

    if (error || !collection) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Collection not found'}</p>
                    <a href="/category" className="text-stone-900 underline">Back to Collections</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-stone-900 overflow-x-hidden flex flex-col">
            <Navbar2 />

            {/* Collection Header */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {collection.image ? (
                        <img
                            src={collection.image.url}
                            className="w-full h-full object-cover grayscale-[0.3]"
                            alt={collection.image.altText || collection.title}
                        />
                    ) : (
                        <div className="w-full h-full bg-stone-200"></div>
                    )}
                    <div className="absolute inset-0 bg-stone-900/50" />
                </div>
                <div className="relative z-10 text-center px-6 max-w-4xl">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-white/80 mb-4">
                        Collection
                    </p>
                    <h1 className="text-5xl md:text-7xl font-serif italic text-white leading-tight mb-4">
                        {collection.title}
                    </h1>
                    {collection.description && (
                        <p className="text-white/90 font-light text-sm md:text-base max-w-2xl mx-auto">
                            {collection.description}
                        </p>
                    )}
                    <p className="text-white/70 text-xs mt-4 uppercase tracking-widest">
                        {collection.productsCount} {collection.productsCount === 1 ? 'Piece' : 'Pieces'}
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="max-w-7xl mx-auto px-6 py-16">
                {collection.products && collection.products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {collection.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-stone-500 text-lg">No products found in this collection.</p>
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
};

export default CollectionDetailPage;
