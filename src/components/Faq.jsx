"use client"
import React, { useState } from 'react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg md:text-xl font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
          {question}
        </span>
        <span className="ml-6 flex-shrink-0 text-2xl font-light text-gray-500">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const faqData = [
    {
      question: "Is The Shipping Free?",
      answer: "Yes, we offer complimentary insured shipping on all orders over $500. For international orders, shipping rates are calculated at checkout based on your location."
    },
    {
      question: "When Will I Receive My Item?",
      answer: "Standard orders are typically processed within 2-3 business days. Once shipped, delivery takes 3-5 business days for domestic orders and 7-14 business days for international shipments."
    },
    {
      question: "Can I Change Or Return My Item?",
      answer: "We offer a 30-day return policy for all unworn items in their original packaging. Please note that custom-made or engraved jewelry pieces are final sale and cannot be returned."
    }
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-serif mb-4 text-gray-900 tracking-tight">
          FAQs
        </h2>
        <p className="text-gray-500 text-sm md:text-base">
          Have a question? We are here to help.
        </p>
      </div>

      <div className="mt-8 border-t border-gray-200">
        {faqData.map((faq, index) => (
          <FAQItem 
            key={index} 
            question={faq.question} 
            answer={faq.answer} 
          />
        ))}
      </div>
    </section>
  );
};

export default FAQ;