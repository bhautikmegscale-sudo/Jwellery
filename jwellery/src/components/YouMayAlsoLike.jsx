"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import ProductCard from "./ProductCard";

export default function YouMayAlsoLike() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/product?first=250");
        const data = await res.json();

        if (data.products) {
          const shuffled = [...data.products].sort(() => 0.5 - Math.random());
          setProducts(shuffled.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return null;

  const sliderSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1.2,
    slidesToScroll: 1,
    swipeToSlide: true,
  };

  return (
    <section className="bg-white py-8 mb-16">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif italic text-stone-800">
            You May Also Like
          </h2>
        </div>

        {/* ✅ Mobile slider */}
        <div className="block md:hidden">
          <Slider {...sliderSettings}>
            {products.map((product) => (
              <div key={product.id} className="px-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>

        {/* ✅ Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
