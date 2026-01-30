"use client";
import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                // Fetch more products (50) to ensure we have enough after deduplication
                const res = await fetch('/api/product?first=50');
                const data = await res.json();
                if (data.products) {
                    setProducts(data.products.slice(0, 4));
                }
            } catch (error) {
                console.error("Failed to fetch featured products:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <section className="bg-white py-32 px-8">
                <div className="max-w-[1400px] mx-auto text-center">
                    <p className="text-stone-400 font-serif italic">Loading collections...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white py-16 px-8">
            <h1 className="text-2xl md:text-5xl font-light tracking-[0.15em] text-center mb-12 uppercase font-serif text-[#1a1a1a]">
                Our Products
            </h1>
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {products.map((product) => {
                        // Extract price correctly from the API response
                        // Shopify stores prices as integers (e.g., 29999 = ₹299.99)
                        let priceValue = 'N/A';
                        if (product.price && product.price.amount) {
                            priceValue = (parseFloat(product.price.amount) / 100).toFixed(2);
                        } else if (product.priceRange && product.priceRange.minVariantPrice) {
                            priceValue = (parseFloat(product.priceRange.minVariantPrice.amount) / 100).toFixed(2);
                        }

                        return (
                            <ProductCard
                                key={product.id}
                                product={product}
                                name={product.title}
                                price={priceValue}
                                category={product.productType}
                                img={product.featuredImage?.url || ""}
                                href={`/products/${product.handle}`}
                            />
                        );
                    })}

                    {/* Fallback if no products found */}
                    {!loading && products.length === 0 && (
                        <div className="col-span-full text-center text-stone-500">
                            No products found.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
