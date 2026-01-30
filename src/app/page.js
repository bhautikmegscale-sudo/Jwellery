"use client";
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import StorySection from '../components/StorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import Footer from '../components/Footer';
import RingSlider from '../components/RingSlider';
import ScrollCollection from '../components/CollectionSlider';
import ScrollProgress from '../components/ScrollProgress';
import SocialGallery from '../components/SocialGallery';
export default function JewelryLanding() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans selection:bg-stone-200">
      <Navbar />
      <Hero />
      <StorySection />
      <ScrollCollection />
      <RingSlider />
      <FeaturedProducts />
      <SocialGallery/>
      <Footer />
      <style jsx global>{`
        @keyframes slow-zoom { from { transform: scale(1.1); } to { transform: scale(1); } }
        .animate-slow-zoom { animation: slow-zoom 20s ease-out infinite alternate; }
        .ease-expo { transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1); }
      `}</style>
    </div>
  );
}
