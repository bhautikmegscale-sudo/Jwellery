import React from 'react';
import { Instagram } from 'lucide-react'; // Optional: Use lucide-react or any SVG icon

const SocialGallery = () => {
  // Replace these with your actual jewelry product/lifestyle images
  const images = [
    { id: 1, url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600' },
    { id: 2, url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=600' },
    { id: 3, url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=600' },
    { id: 4, url: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=600' },
    { id: 5, url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=600' },
    { id: 6, url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600' },
  ];

  return (
    <section className="py-12 bg-white">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-2">Follow Us</h2>
        <a 
          href="https://instagram.com/Your_Jewelry_Store" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-pink-800 font-medium hover:underline tracking-wide transition-colors"
        >
          @Your_Jewelry_Store
        </a>
      </div>

      {/* Responsive Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full">
        {images.map((img) => (
          <div key={img.id} className="relative group overflow-hidden aspect-square cursor-pointer">
            {/* Image */}
            <img 
              src={img.url} 
              alt="Jewelry Gallery" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Instagram className="text-white w-8 h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SocialGallery;