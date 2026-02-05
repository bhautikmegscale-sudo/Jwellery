"use client";
import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Navbar2 from "../../components/Navbar";
import Footer from "../../components/Footer";
export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "Bespoke Bridal Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("https://adminrocket.megascale.co.in/api/contact", {
        method: "POST",
        headers: {
          "Origin": window.location.origin,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          store: "mega-jwels.myshopify.com",
        }),
      });

      if (response.ok) {
        setSubmitStatus({ type: "success", message: "Thank you! Your message has been sent successfully." });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "Bespoke Bridal Inquiry",
          message: "",
        });
      } else {
        setSubmitStatus({ type: "error", message: "Something went wrong. Please try again." });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({ type: "error", message: "Failed to send message. Please try again later." });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 overflow-x-hidden flex flex-col">
      {/* NAVBAR */}
      <Navbar2 />

      {/* 1. LUXURY BANNER */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?auto=format&fit=crop&q=80"
            className="w-full h-full object-cover grayscale-[0.3]"
            alt="Jewelry Atelier Mumbai"
          />
          <div className="absolute inset-0 bg-stone-900/50" />
        </div>
        <div className="relative z-10 text-center px-6">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/80 mb-4">
            A Legacy of Brilliance
          </p>
          <h1 className="text-5xl md:text-7xl font-serif italic text-white leading-tight">
            Contact Us
          </h1>
        </div>
      </section>

      {/* 2. CONTACT INFO & FORM SECTION */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Left: Indian Boutique Details */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="text-3xl font-serif italic mb-6">
                Concierge Services
              </h2>
              <p className="text-stone-500 font-light leading-relaxed max-w-sm">
                Whether you seek a bespoke bridal masterpiece or a private
                viewing of our High Jewelry collection, our specialists in
                Mumbai are at your service.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-stone-50 flex items-center justify-center flex-shrink-0">
                  <MapPin
                    size={20}
                    className="text-[#C5A059]"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-bold mb-1">
                    West Midlands Flagship
                  </h4>
                  <p className="text-stone-500 text-sm font-light">
                    Coventry, West Midlands, England, CV1 2BP
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-stone-50 flex items-center justify-center flex-shrink-0">
                  <Mail
                    size={20}
                    className="text-[#C5A059]"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-bold mb-1">
                    Inquiries
                  </h4>
                  <p className="text-stone-500 text-sm font-light">
                    india.concierge@aurum.in
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-stone-50 flex items-center justify-center flex-shrink-0">
                  <Phone
                    size={20}
                    className="text-[#C5A059]"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-bold mb-1">
                    Telephone
                  </h4>
                  <p className="text-stone-500 text-sm font-light">
                    +44 7700 900789
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-stone-50 flex items-center justify-center flex-shrink-0">
                  <Clock
                    size={20}
                    className="text-[#C5A059]"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h4 className="text-[11px] uppercase tracking-widest font-bold mb-1">
                    Boutique Hours
                  </h4>
                  <p className="text-stone-500 text-sm font-light">
                    Mon – Sun: 11:00 AM – 9:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form with Indian Placeholders */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-stone-50">
            {submitStatus && (
              <div
                className={`mb-6 p-4 rounded ${submitStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
                  }`}
              >
                {submitStatus.message}
              </div>
            )}
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full border-b border-stone-200 py-3 focus:border-[#C5A059] outline-none transition-colors font-light text-sm"
                    placeholder="Ananya"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full border-b border-stone-200 py-3 focus:border-[#C5A059] outline-none transition-colors font-light text-sm"
                    placeholder="Iyer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border-b border-stone-200 py-3 focus:border-[#C5A059] outline-none transition-colors font-light text-sm"
                  placeholder="ananya.iyer@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                  Subject
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full border-b border-stone-200 py-3 focus:border-[#C5A059] outline-none bg-transparent font-light text-sm appearance-none cursor-pointer"
                >
                  <option>Bespoke Bridal Inquiry</option>
                  <option>Showroom Appointment</option>
                  <option>Diamond Education</option>
                  <option>Heritage Collection Inquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full border-b border-stone-200 py-3 focus:border-[#C5A059] outline-none transition-colors font-light text-sm resize-none"
                  placeholder="Tell us about the piece you are envisioning..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 text-white py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#C5A059] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Request a Consultation"}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. MAP SECTION (Mumbai Location) */}
      <section className="h-[500px] w-full bg-stone-200 relative grayscale hover:grayscale-0 transition-all duration-1000">
        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/95 backdrop-blur px-10 py-8 text-center shadow-2xl pointer-events-auto">
            <p className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold mb-2">
              Flagship Location
            </p>
            <h3 className="font-serif italic text-2xl mb-4">Coventry, West Midlands,</h3>
            <a
              href="https://www.google.com/maps/place/Northfield+Rd,+Coventry+CV1+2BP,+UK/@52.4044896,-1.4950572,281m/data=!3m2!1e3!4b1!4m6!3m5!1s0x48774bc8b2be5e3f:0x8d6b6803226759a0!8m2!3d52.4044686!4d-1.493605!16s%2Fg%2F1tf47nmc?entry=ttu&g_ep=EgoyMDI2MDIwMS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] uppercase tracking-[0.2em] border-b border-stone-900 pb-1"
            >
              Get Directions
            </a>
          </div>
        </div>

        {/* Google Map */}
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2421.055927209493!2d-1.4950572!3d52.4044896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48774bc8b2be5e3f%3A0x8d6b6803226759a0!2sNorthfield%20Rd%2C%20Coventry%20CV1%202BP%2C%20UK!5e0!3m2!1sen!2sin!4v1707131111111"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

      </section>

      <Footer />
    </div>
  );
}
