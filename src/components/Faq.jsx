"use client"
import React, { useState } from 'react';
import Image from 'next/image'; // assuming Next.js Image component

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
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
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'
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
      question: "Is the shipping free?",
      answer: "Yes, we offer complimentary insured shipping on all orders over $500. International rates vary based on location."
    },
    {
      question: "When will I receive my item?",
      answer: "Standard orders are processed within 2-3 business days. Domestic delivery takes 3-5 days, international 7-14 days."
    },
    {
      question: "Can I change or return my item?",
      answer: "We offer a 30-day return policy for unworn items in original packaging. Custom or engraved pieces are final sale."
    },
    {
      question: "Are your diamonds certified?",
      answer: "Yes, all diamond jewelry comes with GIA or IGI certification for authenticity."
    },
    {
      question: "Do you offer jewelry resizing?",
      answer: "Yes, we provide resizing for rings and bracelets on select items. Contact support for details."
    },
    {
      question: "How do I clean my jewelry?",
      answer: "Use a soft cloth and mild soap. Avoid harsh chemicals to maintain shine and durability."
    },
    {
      question: "Do you provide gift packaging?",
      answer: "Absolutely! All orders can include premium gift packaging at checkout."
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-serif mb-4 text-gray-900 tracking-tight">
          FAQs
        </h2>
        <p className="text-gray-500 text-sm md:text-base">
          Have a question? We are here to help.
        </p>
      </div>

      <div className="md:flex md:gap-12 items-start">
        {/* Left Image */}
        <div className="md:w-1/2 mb-8 md:mb-0 flex justify-center">
          <Image
            src="/043a47a066900c6649962d99337f8717.jpg" // replace with your image path
            alt="Jewelry FAQs"
            width={500}
            height={500}
            className="rounded-lg object-cover"
          />
        </div>

        {/* Right FAQs */}
        <div className="md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 md:pl-8">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
