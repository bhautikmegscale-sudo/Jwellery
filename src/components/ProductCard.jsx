"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Star } from "lucide-react";
import addToCartClient from "@/lib/cartClient";

const ProductCard = ({ product, name, price, category, img, href }) => {
    const productName = product?.title || name;
    const productPrice = product?.price || price;
    const productCategory = (product?.productType && product.productType !== "Boutique")
        ? product.productType
        : (product?.vendor || category || "Jewelry");
    const productImage = product?.featuredImage?.url || img;
    const productHref = product?.handle ? `/products/${product.handle}` : href || "/products";

    const [loading, setLoading] = useState(false);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);

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
        } catch (error) {
            console.error("Add to cart failed", error);
        } finally {
            setLoading(false);
        }
    };

    const formattedPrice = productPrice
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(parseFloat(productPrice))
        : null;

    const compareAtPrice = product?.compareAtPrice || product?.compare_at_price;
    const formattedCompareAtPrice = compareAtPrice
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(parseFloat(compareAtPrice))
        : null;




    /* --------- REVIEW LOGIC --------- */
    const reviewsMeta = product?.metafields?.find(m => m.namespace === "custom" && m.key === "reviews")?.value;
    let averageRating = 0;
    let reviewCount = 0;

    if (reviewsMeta) {
        try {
            const reviews = JSON.parse(reviewsMeta);
            if (Array.isArray(reviews) && reviews.length > 0) {
                reviewCount = reviews.length;
                averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount;
            }
        } catch (e) {
            // ignore
        }
    }

    /* --------- METAL OPTIONS (same logic as yours) --------- */
    const getMeta = (p, key) =>
        p?.metafields?.find(m => m.key === key && m.namespace === "custom")?.value;

    const commonId = getMeta(product, "common_id");

    const allProducts = commonId
        ? [product, ...(product?.siblings || [])].filter(p => getMeta(p, "common_id") === commonId)
        : [];

    const metalMap = new Map();
    allProducts.forEach(p => {
        const metal = getMeta(p, "variant_id");
        if (metal && !metalMap.has(metal)) {
            metalMap.set(metal, { metal, handle: p.handle });
        }
    });

    const metalOptions = Array.from(metalMap.values());

    const metalColorMap = {
        gold: "var(--gold)",
        "yellow gold": "var(--yellow-gold)",
        "white gold": "var(--white-gold)",
        silver: "var(--silver)",
        platinum: "var(--platinum)",
        "rose gold": "var(--rose-gold)",
        pink: "var(--pink)",
    };
    const getMetalColor = (name = "") => {
        const key = name.toLowerCase();
        return metalColorMap[key] || "#D1D5DB";
    };

    const getPriceValue = (val) => {
        if (!val) return 0;
        if (typeof val === 'object') return parseFloat(val.amount);
        if (typeof val === 'string') return parseFloat(val.replace(/,/g, ''));
        return parseFloat(val);
    };

    const priceVal = getPriceValue(productPrice);
    const compareVal = getPriceValue(compareAtPrice);

    const discountPercentage = (priceVal && compareVal && compareVal > priceVal)
        ? Math.round(((compareVal - priceVal) / compareVal) * 100)
        : 0;

    /* ----------------------------------------------------- */

    return (
        <div className="group relative w-full overflow-hidden rounded-2xl bg-white dark:bg-stone-900 shadow-md transition-all duration-300 hover:shadow-xl">

            {/* Image */}
            <Link href={productHref}>
                <div className="relative overflow-hidden bg-gray-100 dark:bg-stone-800">
                    <img
                        src={productImage}
                        alt={productName}
                        className="filter brightness-90 h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 bg-black-100"
                    />

                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-3 right-3 z-10 bg-[#C5A059] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm">
                            {discountPercentage}% OFF
                        </div>
                    )}

                    {/* Wishlist */}
                    {/* <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-stone-800/80 text-slate-900 dark:text-stone-100 opacity-0 transition-all hover:bg-white dark:hover:bg-stone-700 hover:text-red-500 group-hover:opacity-100"
                    >
                        <Heart size={18} />
                    </button> */}


                </div>
            </Link>

            {/* Content */}
            <div className="p-6">
                <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-muted-foreground mb-1">
                    {productCategory}
                </p>

                {/* Rating */}
                {reviewCount > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex text-[#C5A059]">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={12}
                                    fill={star <= Math.round(averageRating) ? "currentColor" : "none"}
                                    className={star <= Math.round(averageRating) ? "text-[#C5A059]" : "text-slate-300"}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-muted-foreground">({reviewCount})</span>
                    </div>
                )}

                <h3 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-foreground leading-snug">
                    {productName}
                </h3>
                <div className="flex items-center justify-between mt-2">
                    {/* Price Section */}
                    <div className="flex items-center gap-2">
                        <p className="text-xl font-light text-slate-900 dark:text-foreground">
                            {formattedPrice}
                        </p>

                        {formattedCompareAtPrice && (
                            <p className="text-sm text-slate-400 dark:text-muted-foreground line-through">
                                {formattedCompareAtPrice}
                            </p>
                        )}
                    </div>

                    {/* Metal Options */}
                    {metalOptions.length > 0 && (
                        <div className="flex items-center gap-2">
                            {metalOptions.slice(0, 5).map((opt, i) => (
                                <Link
                                    key={i}
                                    href={`/products/${opt.handle}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="relative h-6 w-6 rounded-full border border-black hover:scale-110 transition-transform"
                                    style={{ background: getMetalColor(opt.metal) }}
                                    title={opt.metal}
                                />
                            ))}

                            {metalOptions.length > 5 && (
                                <span className="text-xs text-slate-900 dark:text-foreground font-medium">
                                    +{metalOptions.length - 5}
                                </span>
                            )}
                        </div>
                    )}
                </div>



                {/* Add to Cart (Always Visible) */}
                <div className="mt-4">
                    <button
                        onClick={handleAddToCart}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-stone-800 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:hover:bg-stone-700 disabled:opacity-70 transition-all shadow-sm hover:shadow-md"
                    >
                        <ShoppingCart size={18} />
                        {loading ? "Adding..." : "Add to Cart"}
                    </button>
                </div>
            </div>
            <style>{`
                :root {
  --gold: linear-gradient(135deg, #FFD700 0%, #FFEF9A 30%, #FFC300 60%, #FFD700 100%);
  --yellow-gold: linear-gradient(135deg, #FFD700 0%, #FFE066 40%, #FFB703 100%);
  --white-gold: linear-gradient(135deg, #FFFFFF 0%, #E5E7EB 50%, #D1D5DB 100%);
  --silver: linear-gradient(135deg, #F9FAFB 0%, #D1D5DB 50%, #9CA3AF 100%);
  --platinum: linear-gradient(135deg, #F8FAFC 0%, #E5E7EB 40%, #CBD5E1 100%);
  --rose-gold: linear-gradient(135deg, #E0BFB8 0%, #F1D0C9 40%, #C89A92 100%);
  --pink: linear-gradient(135deg, #FADADD 0%, #E0BFB8 50%, #D8A7A1 100%);
}

            `}</style>
        </div>
    );
};

export default ProductCard;
