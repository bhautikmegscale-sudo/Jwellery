"use client";
import React from 'react';

const JewelryShowcase = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* Left Side: Overlapping Image Composition */}
        <div className="relative order-2 lg:order-1">
          {/* Main Large Image */}
          <div className="relative z-10 w-4/5 lg:w-[85%] aspect-[4/5] overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"
              alt="Jewelry Model"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Overlapping Small Image */}
          <div className="absolute bottom-[-10%] right-0 z-20 w-1/2 aspect-square border-[12px] border-white shadow-xl overflow-hidden hidden sm:block">
            <img
              src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600"
              alt="Jewelry Detail"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="order-1 lg:order-2 flex flex-col items-start space-y-6 lg:pl-10">
          <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-red-800 uppercase italic">
            Classic Meets Contemporary
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 leading-tight">
            Timeless Styles With <br className="hidden md:block" /> A Modern Edge
          </h2>

          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-lg">
            Experience the best of both worlds with our collection that seamlessly blends
            timeless classics with modern twists. Elevate your wardrobe with pieces that
            stand the test of time while embracing the latest fashion innovations.
            Shop now for exclusive discounts.
          </p>

          <button className="mt-4 px-10 py-4 bg-black text-white text-xs md:text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition-all duration-300"
            onClick={() => (window.location.href = "/products")}>
            Discover Now
          </button>
        </div>

      </div>
    </section>
  );
};

export default JewelryShowcase;