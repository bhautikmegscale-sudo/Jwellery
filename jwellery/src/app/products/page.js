"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  Grid,
  List,
  X,
  Heart,
  SlidersHorizontal,
  Check,
  ArrowRight,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";

export default function CategoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Featured");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedMetals, setSelectedMetals] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100000);

  // --- Fetch Data ---
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/product?first=250");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // --- Logic: Filtering & Sorting ---
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (activeCategory !== "All") {
      result = result.filter((p) => p.productType === activeCategory);
    }
    if (selectedMetals.length > 0) {
      result = result.filter((p) =>
        p.tags.some((tag) => selectedMetals.includes(tag))
      );
    }
    result = result.filter((p) => {
      let pPrice = 0;
      if (p.priceRange?.minVariantPrice?.amount) {
        pPrice = parseFloat(p.priceRange.minVariantPrice.amount);
      } else if (typeof p.price === "string") {
        pPrice = parseFloat(p.price);
      } else if (p.price?.amount) {
        pPrice = parseFloat(p.price.amount);
      }
      return pPrice <= maxPrice;
    });

    const getPrice = (p) => {
      if (p.priceRange?.minVariantPrice?.amount)
        return parseFloat(p.priceRange.minVariantPrice.amount);
      if (typeof p.price === "string") return parseFloat(p.price);
      if (p.price?.amount) return parseFloat(p.price.amount);
      return 0;
    };

    if (sortBy === "Price: Low to High")
      result.sort((a, b) => getPrice(a) - getPrice(b));
    if (sortBy === "Price: High to Low")
      result.sort((a, b) => getPrice(b) - getPrice(a));

    return result;
  }, [products, activeCategory, selectedMetals, maxPrice, sortBy]);

  const toggleMetal = (metal) => {
    setSelectedMetals((prev) =>
      prev.includes(metal) ? prev.filter((m) => m !== metal) : [...prev, metal]
    );
  };

  const availableCategories = [
    "All",
    ...new Set(products.map((p) => p.productType).filter(Boolean)),
  ];
  const availableMetals = [
    "Gold",
    "Silver",
    "Platinum",
    "Rose Gold",
    "White Gold",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* 1. OVERLAY NAVBAR */}
      <div className="absolute top-0 left-0 w-full z-[100]">
        {/* Ensure Navbar2 component handles transparency or has no background */}
        <Navbar transparent={true} />
      </div>

      {/* 2. REDUCED HERO BANNER SECTION */}
      <section className="relative h-[40vh] min-h-[500px] w-full overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?q=80&w=2070&auto=format&fit=crop"
            alt="Hero Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Banner Content - Adjusted padding for shorter height */}
        <div className="relative z-10 text-center text-white px-6 mt-16">
          <p className="text-[9px] uppercase tracking-[0.5em] mb-2 opacity-80">
            Established 1924
          </p>
          <h1 className="text-4xl md:text-6xl font-serif italic mb-4">
            The Maison Collection
          </h1>
          <div className="h-[1px] w-16 bg-[#C5A059] mx-auto mb-4"></div>
          <p className="max-w-xl mx-auto text-[11px] uppercase tracking-widest font-light opacity-90">
            Curated Elegance
          </p>
        </div>
      </section>

      {/* 3. MAIN CONTENT AREA */}
      <div className="py-20 px-6 md:px-12">
        {/* TOOLBAR */}
        <div className="max-w-[1600px] mx-auto border-y border-stone-200 py-6 mb-12 flex justify-between items-center">
          <div className="flex items-center gap-10">
            <p className="hidden md:block text-[10px] text-stone-400 dark:text-muted-foreground uppercase tracking-widest">
              {filteredProducts.length} Results
            </p>

            <div className="relative group">
              <button className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold border-b border-transparent hover:border-stone-900 dark:hover:border-stone-100 pb-1 transition-all">
                Sort: {sortBy} <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2">
                {["Featured", "Price: Low to High", "Price: High to Low"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-800 ${sortBy === option ? "text-[#C5A059] font-bold" : ""}`}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT LISTING */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="font-serif italic text-stone-400 text-xl animate-pulse">
              Consulting the archives...
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <main className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </main>
        ) : (
          <div className="py-40 text-center border border-dashed border-stone-200 dark:border-stone-800 max-w-[1600px] mx-auto">
            <p className="font-serif italic text-stone-400 dark:text-muted-foreground text-xl">
              No treasures match your criteria.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSelectedMetals([]);
                setMaxPrice(100000);
              }}
              className="mt-6 text-[10px] uppercase tracking-widest border-b border-stone-900 dark:border-stone-100 pb-1"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. FILTER DRAWER */}
      <div
        className={`fixed inset-0 z-[200] transition-opacity duration-300 ${isFilterOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsFilterOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-stone-950 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isFilterOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-background">
            <h2 className="text-[14px] uppercase tracking-widest font-bold">
              Refine Selection
            </h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X size={20} className="text-stone-500" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {/* 1. Collections (Categories) */}
            <div>
              <h3 className="text-[11px] uppercase tracking-widest font-bold text-foreground mb-4 flex items-center gap-2">
                <Grid size={14} /> Organization
              </h3>
              <div className="space-y-3">
                {availableCategories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={activeCategory === cat}
                        onChange={() => setActiveCategory(cat)}
                        className="peer appearance-none w-5 h-5 border border-stone-300 dark:border-stone-700 rounded-full checked:border-[#C5A059] checked:bg-[#C5A059] transition-all"
                      />
                      <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span
                      className={`text-sm tracking-wide transition-colors ${activeCategory === cat
                        ? "text-foreground font-medium"
                        : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-300"
                        }`}
                    >
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-stone-100" />

            {/* 2. Metal Type */}
            <div>
              <h3 className="text-[11px] uppercase tracking-widest font-bold text-foreground mb-4 flex items-center gap-2">
                <List size={14} /> Material Logic
              </h3>
              <div className="space-y-3">
                {availableMetals.map((metal) => {
                  const isSelected = selectedMetals.includes(metal);
                  return (
                    <label
                      key={metal}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div
                        className={`w-5 h-5 border transition-all flex items-center justify-center ${isSelected
                          ? "bg-[#C5A059] border-[#C5A059]"
                          : "border-stone-300 dark:border-stone-700 group-hover:border-[#C5A059]"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleMetal(metal)}
                          className="hidden"
                        />
                        <Check
                          size={12}
                          className={`text-white transform transition-transform ${isSelected ? "scale-100" : "scale-0"
                            }`}
                        />
                      </div>
                      <span
                        className={`text-sm tracking-wide transition-colors ${isSelected
                          ? "text-foreground font-medium"
                          : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-300"
                          }`}
                      >
                        {metal}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-stone-100" />

            {/* 3. Price Range */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] uppercase tracking-widest font-bold text-foreground flex items-center gap-2">
                  <SlidersHorizontal size={14} /> Investment
                </h3>
                <span className="text-xs font-mono text-[#C5A059]">
                  Up to ₹{maxPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
              />
              <div className="flex justify-between mt-2 text-[10px] text-stone-400 font-mono">
                <span>₹0</span>
                <span>₹5,00,000+</span>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-background space-y-3">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="w-full py-4 bg-stone-900 text-white text-[11px] uppercase tracking-widest font-bold hover:bg-[#C5A059] transition-colors flex items-center justify-center gap-2"
            >
              Show {filteredProducts.length} Treasures <ArrowRight size={14} />
            </button>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSelectedMetals([]);
                setMaxPrice(100000);
              }}
              className="w-full py-3 text-[10px] uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
