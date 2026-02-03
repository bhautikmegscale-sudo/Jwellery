"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const collections = [
  {
    id: 1,
    name: "Ethereal Gold",
    itemCount: "12 Pieces",
    image: "https://cdn.shopify.com/s/files/1/0947/2563/6380/collections/Gemini_Generated_Image_uruqthuruqthuruq.png?v=1770107031",
    description: "Hand-crafted 18k gold pieces inspired by celestial movements.",
    color: "#E5E1DA",
    handle: "neclace"
  },
  {
    id: 2,
    name: "Oceanic Pearl",
    itemCount: "8 Pieces",
    image: "https://cdn.shopify.com/s/files/1/0947/2563/6380/collections/Gemini_Generated_Image_pnnptxpnnptxpnnp.png?v=1770107045",
    description: "Ethically sourced freshwater pearls set in minimalist silver.",
    color: "#D4E2D4",
    handle: "earings"
  },
  {
    id: 3,
    name: "Midnight Luxe",
    itemCount: "15 Pieces",
    image: "https://cdn.shopify.com/s/files/1/0947/2563/6380/files/a97fcc06c25620f55ad797e6b3ac245b.jpg?v=1769054698",
    description: "Rare black diamonds for those who define their own elegance.",
    color: "#2C2C2C",
    handle: "ring"
  }
];

const CollectionCard = ({ collection, index, progress, targetScale }) => {
  // Parallax and scale effects based on scroll
  const scale = useTransform(progress, [0, 1], [1, targetScale]);

  return (
    <div className="h-screen flex items-center justify-center sticky top-0 overflow-hidden">
      <motion.div
        style={{ scale }}
        className="relative w-full h-[90vh] md:h-[80vh] rounded-3xl overflow-hidden mx-4 md:mx-12 bg-white shadow-2xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Image Section */}
          <div className="relative h-[50vh] lg:h-full overflow-hidden">
            <img
              src={collection.image}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Section */}
          <div className="p-8 md:p-16 flex flex-col justify-center bg-white">
            {/* <span className="text-stone-400 text-sm mb-2">{collection.itemCount}</span> */}
            <h2 className="text-4xl md:text-6xl font-serif mb-6 text-stone-900">
              {collection.name}
            </h2>
            <p className="text-stone-600 text-lg mb-10 max-w-md leading-relaxed">
              {collection.description}
            </p>

            <button className="flex items-center gap-4 group w-fit"
              onClick={() => window.location.href = `/category/${collection.handle}`}
            >
              <span className="font-bold uppercase tracking-widest text-sm border-b-2 border-stone-900 pb-1">
                View Collection
              </span>
              <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center group-hover:translate-x-2 transition-transform">
                <ArrowRight size={20} />
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ScrollCollection = () => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  });

  return (
    <main ref={container} className="relative bg-black">
      {/* Header - Stays fixed or scrolls away */}
      <div className="absolute top-10 left-0 w-full z-50 text-center pointer-events-none">
        {/* <h1 className="text-white/20 text-[14vw] font-serif leading-none select-none">
          COLLECTIONS
        </h1> */}
      </div>

      {collections.map((collection, i) => {
        // Calculate when this specific card should scale down
        const targetScale = 1 - ((collections.length - i) * 0.05);
        return (
          <CollectionCard
            key={collection.id}
            index={i}
            collection={collection}
            progress={scrollYProgress}
            targetScale={targetScale}
          />
        );
      })}


    </main>
  );
};

export default ScrollCollection;