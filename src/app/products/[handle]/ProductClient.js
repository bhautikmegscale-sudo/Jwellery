"use client";
import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import {
    ShieldCheck, Truck, RotateCcw,
    Heart, Share2, ChevronRight, ChevronDown, ChevronLeft,
    ArrowLeft, ArrowRight, Star, CheckCircle, X
} from 'lucide-react';
import Navbar from '../../../components/Navbar2';
import Footer from '../../../components/Footer';
import FAQItem from '../../../components/Faq';
import JewelryShowcase from '../../../components/Discover';
import YouMayAlsoLike from '../../../components/YouMayAlsoLike';
import TrustIcon from '../../../components/TrustIcon';
import Link from 'next/link';
import addToCartClient from '@/lib/cartClient';
import { authClient } from '@/lib/authClient';
// Reusable Collapsible Component
const CollapsibleRow = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-stone-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-medium text-stone-800 hover:text-[#C5A059] transition-colors"
            >
                {title}
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="text-sm leading-relaxed text-stone-600 font-light">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- REVIEWS SECTION COMPMENTS ---

const ReviewsSection = ({ product }) => {
    // Parse initial reviews safely
    const [reviews, setReviews] = useState(() => {
        const meta = product?.metafields?.find(m => m.namespace === 'custom' && m.key === 'reviews')?.value;
        if (!meta) return [];
        try {
            const parsed = JSON.parse(meta);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    });

    // Sync reviews when product changes
    useEffect(() => {
        const meta = product?.metafields?.find(m => m.namespace === 'custom' && m.key === 'reviews')?.value;
        if (meta) {
            try {
                const parsed = JSON.parse(meta);
                setReviews(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                setReviews([]);
            }
        }
    }, [product]);

    const [selectedReview, setSelectedReview] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 6;

    // Calculate Pagination indices
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    // Change page
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Optional: Scroll to top of reviews section
        const reviewSection = document.getElementById('client-reviews-title');
        if (reviewSection) {
            reviewSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // Auto-fill Name if logged in
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await authClient.getCustomer();
                if (user) {
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                    setForm(prev => ({
                        ...prev,
                        name: fullName || user.email || prev.name
                    }));
                }
            } catch (e) {
                // Not logged in or error
            }
        };
        fetchUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    ...form
                })
            });

            const data = await res.json();
            if (res.ok) {
                setReviews(data.reviews);
                setForm(prev => ({ ...prev, rating: 5, comment: '' })); // Keep name populated
                setMessage('Thank you! Your review has been submitted.');
            } else {
                setMessage(data.error || 'Failed to submit review.');
            }
        } catch (error) {
            console.error(error);
            setMessage('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const averageRating = reviews.length
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="py-14">

            {/* Title */}
            <h3 id="client-reviews-title" className="text-[20px] font-serif italic text-stone-900 mb-12">
                Client Reviews
            </h3>

            {/* TOP SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">

                {/* Average Rating & Breakdown (LEFT) */}
                <div className="bg-white border border-stone-200 p-10 rounded-md shadow-sm space-y-10">

                    {/* TOP: Average Rating */}
                    <div className="flex flex-col items-center text-center gap-2">

                        {/* Stars + Average Rating (ONE ROW) */}
                        <div className="flex items-center gap-6">

                            {/* Stars */}
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={24}
                                        fill={star <= Math.round(averageRating) ? "currentColor" : "none"}
                                        className={star <= Math.round(averageRating)
                                            ? "text-[#C5A059]"
                                            : "text-stone-300"}
                                    />
                                ))}
                            </div>

                            {/* Rating */}
                            <div className="text-4xl font-serif text-stone-900 leading-none">
                                {averageRating}
                                <span className="text-lg font-normal text-stone-500"> / 5</span>
                            </div>

                        </div>

                        {/* Review Count (CENTERED BELOW) */}
                        <p className="text-sm text-stone-500 flex items-center gap-2">
                            Based on {reviews.length} review{reviews.length !== 1 && "s"}
                            <span className="text-[#C5A059] bg-[#C5A059]/10 rounded-full p-1">
                                <ShieldCheck size={12} />
                            </span>
                        </p>

                    </div>

                    {/* BOTTOM: Rating Distribution */}
                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = reviews.filter(r => r.rating === rating).length;
                            const percentage = reviews.length ? (count / reviews.length) * 100 : 0;

                            return (
                                <div key={rating} className="flex items-center gap-4 text-sm">

                                    {/* Stars */}
                                    <div className="flex gap-0.5 w-20 justify-end">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                fill={i < rating ? "currentColor" : "none"}
                                                className={i < rating
                                                    ? "text-[#C5A059]"
                                                    : "text-stone-300"}
                                            />
                                        ))}
                                    </div>

                                    {/* Bar */}
                                    <div className="flex-1 h-3 bg-stone-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#C5A059] rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    {/* Count */}
                                    <span className="w-6 text-right text-stone-600 font-medium">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                </div>


                {/* Write Review (RIGHT) */}
                <div className="bg-white border border-stone-200 p-10 rounded-md shadow-sm">
                    <h4 className="text-[12px] uppercase tracking-widest font-bold text-stone-900 mb-8">
                        Write a Review
                    </h4>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full border-b border-stone-300 py-2 text-sm focus:border-[#C5A059] outline-none bg-transparent"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
                                    Rating
                                </label>
                                <div className="flex gap-2 py-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setForm({ ...form, rating: star })}
                                            className="transition-transform hover:scale-125 focus:outline-none"
                                        >
                                            <Star
                                                size={20}
                                                fill={star <= form.rating ? "#C5A059" : "none"}
                                                className={star <= form.rating ? "text-[#C5A059]" : "text-stone-300 hover:text-[#C5A059]"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[9px] uppercase tracking-widest text-stone-500 mb-2">
                                Your Review
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={form.comment}
                                onChange={e => setForm({ ...form, comment: e.target.value })}
                                className="w-full border border-stone-200 p-4 text-sm focus:border-[#C5A059] outline-none bg-stone-50 resize-none rounded-md"
                                placeholder="Share your experience..."
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <p className="text-xs text-[#C5A059]">{message}</p>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-stone-900 text-white px-10 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#C5A059] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Post Review"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ALL REVIEWS (BOTTOM) - Horizontal Scroll */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                {currentReviews.length === 0 ? (
                    <p className="col-span-full text-sm italic text-stone-400">
                        No reviews yet. Be the first to share your thoughts.
                    </p>
                ) : (
                    currentReviews.map((review, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedReview(review)}
                            className="relative p-6 border border-stone-200 rounded-md bg-white shadow-sm cursor-pointer hover:border-[#C5A059] hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-[11px] uppercase tracking-widest font-bold text-stone-900">
                                    {review.name}
                                </h4>
                                <span className="text-[10px] text-stone-400">
                                    {new Date(review.date).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex gap-1 text-[#C5A059] mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={12}
                                        fill={star <= review.rating ? "currentColor" : "none"}
                                        className={star <= review.rating
                                            ? "text-[#C5A059]"
                                            : "text-stone-300"}
                                    />
                                ))}
                            </div>

                            <p className="text-sm text-stone-600 font-light leading-relaxed">
                                {review.comment}
                            </p>
                        </div>
                    ))
                )}

            </div>

            {/* PAGINATION CONTROLS */}
            {reviews.length > reviewsPerPage && (
                <div className="flex justify-center items-center gap-4 mt-12">
                    {/* Previous Button */}
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-stone-200 rounded-full hover:bg-[#C5A059] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-400 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`w-8 h-8 flex items-center justify-center text-xs rounded-full transition-colors ${currentPage === number
                                    ? 'bg-[#C5A059] text-white font-bold'
                                    : 'text-stone-600 hover:bg-stone-100'
                                    }`}
                            >
                                {number}
                            </button>
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-stone-200 rounded-full hover:bg-[#C5A059] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-400 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}




            {/* REVIEW DETAILS MODAL */}
            {
                selectedReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-in zoom-in-95 duration-200 border border-stone-100">
                            <button
                                onClick={() => setSelectedReview(null)}
                                className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 transition-colors bg-stone-100 rounded-full p-2"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-lg font-bold text-stone-500 uppercase">
                                    {selectedReview.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-stone-900 mb-1">
                                        {selectedReview.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-[#C5A059]">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={14}
                                                    fill={star <= selectedReview.rating ? "currentColor" : "none"}
                                                    className={star <= selectedReview.rating ? "text-[#C5A059]" : "text-stone-300"}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-stone-400">
                                            {new Date(selectedReview.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                <p className="text-stone-600 font-light leading-relaxed italic text-lg break-words whitespace-pre-wrap">
                                    "{selectedReview.comment}"
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 uppercase tracking-widest">
                                <span>Verified Purchase</span>
                                <ShieldCheck size={16} className="text-green-600" />
                            </div>
                        </div>
                        {/* Backdrop Click to Close */}
                        <div className="absolute inset-0 -z-10" onClick={() => setSelectedReview(null)} />
                    </div>
                )
            }

        </div >

    );
};

export default function ProductPage({ product }) {
    const searchParams = useSearchParams();

    // Helpers to safely get media (images or 3D models)
    // Ensure we handle both the new 'media' array and legacy 'images' array for fallback
    const media = product?.media && product.media.length > 0
        ? product.media
        : product?.images?.length
            ? product.images.map(img => ({ type: 'image', url: img.url || img, altText: 'Product Image' }))
            : [{ type: 'image', url: product?.featuredImage?.url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070", altText: 'Placeholder' }];

    const [activeImg, setActiveImg] = useState(() => {
        const viewOverride = searchParams.get('view');
        if (viewOverride === 'model') {
            const modelIndex = media.findIndex(m => m.type === 'model');
            if (modelIndex !== -1) return modelIndex;
        }
        return 0;
    });

    // Track if user is currently viewing a model to persist state across variant changes
    const isModelViewRef = React.useRef(false);
    useEffect(() => {
        isModelViewRef.current = (media[activeImg]?.type === 'model');
    }, [activeImg, media]);

    // Extract options from variants
    // product.variants is a flat array of variant objects
    const productOptions = {};
    if (product?.variants?.length) {
        product.variants.forEach((variant) => {
            variant.selectedOptions.forEach((opt) => {
                if (!productOptions[opt.name]) {
                    productOptions[opt.name] = new Set();
                }
                productOptions[opt.name].add(opt.value);
            });
        });
    }

    // Convert Sets to Arrays and filter out "Title" -> "Default Title"
    const optionsList = Object.keys(productOptions)
        .filter(
            (name) => !(name === "Title" && productOptions[name].has("Default Title"))
        )
        .map((name) => ({
            name,
            values: Array.from(productOptions[name]),
        }));

    // State for selected options
    const [selections, setSelections] = useState(() => {
        const initial = {};
        optionsList.forEach((opt) => {
            initial[opt.name] = opt.values[0]; // Default to first value
        });
        return initial;
    });

    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const res = await fetch('/api/product?first=50');
                const data = await res.json();
                if (data.products) {
                    // Randomize the results
                    const shuffled = [...data.products].sort(() => 0.5 - Math.random());

                    const filtered = shuffled
                        .filter(p => p.handle !== product.handle && p.productType === product.productType)
                        .slice(0, 2);

                    if (filtered.length < 2) {
                        const others = shuffled
                            .filter(p => p.handle !== product.handle && p.productType !== product.productType)
                            .slice(0, 2 - filtered.length);
                        setRelatedProducts([...filtered, ...others]);
                    } else {
                        setRelatedProducts(filtered);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch related products", err);
            }
        };
        fetchRelated();
    }, [product.handle, product.productType]);

    // Find active variant based on selections
    const activeVariant =
        product?.variants?.find((variant) => {
            return variant.selectedOptions.every(
                (opt) => selections[opt.name] === opt.value
            );
        }) || product?.variants?.[0]; // Fallback

    // Update image when active variant changes
    useEffect(() => {
        // If the user has explicitly chosen to view the 3D model, don't auto-switch to variant image
        if (isModelViewRef.current) return;

        if (activeVariant?.image?.url) {
            const variantImgUrl = activeVariant.image.url;
            // Find index in media array
            const index = media.findIndex(m => m.url === variantImgUrl);
            if (index !== -1) {
                setActiveImg(index);
            }
        }
    }, [activeVariant, media]);

    const scrollRef = React.useRef(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        function handleWheel(e) {
            // same intent: disable after page scroll
            if (window.scrollY > 100) return;

            // NEW: If the event target is inside the model viewer, let it handle the zoom
            if (e.target.closest('model-viewer')) return;

            const delta = e.deltaY;

            const atTop = el.scrollTop <= 0;
            const atBottom =
                Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight - 1;

            // SAME behaviour: inner scroll first
            if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
                e.preventDefault();
                el.scrollTop += delta;
            }
        }

        window.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            window.removeEventListener("wheel", handleWheel);
        };
    }, []);

    const handleSelection = (optionName, value) => {
        setSelections((prev) => ({ ...prev, [optionName]: value }));
    };

    const rawPrice = activeVariant?.price?.amount || activeVariant?.price || product?.priceRange?.minVariantPrice?.amount;
    const currentPrice = rawPrice ? Number(rawPrice).toFixed(2) : "4,200";
    const currency = activeVariant?.price?.currencyCode || product?.priceRange?.minVariantPrice?.currencyCode || "USD";

    const descriptionHtml = product?.description || "A timeless piece of fine jewelry crafted with precision and passion. This signature piece embodies the harmony of classic silhouettes and modern refinement.";

    const title = product?.title || "The Eternal Ellipse Ring";

    // Details extraction
    const details = product?.metafields?.filter(m => m.namespace === 'custom' && m.key.startsWith('detail_'))?.map(m => m.value) || [
        "18k Solid Gold",
        "0.5ct VS1 Diamond",
        "Handmade in Italy",
        "Conflict-Free",
    ];

    // Sibling Variants Handling
    const SiblingVariants = () => {
        // product.siblings is a flat array
        if (!product?.metafields || !product.siblings?.length) return null;

        // Helper to get metafield value
        const getMeta = (p, key) =>
            p.metafields?.find(
                (m) => m.key === key && m.namespace === "custom"
            )?.value;

        // 1. Get common_id to ensure strict checking
        const commonId = getMeta(product, "common_id");

        // 2. Get all nodes (self + siblings) and ensure they share common_id
        const allNodes = [product, ...product.siblings].filter(
            (p) => {
                const pCommonId = getMeta(p, "common_id");
                return pCommonId && pCommonId === commonId;
            }
        );

        // 3. Extract Options
        const currentOp1 = getMeta(product, "variant_id") || "Current"; // e.g., Metal
        const currentOp2 = getMeta(product, "variant_value") || "Standard"; // e.g., Carat

        // 4. Get Unique Values for each dimension
        const uniqueOp1 = [
            ...new Set(
                allNodes.map((p) => getMeta(p, "variant_id") || "Current")
            ),
        ].filter(Boolean).sort();
        const uniqueOp2 = [
            ...new Set(
                allNodes.map(
                    (p) => getMeta(p, "variant_value") || "Standard"
                )
            ),
        ].filter(Boolean).sort();

        const handleSiblingClick = (targetOp1, targetOp2) => {
            // Find product matching BOTH + Common ID check (implicit via allNodes filter)
            let match = allNodes.find(
                (p) =>
                    (getMeta(p, "variant_id") || "Current") === targetOp1 &&
                    (getMeta(p, "variant_value") || "Standard") === targetOp2
            );
            // Fallback
            if (!match) {
                match = allNodes.find(
                    (p) =>
                        (getMeta(p, "variant_id") || "Current") === targetOp1
                );
            }
            if (match && match.handle !== product.handle) {
                const isModel = media[activeImg]?.type === 'model';
                const query = isModel ? '?view=model' : '';
                window.location.href = `/products/${match.handle}${query}`;
            }
        };

        return (
            <div className="space-y-6 mb-8 pt-8 border-t border-stone-200">
                {/* Dimension 1 (e.g. Metal) */}
                {uniqueOp1.length > 0 && (
                    <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-stone-800 mb-3">
                            Metal
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {uniqueOp1.map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleSiblingClick(val, currentOp2)}
                                    className={`px-5 py-2 text-[10px] uppercase tracking-widest  transition-all
                    ${val === currentOp1 ? 'bg-[#C5A059] text-white shadow-md cursor-default' : 'border border-stone-200 hover:border-[#C5A059] text-stone-600 hover:text-[#C5A059]'}`}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {/* Dimension 2 (e.g. Carat) */}
                {uniqueOp2.length > 1 && (
                    <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-stone-800 mb-3">
                            Carat
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {uniqueOp2.map((val) => {
                                // Check if this combination exists for the current Op1 selection
                                const exists = allNodes.some(
                                    (p) =>
                                        (getMeta(p, "variant_id") || "Current") === currentOp1 &&
                                        (getMeta(p, "variant_value") || "Standard") === val
                                );
                                return (
                                    <button
                                        key={val}
                                        onClick={() => handleSiblingClick(currentOp1, val)}
                                        disabled={!exists}
                                        className={`px-5 py-2 text-[10px] uppercase tracking-widest transition-all flex items-center gap-2
                      ${val === currentOp2 ? 'bg-[#C5A059] text-white shadow-md cursor-default' : exists ? 'border border-stone-200 hover:border-[#C5A059] text-stone-600 hover:text-[#C5A059]' : 'border border-stone-100 text-stone-300 cursor-not-allowed'}`}
                                    >
                                        {val} {exists ? "" : "✕"}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const handleAddToCart = async () => {
        if (!activeVariant) return;

        setLoading(true);
        try {
            await addToCartClient({
                variantId: activeVariant.id,
                quantity,
                product
            });
            window.dispatchEvent(new Event("open-cart-drawer"));
        } catch (error) {
            console.error("Failed to add to cart", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans">
            <Script src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" type="module" strategy="lazyOnload" />
            <Navbar />
            <main className="max-w-[1400px] mx-auto pt-32 pb-20 px-6">
                <nav className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-stone-400 mb-8">
                    <a href="/" className="hover:text-stone-900">Maison</a>
                    <ChevronRight size={8} />
                    <span className="text-stone-900">{title}</span>
                </nav>
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* LEFT: MEDIA GALLERY */}
                    <div className="flex flex-col-reverse h-[50%] md:flex-row gap-4 lg:w-3/5">
                        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 shrink-0">
                            {media.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImg(idx)}
                                    className={`relative aspect-square w-16 md:w-full border transition-all duration-300 ${activeImg === idx ? 'border-stone-900' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img
                                        src={item.type === 'model' ? (item.previewUrl || "https://placehold.co/100x100?text=3D") : item.url}
                                        className="w-full h-full object-cover"
                                        alt={item.altText || "thumb"}
                                    />
                                    {item.type === 'model' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <div className="bg-white/80 p-1 rounded-full text-stone-900 shadow-sm">
                                                <span className="text-[8px] font-bold px-1">3D</span>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="relative inline-block bg-[#F9F8F6] h-[50%] overflow-hidden group w-full">
                            {media[activeImg]?.type === 'model' ? (
                                /* 3D Model Viewer */
                                <model-viewer
                                    src={media[activeImg].url}
                                    poster={media[activeImg].previewUrl}
                                    alt={media[activeImg].altText || "3D Model"}
                                    camera-controls
                                    touch-action="pan-y"

                                    /* Lighting & Color Accuracy */
                                    environment-image="legacy"
                                    tone-mapping="none"
                                    exposure="1"
                                    shadow-intensity="0.3"

                                    /* Optional */
                                    auto-rotate
                                    style={{
                                        width: "100%",
                                        height: "500px",
                                        minHeight: "500px",
                                        backgroundColor: "#ffffffff"
                                    }}
                                ></model-viewer>

                            ) : (
                                /* Standard Image */
                                <img
                                    src={media[activeImg].url}
                                    alt={title}
                                    className="block w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            )}

                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                                <button onClick={() => setActiveImg(prev => prev === 0 ? media.length - 1 : prev - 1)} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white">
                                    <ArrowLeft size={16} />
                                </button>
                                <button onClick={() => setActiveImg(prev => (prev + 1) % media.length)} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: INFO SECTION */}
                    <div className="lg:w-2/5 flex flex-col">
                        <div
                            ref={scrollRef}
                            className="space-y-6 md:h-[calc(100vh-120px)] w-full"
                            style={{
                                overflowY: "auto",
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                            }}
                        >
                            <div className="max-w-md space-y-8">
                                <header className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="h-[1px] w-6 bg-[#C5A059]"></span>
                                        <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-medium">Fine Artistry</p>
                                    </div>
                                    <h1 className="text-3xl font-serif italic text-stone-800 tracking-tight">{title}</h1>
                                    <p className="text-xl font-light text-stone-500">{currency === "USD" ? "$" : currency} {currentPrice}</p>
                                </header>
                                {/* Variants */}
                                {optionsList.length > 0 && (
                                    <div className="space-y-6">
                                        {optionsList.map((option) => (
                                            <div key={option.name}>
                                                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-stone-800 mb-3">
                                                    {option.name}
                                                </label>
                                                <div className="flex flex-wrap gap-3">
                                                    {option.values.map((val) => (
                                                        <button
                                                            key={val}
                                                            onClick={() => handleSelection(option.name, val)}
                                                            className={`px-5 py-2 text-[10px] uppercase tracking-widest transition-all
                              ${selections[option.name] === val ? 'bg-[#C5A059] text-white shadow-md' : 'border border-stone-200 hover:border-[#C5A059]'}`}
                                                        >
                                                            {val}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* Sibling Variants */}
                                <SiblingVariants />
                                {/* Purchase Section */}
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-4">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center border border-stone-200 px-1 py-1">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                disabled={quantity <= 1}
                                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 disabled:opacity-40 transition text-lg font-medium text-stone-600"
                                            >
                                                –
                                            </button>

                                            <span className="mx-3 text-sm font-semibold min-w-[20px] text-center">
                                                {quantity}
                                            </span>

                                            <button
                                                onClick={() => setQuantity(q => q + 1)}
                                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition text-lg font-medium text-stone-600"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 bg-stone-900 text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#C5A059] transition-all duration-500 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                            disabled={!activeVariant?.availableForSale || loading}
                                        >
                                            {activeVariant?.availableForSale
                                                ? (loading ? "Adding..." : "Add to Cart")
                                                : "Out of Stock"}
                                        </button>
                                    </div>
                                </div>
                                {/* COLLAPSIBLE DETAILS SECTION */}
                                <div className="pt-8 border-t border-stone-200">
                                    {/* <CollapsibleRow title="The Description" defaultOpen={true}>
                                        <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                                    </CollapsibleRow> */}
                                    <CollapsibleRow title="Details & Materials" defaultOpen={true}>
                                        <ul className="space-y-3">
                                            <li className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                                <span className="text-stone-400">Material</span>
                                                <span className="text-stone-900 font-medium">{product?.metafields?.find(m => m.namespace === "custom" && m.key === "material")?.value || "18K Gold"}</span>
                                            </li>

                                            <li className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                                <span className="text-stone-400">Finish</span>
                                                <span className="text-stone-900 font-medium">{product?.metafields?.find(m => m.namespace === "custom" && m.key === "finish")?.value || "High Polish"}</span>
                                            </li>

                                            <li className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                                <span className="text-stone-400">Weight</span>
                                                <span className="text-stone-900 font-medium">{product?.metafields?.find(m => m.namespace === "custom" && m.key === "weight")?.value || "3.2 g"}</span>
                                            </li>

                                            <li className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                                                <span className="text-stone-400">Origin</span>
                                                <span className="text-stone-900 font-medium">{product?.metafields?.find(m => m.namespace === "custom" && m.key === "origin")?.value || "Handcrafted"}</span>
                                            </li>
                                        </ul>
                                    </CollapsibleRow>

                                    <CollapsibleRow title="Shipping & Returns">
                                        Complimentary express shipping on all orders. Each piece is delivered in our signature Maison packaging. Returns are accepted within 14 days of delivery.
                                    </CollapsibleRow>
                                </div>
                                {/* Premium Perks */}
                                <div className="pt-8 space-y-6">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 flex items-center justify-center bg-white border border-stone-100 rounded-full group-hover:border-[#C5A059] transition-colors">
                                            <Truck size={16} className="text-stone-400 group-hover:text-[#C5A059]" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-stone-500">Global Concierge Delivery</span>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 flex items-center justify-center bg-white border border-stone-100 rounded-full group-hover:border-[#C5A059] transition-colors">
                                            <ShieldCheck size={16} className="text-stone-400 group-hover:text-[#C5A059]" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-stone-500">2-Year Maison Warranty</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* NEW TABS AND RELATED SECTION */}
            <section className="bg-white py-24 border-t border-stone-100">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-20">

                        {/* Description Column */}
                        <div className="lg:w-2/3">
                            <div className="flex gap-12 border-b border-stone-200 mb-8">
                                <h3 className="pb-4 text-[24px] font-serif text-400 uppercase tracking-[0.2em] font-medium text-stone-800 relative">
                                    Description
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-stone-900" />
                                </h3>
                            </div>

                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div
                                    className="text-sm leading-relaxed text-stone-600 font-light max-w-2xl"
                                    dangerouslySetInnerHTML={{ __html: product.description || "Detailed description not available." }}
                                />
                            </div>

                            {/* REVIEWS SECTION REMOVED FROM HERE */}
                        </div>

                        {/* Related Products Column */}
                        <div className="lg:w-1/3">
                            <h2 className="text-2xl font-serif italic mb-10 text-stone-800">Related Products</h2>
                            <div className="grid grid-cols-2 gap-6">
                                {relatedProducts.map((p) => (
                                    <Link key={p.id} href={`/products/${p.handle}`} className="group block border border-stone-200 p-5 rounded-md">
                                        <div className="bg-stone-50 overflow-hidden mb-4 rounded-sm relative">
                                            <img
                                                src={p.featuredImage?.url || 'https://placehold.co/400x500'}
                                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                                                alt={p.title}
                                            />
                                            <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 py-2 text-center text-[8px] uppercase tracking-widest font-bold">
                                                View Details
                                            </div>
                                        </div>
                                        <h3 className="text-[10px] uppercase tracking-widest font-medium text-stone-800 mb-1 group-hover:text-[#C5A059] transition-colors truncate">
                                            {p.title}
                                        </h3>
                                        <p className="text-[11px] font-light text-stone-500">
                                            ₹{p.price ? parseFloat(p.price.amount || p.price).toFixed(2) : parseFloat(p.priceRange?.minVariantPrice?.amount || 0).toFixed(2)}
                                        </p>
                                    </Link>
                                ))}
                                {relatedProducts.length === 0 && (
                                    <div className="col-span-2 py-10 border border-dashed border-stone-200 text-center rounded-sm">
                                        <p className="text-[10px] uppercase tracking-widest text-stone-400">Discovering more treasures...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* FULL WIDTH REVIEWS SECTION */}
            < section className="bg-[#FDFCFB] border-t border-stone-200" >
                <div className="max-w-[1400px] mx-auto px-6">
                    <ReviewsSection product={product} />
                </div>
            </section >

            <YouMayAlsoLike />
            <JewelryShowcase />
            <TrustIcon />
            <FAQItem />
            <Footer />
        </div >
    );
}




// import Link from 'next/link';
// import addToCartClient from '@/lib/cartClient';

// // Reusable Collapsible Component
// const CollapsibleRow = ({ title, children, defaultOpen = false }) => {
//     const [isOpen, setIsOpen] = useState(defaultOpen);
//     return (
//         <div className="border-b border-stone-200">
//             <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="w-full py-5 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-medium text-stone-800 hover:text-[#C5A059] transition-colors"
//             >
//                 {title}
//                 <ChevronDown
//                     size={14}
//                     className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
//                 />
//             </button>
//             <div
//                 className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
//                     }`}
//             >
//                 <div className="text-sm leading-relaxed text-stone-600 font-light">
//                     {children}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default function ProductPage({ product }) {
//     // Helpers to safely get media (images or 3D models)
//     // Ensure we handle both the new 'media' array and legacy 'images' array for fallback
//     const media = product?.media && product.media.length > 0
//         ? product.media
//         : product?.images?.length
//             ? product.images.map(img => ({ type: 'image', url: img.url || img, altText: 'Product Image' }))
//             : [{ type: 'image', url: product?.featuredImage?.url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070", altText: 'Placeholder' }];

//     const [activeImg, setActiveImg] = useState(0);

//     // Extract options from variants
//     // product.variants is a flat array of variant objects
//     const productOptions = {};
//     if (product?.variants?.length) {
//         product.variants.forEach((variant) => {
//             variant.selectedOptions.forEach((opt) => {
//                 if (!productOptions[opt.name]) {
//                     productOptions[opt.name] = new Set();
//                 }
//                 productOptions[opt.name].add(opt.value);
//             });
//         });
//     }

//     // Convert Sets to Arrays and filter out "Title" -> "Default Title"
//     const optionsList = Object.keys(productOptions)
//         .filter(
//             (name) => !(name === "Title" && productOptions[name].has("Default Title"))
//         )
//         .map((name) => ({
//             name,
//             values: Array.from(productOptions[name]),
//         }));

//     // State for selected options
//     const [selections, setSelections] = useState(() => {
//         const initial = {};
//         optionsList.forEach((opt) => {
//             initial[opt.name] = opt.values[0]; // Default to first value
//         });
//         return initial;
//     });

//     const [quantity, setQuantity] = useState(1);
//     const [loading, setLoading] = useState(false);

//     // Find active variant based on selections
//     const activeVariant =
//         product?.variants?.find((variant) => {
//             return variant.selectedOptions.every(
//                 (opt) => selections[opt.name] === opt.value
//             );
//         }) || product?.variants?.[0]; // Fallback

//     // Update image when active variant changes
//     useEffect(() => {
//         if (activeVariant?.image?.url) {
//             const variantImgUrl = activeVariant.image.url;
//             // Find index in media array
//             const index = media.findIndex(m => m.url === variantImgUrl);
//             if (index !== -1) {
//                 setActiveImg(index);
//             }
//         }
//     }, [activeVariant, media]);

//     const scrollRef = React.useRef(null);

//     useEffect(() => {
//         const el = scrollRef.current;
//         if (!el) return;

//         function handleWheel(e) {
//             // same intent: disable after page scroll
//             if (window.scrollY > 100) return;

//             const delta = e.deltaY;

//             const atTop = el.scrollTop <= 0;
//             const atBottom =
//                 Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight - 1;

//             // SAME behaviour: inner scroll first
//             if ((delta > 0 && !atBottom) || (delta < 0 && !atTop)) {
//                 e.preventDefault();
//                 el.scrollTop += delta;
//             }
//         }

//         window.addEventListener("wheel", handleWheel, { passive: false });

//         return () => {
//             window.removeEventListener("wheel", handleWheel);
//         };
//     }, []);

//     const handleSelection = (optionName, value) => {
//         setSelections((prev) => ({ ...prev, [optionName]: value }));
//     };

//     const rawPrice = activeVariant?.price?.amount || activeVariant?.price || product?.priceRange?.minVariantPrice?.amount;
//     const currentPrice = rawPrice ? Number(rawPrice).toFixed(2) : "4,200";
//     const currency = activeVariant?.price?.currencyCode || product?.priceRange?.minVariantPrice?.currencyCode || "USD";

//     const descriptionHtml = product?.description || "A timeless piece of fine jewelry crafted with precision and passion. This signature piece embodies the harmony of classic silhouettes and modern refinement.";

//     const title = product?.title || "The Eternal Ellipse Ring";

//     // Details extraction
//     const details = product?.metafields?.filter(m => m.namespace === 'custom' && m.key.startsWith('detail_'))?.map(m => m.value) || [
//         "18k Solid Gold",
//         "0.5ct VS1 Diamond",
//         "Handmade in Italy",
//         "Conflict-Free",
//     ];

//     // Sibling Variants Handling
//     const SiblingVariants = () => {
//         // product.siblings is a flat array
//         if (!product?.metafields || !product.siblings?.length) return null;

//         // Helper to get metafield value
//         const getMeta = (p, key) =>
//             p.metafields?.find(
//                 (m) => m.key === key && m.namespace === "custom"
//             )?.value;

//         // 1. Get common_id to ensure strict checking
//         const commonId = getMeta(product, "common_id");

//         // 2. Get all nodes (self + siblings) and ensure they share common_id
//         const allNodes = [product, ...product.siblings].filter(
//             (p) => {
//                 const pCommonId = getMeta(p, "common_id");
//                 return pCommonId && pCommonId === commonId;
//             }
//         );

//         // 3. Extract Options
//         const currentOp1 = getMeta(product, "variant_id") || "Current"; // e.g., Metal
//         const currentOp2 = getMeta(product, "variant_value") || "Standard"; // e.g., Carat

//         // 4. Get Unique Values for each dimension
//         const uniqueOp1 = [
//             ...new Set(
//                 allNodes.map((p) => getMeta(p, "variant_id") || "Current")
//             ),
//         ].filter(Boolean).sort();
//         const uniqueOp2 = [
//             ...new Set(
//                 allNodes.map(
//                     (p) => getMeta(p, "variant_value") || "Standard"
//                 )
//             ),
//         ].filter(Boolean).sort();

//         const handleSiblingClick = (targetOp1, targetOp2) => {
//             // Find product matching BOTH + Common ID check (implicit via allNodes filter)
//             let match = allNodes.find(
//                 (p) =>
//                     (getMeta(p, "variant_id") || "Current") === targetOp1 &&
//                     (getMeta(p, "variant_value") || "Standard") === targetOp2
//             );
//             // Fallback
//             if (!match) {
//                 match = allNodes.find(
//                     (p) =>
//                         (getMeta(p, "variant_id") || "Current") === targetOp1
//                 );
//             }
//             if (match && match.handle !== product.handle) {
//                 window.location.href = `/products/${match.handle}`;
//             }
//         };

//         return (
//             <div className="space-y-6 mb-8 pt-8 border-t border-stone-200">
//                 {/* Dimension 1 (e.g. Metal) */}
//                 {uniqueOp1.length > 0 && (
//                     <div>
//                         <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-stone-800 mb-3">
//                             Metal
//                         </label>
//                         <div className="flex flex-wrap gap-3">
//                             {uniqueOp1.map((val) => (
//                                 <button
//                                     key={val}
//                                     onClick={() => handleSiblingClick(val, currentOp2)}
//                                     className={`px-5 py-2 text-[10px] uppercase tracking-widest rounded-full transition-all
//                     ${val === currentOp1 ? 'bg-[#C5A059] text-white shadow-md cursor-default' : 'border border-stone-200 hover:border-[#C5A059] text-stone-600 hover:text-[#C5A059]'}`}
//                                 >
//                                     {val}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//                 {/* Dimension 2 (e.g. Carat) */}
//                 {uniqueOp2.length > 1 && (
//                     <div>
//                         <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-stone-800 mb-3">
//                             Carat
//                         </label>
//                         <div className="flex flex-wrap gap-3">
//                             {uniqueOp2.map((val) => {
//                                 // Check if this combination exists for the current Op1 selection
//                                 const exists = allNodes.some(
//                                     (p) =>
//                                         (getMeta(p, "variant_id") || "Current") === currentOp1 &&
//                                         (getMeta(p, "variant_value") || "Standard") === val
//                                 );
//                                 return (
//                                     <button
//                                         key={val}
//                                         onClick={() => handleSiblingClick(currentOp1, val)}
//                                         disabled={!exists}
//                                         className={`px-5 py-2 text-[10px] uppercase tracking-widest rounded-full transition-all flex items-center gap-2
//                       ${val === currentOp2 ? 'bg-[#C5A059] text-white shadow-md cursor-default' : exists ? 'border border-stone-200 hover:border-[#C5A059] text-stone-600 hover:text-[#C5A059]' : 'border border-stone-100 text-stone-300 cursor-not-allowed'}`}
//                                     >
//                                         {val} {exists ? "" : "✕"}
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     const handleAddToCart = async () => {
//         if (!activeVariant) return;

//         setLoading(true);
//         try {
//             await addToCartClient({
//                 variantId: activeVariant.id,
//                 quantity,
//                 product
//             });
//             window.dispatchEvent(new Event("open-cart-drawer"));
//         } catch (error) {
//             console.error("Failed to add to cart", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans">
//             <Script src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js" type="module" strategy="lazyOnload" />
//             <Navbar />
//             <main className="max-w-[1400px] mx-auto pt-32 pb-20 px-6">
//                 <nav className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-stone-400 mb-8">
//                     <a href="/" className="hover:text-stone-900">Maison</a>
//                     <ChevronRight size={8} />
//                     <span className="text-stone-900">{title}</span>
//                 </nav>
//                 <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
//                     {/* LEFT: MEDIA GALLERY */}
//                     <div className="flex flex-col-reverse h-[50%] md:flex-row gap-4 lg:w-3/5">
//                         <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 shrink-0">
//                             {media.map((item, idx) => (
//                                 <button
//                                     key={idx}
//                                     onClick={() => setActiveImg(idx)}
//                                     className={`relative aspect-square w-16 md:w-full border transition-all duration-300 ${activeImg === idx ? 'border-stone-900' : 'border-transparent opacity-60 hover:opacity-100'}`}
//                                 >
//                                     <img
//                                         src={item.type === 'model' ? (item.previewUrl || "https://placehold.co/100x100?text=3D") : item.url}
//                                         className="w-full h-full object-cover"
//                                         alt={item.altText || "thumb"}
//                                     />
//                                     {item.type === 'model' && (
//                                         <div className="absolute inset-0 flex items-center justify-center bg-black/10">
//                                             <div className="bg-white/80 p-1 rounded-full text-stone-900 shadow-sm">
//                                                 <span className="text-[8px] font-bold px-1">3D</span>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </button>
//                             ))}
//                         </div>

//                         <div className="relative inline-block bg-[#F9F8F6] h-[50%] overflow-hidden group w-full">
//                             {media[activeImg]?.type === 'model' ? (
//                                 /* 3D Model Viewer */
//                                 <model-viewer
//                                     src={media[activeImg].url}
//                                     poster={media[activeImg].previewUrl}
//                                     alt={media[activeImg].altText || "3D Model"}
//                                     shadow-intensity="1"
//                                     camera-controls
//                                     touch-action="pan-y"
//                                     style={{ width: '100%', height: '500px', minHeight: '500px', backgroundColor: '#F9F8F6' }}
//                                 ></model-viewer>
//                             ) : (
//                                 /* Standard Image */
//                                 <img
//                                     src={media[activeImg].url}
//                                     alt={title}
//                                     className="block w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
//                                 />
//                             )}

//                             <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
//                                 <button onClick={() => setActiveImg(prev => prev === 0 ? media.length - 1 : prev - 1)} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white">
//                                     <ArrowLeft size={16} />
//                                 </button>
//                                 <button onClick={() => setActiveImg(prev => (prev + 1) % media.length)} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white">
//                                     <ArrowRight size={16} />
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* RIGHT: INFO SECTION */}
//                     <div className="lg:w-2/5 flex flex-col">
//                         <div
//                             ref={scrollRef}
//                             className="space-y-6 md:h-[calc(100vh-120px)] w-full"
//                             style={{
//                                 overflowY: "auto",
//                                 scrollbarWidth: "none",
//                                 msOverflowStyle: "none",
//                             }}
//                         >
//                             <div className="max-w-md space-y-8">
//                                 <header className="space-y-2">
//                                     <div className="flex items-center gap-3">
//                                         <span className="h-[1px] w-6 bg-[#C5A059]"></span>
//                                         <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-medium">Fine Artistry</p>
//                                     </div>
//                                     <h1 className="text-3xl font-serif italic text-stone-800 tracking-tight">{title}</h1>
//                                     <p className="text-xl font-light text-stone-500">{currency === "USD" ? "$" : currency} {currentPrice}</p>
//                                 </header>
//                                 {/* Variants */}
//                                 {optionsList.length > 0 && (
//                                     <div className="space-y-6">
//                                         {optionsList.map((option) => (
//                                             <div key={option.name}>
//                                                 <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-stone-800 mb-3">
//                                                     {option.name}
//                                                 </label>
//                                                 <div className="flex flex-wrap gap-3">
//                                                     {option.values.map((val) => (
//                                                         <button
//                                                             key={val}
//                                                             onClick={() => handleSelection(option.name, val)}
//                                                             className={`px-5 py-2 text-[10px] uppercase tracking-widest rounded-full transition-all
//                               ${selections[option.name] === val ? 'bg-[#C5A059] text-white shadow-md' : 'border border-stone-200 hover:border-[#C5A059]'}`}
//                                                         >
//                                                             {val}
//                                                         </button>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                                 {/* Sibling Variants */}
//                                 <SiblingVariants />
//                                 {/* Purchase Section */}
//                                 <div className="space-y-4 pt-4">
//                                     <div className="flex items-center gap-4">
//                                         {/* Quantity Selector */}
//                                         <div className="flex items-center border border-stone-200 rounded-full px-1 py-1">
//                                             <button
//                                                 onClick={() => setQuantity(q => Math.max(1, q - 1))}
//                                                 disabled={quantity <= 1}
//                                                 className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 disabled:opacity-40 transition text-lg font-medium text-stone-600"
//                                             >
//                                                 –
//                                             </button>

//                                             <span className="mx-3 text-sm font-semibold min-w-[20px] text-center">
//                                                 {quantity}
//                                             </span>

//                                             <button
//                                                 onClick={() => setQuantity(q => q + 1)}
//                                                 className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition text-lg font-medium text-stone-600"
//                                             >
//                                                 +
//                                             </button>
//                                         </div>

//                                         <button
//                                             onClick={handleAddToCart}
//                                             className="flex-1 bg-stone-900 text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#C5A059] transition-all duration-500 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
//                                             disabled={!activeVariant?.availableForSale || loading}
//                                         >
//                                             {activeVariant?.availableForSale
//                                                 ? (loading ? "Adding..." : "Add to Cart")
//                                                 : "Out of Stock"}
//                                         </button>
//                                     </div>
//                                     <div className="flex gap-4">
//                                         <button className="flex-1 border border-stone-200 py-3 text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors">
//                                             <Heart size={14} strokeWidth={1.5} /> Wishlist
//                                         </button>
//                                         <button className="flex-1 border border-stone-200 py-3 text-[9px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors">
//                                             <Share2 size={14} strokeWidth={1.5} /> Share
//                                         </button>
//                                     </div>
//                                 </div>
//                                 {/* COLLAPSIBLE DETAILS SECTION */}
//                                 <div className="pt-8 border-t border-stone-200">
//                                     <CollapsibleRow title="The Description" defaultOpen={true}>
//                                         <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
//                                     </CollapsibleRow>
//                                     <CollapsibleRow title="Details & Materials">
//                                         <ul className="space-y-3">
//                                             {details.map((detail, i) => (
//                                                 <li key={i} className="flex justify-between items-center text-[10px] uppercase tracking-widest">
//                                                     <span className="text-stone-400">{detail.split(' ').slice(1).join(' ') || 'Finish'}</span>
//                                                     <span className="text-stone-900 font-medium">{detail.split(' ')[0]}</span>
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     </CollapsibleRow>
//                                     <CollapsibleRow title="Shipping & Returns">
//                                         Complimentary express shipping on all orders. Each piece is delivered in our signature Maison packaging. Returns are accepted within 14 days of delivery.
//                                     </CollapsibleRow>
//                                 </div>
//                                 {/* COLLAPSIBLE DETAILS SECTION */}
{/* Premium Perks */ }
//                                 <div className="pt-8 space-y-6">
//                                     <div className="flex items-center gap-4 group">
//                                         <div className="w-10 h-10 flex items-center justify-center bg-white border border-stone-100 rounded-full group-hover:border-[#C5A059] transition-colors">
//                                             <Truck size={16} className="text-stone-400 group-hover:text-[#C5A059]" />
//                                         </div>
//                                         <span className="text-[10px] uppercase tracking-widest text-stone-500">Global Concierge Delivery</span>
//                                     </div>
//                                     <div className="flex items-center gap-4 group">
//                                         <div className="w-10 h-10 flex items-center justify-center bg-white border border-stone-100 rounded-full group-hover:border-[#C5A059] transition-colors">
//                                             <ShieldCheck size={16} className="text-stone-400 group-hover:text-[#C5A059]" />
//                                         </div>
//                                         <span className="text-[10px] uppercase tracking-widest text-stone-500">2-Year Maison Warranty</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
