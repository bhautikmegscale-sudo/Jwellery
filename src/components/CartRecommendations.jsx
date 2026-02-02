"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Link from "next/link";
import { Plus } from "lucide-react";
import addToCartClient from "@/lib/cartClient";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function CompactProductCard({ product }) {
    const [adding, setAdding] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            let variantId = product?.variants?.[0]?.id;
            if (product?.variants?.edges?.length > 0) {
                variantId = product.variants.edges[0].node.id;
            }
            if (variantId) {
                await addToCartClient({
                    variantId,
                    quantity: 1,
                    product
                });
                window.dispatchEvent(new Event("open-cart-drawer"));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    const price = product.price || product.variants?.[0]?.price || "0";

    return (
        <div className="flex gap-2 bg-white p-1.5 rounded-lg border border-stone-100 hover:border-stone-300 transition-colors group">
            <Link href={`/products/${product.handle}`} className="shrink-0">
                <div className="w-14 h-14 bg-stone-100 rounded-md overflow-hidden">
                    <img
                        src={product.featuredImage?.url || product.images?.[0]?.src}
                        alt={product.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </Link>
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h4 className="text-xs font-medium text-stone-800 line-clamp-2 leading-snug">
                        <Link href={`/products/${product.handle}`}>
                            {product.title}
                        </Link>
                    </h4>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-[#8f4a12]">
                        ₹{parseFloat(price).toLocaleString('en-IN')}
                    </span>
                    <button
                        onClick={handleAdd}
                        disabled={adding}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-900 hover:text-white transition-all disabled:opacity-50"
                        title="Add to cart"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CartRecommendations({ isMobile }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/product?first=20");
                const data = await res.json();

                if (data.products) {
                    const shuffled = [...data.products].sort(() => 0.5 - Math.random());
                    setProducts(shuffled.slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    if (loading) return null;
    if (products.length === 0) return null;

    const sliderSettings = {
        dots: false,
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        swipeToSlide: true,
        autoplay: true,
    };

    if (isMobile) {
        return (
            <div className="max-h-100px flex flex-col">
                <h3 className="text-sm font-serif font-bold mb-2 px-1">You May Also Like</h3>
                <div className="">
                    <Slider {...sliderSettings}>
                        {products.map((product) => (
                            <div key={product.id} className="px-1.5 focus:outline-none">
                                <CompactProductCard product={product} />
                            </div>
                        ))}
                    </Slider>
                </div>
                <style jsx>{`
                    .slider-compact :global(.slick-list) {
                        margin: 0;
                        height: 100%;
                    }
                    .slider-compact :global(.slick-track) {
                        display: flex;
                        align-items: center;
                    }
                `}</style>
            </div>
        );
    }

    // Desktop Vertical List
    return (
        <div className="h-full flex flex-col p-6 overflow-y-auto no-scrollbar">
            <h3 className="text-lg font-serif text-black mb-6">You May Also Like</h3>
            <div className="flex flex-col gap-4">
                {products.map((product) => (
                    <div key={product.id} className="w-full">
                        <CompactProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
}
