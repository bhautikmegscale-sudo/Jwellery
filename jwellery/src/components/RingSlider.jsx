"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const rings = [
    { id: 1, name: "Oval Cut Pave", sub: "Classic Side-Stone Engagement Ring", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/ring.png?v=1768974514" },
    { id: 2, name: "Tapered Baguette", sub: "Three Stone Engagement Ring", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/Three-stone-Engagement-Ring.png?v=1768974513" },
    { id: 3, name: "CHANNEL SET RING", sub: "Bezel Set Pavé Engagement Ring", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/Halo-Engagement-Ring_1.png?v=1768974513" },
    { id: 4, name: "Floral Halo", sub: "Vintage Style Engagement Ring", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/Solitaire-Engagement-Ring.png?v=1768974514" },
    { id: 5, name: "Vintage Milgrain", sub: "Intricate Antique Ring", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/Solitaire-Classic-Engagement-Ring.png?v=1768974514" },
    { id: 6, name: "Halo Women", sub: "Halo Engagement Ring", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/Halo-Women-Engagement-Ring.png?v=1768974514" },
    { id: 7, name: "Pave Ring", sub: "Pave Engagement Ring", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/pave-engagement-ring.png?v=1768974514" },
    { id: 8, name: "Side Stone", sub: "Side Stone Diamond Ring", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/Side-stone-Diamond-Engagement-Ring.png?v=1768974514" },
    { id: 9, name: "Channel Set", sub: "Channel Set Ring", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/Channel-Set-Engagement-Ring.png?v=1768974513" },
    { id: 10, name: "Stackable", sub: "Stackable Diamond Ring", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/Stackable-Ring.png?v=1768974513" },
    { id: 11, name: "Eternity", sub: "Eternity Band", src: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/eternity-ring.png?v=1768974513" },
];

const RingSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(2);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % rings.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + rings.length) % rings.length);

    const getPosition = (index) => {
        const diff = (index - currentIndex + rings.length) % rings.length;
        if (diff === 0) return "center";
        if (diff === 1 || diff === -(rings.length - 1)) return "right";
        if (diff === 2 || diff === -(rings.length - 2)) return "far-right";
        if (diff === rings.length - 1 || diff === -1) return "left";
        if (diff === rings.length - 2 || diff === -2) return "far-left";
        return "hidden";
    };

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 50) prevSlide();
        else if (info.offset.x < -50) nextSlide();
    };

    return (
        <div className="bg-white py-12 md:py-20 px-4 w-full overflow-hidden select-none">

            {/* Header with Blended Radial Background */}
            <div className="relative text-center mb-12 py-10">
                {/* The Blended Background Layer */}
                <div
                    className="absolute inset-0 -top-10 opacity-60 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(245,245,240,1) 0%, rgba(255,255,255,0) 40%)'
                    }}
                />

                <div className="relative z-10">
                    <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-gray-500 font-sans mb-3">
                        Aurum's Best Selling
                    </p>
                    <h2 className="text-2xl md:text-5xl font-light tracking-[0.15em] uppercase font-serif text-[#1a1a1a]">
                        Engagement Rings
                    </h2>
                </div>
            </div>

            {/* Slider Section */}
            <div className="relative max-w-7xl mx-auto h-[250px] md:h-[300px] flex items-center justify-center">
                {rings.map((ring, index) => {
                    const pos = getPosition(index);
                    const xPos = isMobile
                        ? { "left": -140, "center": 0, "right": 140, "far-left": -140, "far-right": 140, "hidden": 0 }
                        : { "far-left": -500, "left": -250, "center": 0, "right": 250, "far-right": 500, "hidden": 0 };

                    const isFar = pos.includes("far");
                    const opacity = pos === "center" ? 1 : (isMobile && isFar) || pos === "hidden" ? 0 : 0.4;

                    return (
                        <motion.div
                            key={ring.id}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={handleDragEnd}
                            animate={{
                                x: xPos[pos] || 0,
                                scale: pos === "center" ? 1.1 : 0.6,
                                opacity: opacity,
                                zIndex: pos === "center" ? 30 : 10,
                            }}
                            transition={{ type: "spring", stiffness: 150, damping: 20 }}
                            className="absolute w-[180px] md:w-[350px] cursor-grab active:cursor-grabbing"
                            onClick={() => {
                                if (pos.includes("left")) prevSlide();
                                if (pos.includes("right")) nextSlide();
                            }}
                        >
                            <img
                                src={ring.src}
                                alt={ring.name}
                                className="w-full h-auto object-contain pointer-events-none"
                            />
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer Info Section */}
            <div className="text-center ">
                <div className="flex items-center justify-center gap-4 md:gap-10">
                    <button onClick={prevSlide} className="p-2 text-gray-400 hover:text-black transition-colors">
                        <ChevronLeft strokeWidth={1} className="w-6 h-6 md:w-8 md:h-8" />
                    </button>

                    <div className="min-w-[240px] md:min-w-[400px]">
                        <motion.h4
                            key={`name-${currentIndex}`}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm md:text-xl font-medium tracking-[0.1em] uppercase text-gray-900"
                        >
                            {rings[currentIndex].name}
                        </motion.h4>
                        <motion.p
                            key={`sub-${currentIndex}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] md:text-sm italic text-gray-400 font-serif mt-1"
                        >
                            {rings[currentIndex].sub}
                        </motion.p>
                    </div>

                    <button onClick={nextSlide} className="p-2 text-gray-400 hover:text-black transition-colors">
                        <ChevronRight strokeWidth={1} className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RingSlider; 