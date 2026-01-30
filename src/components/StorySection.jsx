"use client";
import React from 'react';

export default function StorySection() {
    return (
        <section className="py-32 px-8 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-12 gap-16 items-center">
                <div className="md:col-span-5 space-y-8">
                    <h4 className="text-[#C5A059] uppercase tracking-[0.3em] text-[10px] font-bold">The Craft</h4>
                    <h2 className="text-5xl font-serif leading-tight">Mastery in <br /> Every Karat.</h2>
                    <p className="text-stone-500 leading-relaxed font-light text-lg">
                        Our diamonds are ethically sourced and hand-cut by third-generation artisans in our Antwerp atelier.
                    </p>
                </div>
                <div className="md:col-span-7 grid grid-cols-2 gap-6">
                    <div className="pt-12">
                        <img src="https://cdn.shopify.com/s/files/1/0947/2563/6380/files/photo-1531995811006-35cb42e1a022.webp?v=1769059442" className="w-full aspect-[3/4] object-cover rounded-sm shadow-2xl" alt="Craft Image 1" />
                    </div>
                    <div>
                        <img src="https://cdn.shopify.com/s/files/1/0947/2563/6380/files/photo-1617038260897-41a1f14a8ca0.webp?v=1769059439" className="w-full aspect-[3/4] object-cover rounded-sm shadow-2xl" alt="Craft Image 2" />
                    </div>
                </div>
            </div>
        </section>
    );
}
