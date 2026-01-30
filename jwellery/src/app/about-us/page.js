"use client";
import React from 'react';
import { Quote, Sparkles, Hammer, ShieldCheck, Globe, ArrowDown } from 'lucide-react';
import Navbar2 from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function AboutUs() {
  return (<>
    <Navbar2 />
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 selection:bg-[#C5A059] selection:text-white">

      {/* 1. CINEMATIC HERO - UPDATED WITH HIGH-END JEWELRY ARTISTRY */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://cdn.shopify.com/s/files/1/0947/2563/6380/files/adadff162046333d3338592e367cef3a_1.jpg?v=1768899820"
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            alt="The Master Jeweler's Bench"
          />
          {/* Subtle gradient overlay to enhance text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/40 to-stone-900/60" />
        </div>

        <div className="relative z-10 text-center text-white px-6">
          <p className="text-[10px] uppercase tracking-[0.6em] mb-6 opacity-90 font-medium">The Spirit of AURUM</p>
          <h1 className="text-6xl md:text-9xl font-serif italic font-light leading-none mb-12 drop-shadow-sm">
            A Legacy <br /> in Every <span className="text-[#C5A059]">Carat</span>
          </h1>
          <div className="flex justify-center animate-bounce opacity-60">
            <ArrowDown size={30} strokeWidth={1} />
          </div>
        </div>
      </section>

      {/* 2. THE PHILOSOPHY (Minimalist Text) */}
      <section className="py-32 px-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <Quote className="mx-auto text-[#C5A059] opacity-30" size={48} strokeWidth={1} />
          <h2 className="text-3xl md:text-5xl font-serif italic leading-tight">
            "We do not merely set stones in gold; we capture moments of light and freeze them in time for generations to come."
          </h2>
          <div className="h-20 w-[1px] bg-stone-200 mx-auto"></div>
          <p className="text-stone-500 font-light tracking-wide text-lg max-w-2xl mx-auto leading-relaxed">
            Founded in 1924, AURUM began as a small atelier in Geneva, driven by a singular obsession: the pursuit of the "Perfect Brilliance." Today, that same passion beats in the heart of our Mumbai flagship.
          </p>
        </div>
      </section>

      {/* 3. STAGGERED STORY SECTIONS */}
      <section className="pb-32 px-6 md:px-20">
        {/* Section 1: The Origin */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center mb-40">
          <div className="relative order-2 md:order-1">
            <div className="absolute border border-stone-100 -z-10 translate-x-8 translate-y-8"></div>
            <img
              src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80"
              className="w-full shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
              alt="Vintage Atelier"
            />
          </div>
          <div className="space-y-8 order-1 md:order-2">
            <span className="text-[#C5A059] text-[10px] uppercase tracking-[0.4em] font-bold">1924 — The Genesis</span>
            <h3 className="text-4xl font-serif italic">From Geneva with Love</h3>
            <p className="text-stone-500 font-light leading-loose text-lg">
              The story of AURUM is a century-long dialogue between European precision and the vibrant soul of Indian heritage. Our founder, Marcelle Aurum, was the first to merge the delicate lace-work settings of Switzerland with the bold, majestic gemstones of the East.
            </p>
          </div>
        </div>

        {/* Section 2: Craftsmanship */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <span className="text-[#C5A059] text-[10px] uppercase tracking-[0.4em] font-bold">The Savoir-Faire</span>
            <h3 className="text-4xl font-serif italic">Masters of the Invisible</h3>
            <p className="text-stone-500 font-light leading-loose text-lg">
              In our ateliers, "good enough" is a foreign concept. Every master setter at AURUM must complete a ten-year apprenticeship before they are permitted to touch our Signature High Jewelry pieces. We use 100% recycled gold and ethically sourced conflict-free diamonds.
            </p>
          </div>
          <div className="relative group">
            <img
              src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80"
              className="w-full shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
              alt="Craftsmanship detail"
            />
          </div>
        </div>
      </section>

      {/* 4. BRAND PILLARS */}
      <section className="bg-stone-900 text-white py-32 px-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-20">
            <div className="space-y-6 group">
              <Sparkles className="mx-auto text-[#C5A059] group-hover:scale-110 transition-transform" size={40} strokeWidth={1} />
              <h4 className="text-xl font-serif italic">Rarity</h4>
              <p className="text-stone-400 text-sm font-light leading-relaxed">Only the top 0.1% of the world's diamonds meet the AURUM standard of clarity and performance.</p>
            </div>
            <div className="space-y-6 group">
              <ShieldCheck className="mx-auto text-[#C5A059] group-hover:scale-110 transition-transform" size={40} strokeWidth={1} />
              <h4 className="text-xl font-serif italic">Ethics</h4>
              <p className="text-stone-400 text-sm font-light leading-relaxed">Every stone is GIA certified and sourced through the Kimberley Process to ensure peace and prosperity.</p>
            </div>
            <div className="space-y-6 group">
              <Globe className="mx-auto text-[#C5A059] group-hover:scale-110 transition-transform" size={40} strokeWidth={1} />
              <h4 className="text-xl font-serif italic">Heritage</h4>
              <p className="text-stone-400 text-sm font-light leading-relaxed">A century of family-owned excellence, bridging the gap between ancestral art and modern design.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEET THE MAISON */}
      <section className="py-32 px-10">
        <div className="max-w-[1400px] mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-bold mb-4">The Custodians</p>
          <h2 className="text-4xl font-serif italic mb-20">The Faces Behind the Brilliance</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { name: "Ananya Iyer", role: "Creative Director", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80" },
              { name: "Rajesh Mehta", role: "Master Gemologist", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80" },
              { name: "Sania Mirza", role: "Lead Designer", img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80" }
            ].map((member, i) => (
              <div key={i} className="group">
                <div className="aspect-[3/4] overflow-hidden mb-6 bg-stone-100">
                  <img src={member.img} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" alt={member.name} />
                </div>
                <h5 className="text-xl font-serif italic">{member.name}</h5>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-2">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-32 border-t border-stone-100 text-center">
        <h3 className="text-3xl font-serif italic mb-8">Discover Your Own Heritage Piece</h3>
        <button className="bg-stone-900 text-white px-12 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#C5A059] transition-all duration-500">
          Explore the Collection
        </button>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes slow-zoom {
          from { transform: scale(1.1); }
          to { transform: scale(1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-out infinite alternate;
        }
      `}</style>
    </div></>
  );
}