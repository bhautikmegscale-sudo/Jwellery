import React from 'react';

const TrustIcon = ({ imgSrc, title, description }) => (
  // Reduced px-4 to px-1 for mobile to save space
  <div className="flex flex-col items-center text-center px-1 group">
    <div className="mb-3 md:mb-6 transform transition-transform duration-300 group-hover:-translate-y-1">
      <img 
        src={imgSrc} 
        alt={title} 
        // Scaled down image for mobile (w-8) vs desktop (w-12)
        className="w-8 h-8 md:w-12 md:h-12 object-contain filter grayscale hover:grayscale-0 transition-all"
      />
    </div>
    {/* Text size reduced to text-xs (12px) on mobile for fit */}
    <h3 className="text-[10px] leading-tight sm:text-lg md:text-xl font-serif text-stone-900 mb-1 tracking-tight sm:tracking-wide">
      {title}
    </h3>
    {/* Description hidden or significantly reduced on tiny screens */}
    <p className="text-stone-500 text-[9px] sm:text-sm font-light leading-none sm:leading-normal">
      {description}
    </p>
  </div>
);

const JewelryFeatures = () => {
  const features = [
    {
      imgSrc: "https://img.icons8.com/ios/100/delivery--v1.png",
      title: "Free Shipping",
      description: "Over $1000" // Shortened for better mobile fit
    },
    {
      imgSrc: "https://img.icons8.com/ios/100/headset.png",
      title: "Quality Support",
      description: "24/7 online"
    },
    {
      imgSrc: "https://img.icons8.com/ios/100/return-purchase.png",
      title: "Return Refund",
      description: "30 days"
    },
    {
      imgSrc: "https://img.icons8.com/ios/100/gift-card.png",
      title: "Gift Voucher",
      description: "20% off"
    }
  ];

  return (
    <section className="bg-stone-200/50 py-10 md:py-20 border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        {/* Changed grid-cols-1 to grid-cols-4 for all breakpoints */}
        <div className="grid grid-cols-4 gap-x-2 md:gap-x-8">
          {features.map((feature, index) => (
            <TrustIcon 
              key={index}
              imgSrc={feature.imgSrc}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default JewelryFeatures;