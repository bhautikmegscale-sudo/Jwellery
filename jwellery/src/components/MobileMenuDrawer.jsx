"use client";
import Link from "next/link";
import { X } from "lucide-react";

export default function MobileMenuDrawer({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-[70] transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-[80]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h2 className="text-sm uppercase tracking-widest font-medium">
            Menu
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <nav className="flex flex-col gap-6 px-6 py-8 text-sm uppercase tracking-widest">
          <Link href="/products" onClick={onClose}>Collections</Link>
          <Link href="/category" onClick={onClose}>Categories</Link>
          <Link href="/products" onClick={onClose}>The Maison</Link>
          <Link href="/journal" onClick={onClose}>Blogs</Link>
          <Link href="/about-us" onClick={onClose}>About Us</Link>
          <Link href="/contact-us" onClick={onClose}>Contact Us</Link>
        </nav>
      </aside>
    </>
  );
}
