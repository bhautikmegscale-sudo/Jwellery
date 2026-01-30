"use client";
import React from 'react';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-stone-900">
            <div className="absolute inset-0 opacity-60">
                <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80" className="w-full h-full object-cover scale-110 animate-slow-zoom" alt="Hero Background" />
            </div>
            <div className="relative z-10 text-center space-y-8 px-6">
                <div className="overflow-hidden">
                    <span className="block uppercase tracking-[0.6em] text-[10px] text-white/80 animate-slide-up">Est. 1924 • Geneva</span>
                </div>
                <h2 className="text-6xl md:text-9xl font-serif text-white font-light tracking-tight leading-[0.9]">
                    Modern <br /> <span className="italic">Radiance</span>
                </h2>
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center pt-8">
                    <Link href="/products" className="bg-white text-stone-900 px-12 py-5 text-[10px] uppercase tracking-[0.3em] hover:bg-[#C5A059] hover:text-white transition-all duration-500 w-full md:w-auto inline-block">
                        Shop The Film
                    </Link>
                    <Link href="/products" className="backdrop-blur-md bg-white/10 text-white border border-white/20 px-12 py-5 text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-stone-900 transition-all duration-500 w-full md:w-auto inline-block">
                        View Lookbook
                    </Link>
                </div>
            </div>
        </section>
    );
}
