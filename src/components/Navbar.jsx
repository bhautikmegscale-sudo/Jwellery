"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, User } from "lucide-react";
import { getCart } from "@/lib/cartClient";
import { authClient } from "@/lib/authClient";
import CartDrawer from "./CartDrawer";
import PremiumAuthModal from "./login";
import MobileMenuDrawer from "./MobileMenuDrawer";

const NavLink = ({ children, href }) => (
  <Link
    href={href}
    className="hover:text-[#C5A059] transition-colors duration-300"
  >
    {children}
  </Link>
);

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateCount = () => {
    const items = getCart();
    setCartCount(items.reduce((a, i) => a + i.quantity, 0));
  };

  const checkAuth = () => setIsLoggedIn(!!authClient.getToken());

  useEffect(() => {
    updateCount();
    checkAuth();

    if (authClient.getToken()) {
      authClient.getCustomer();
    }

    const openCart = () => setIsCartOpen(true);
    window.addEventListener("cart-updated", updateCount);
    window.addEventListener("auth-updated", checkAuth);
    window.addEventListener("open-cart-drawer", openCart);
    return () => {
      window.removeEventListener("cart-updated", updateCount);
      window.removeEventListener("auth-updated", checkAuth);
      window.removeEventListener("open-cart-drawer", openCart);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent background scroll when drawers open
  useEffect(() => {
    document.body.style.overflow =
      isMenuOpen || isCartOpen ? "hidden" : "auto";
  }, [isMenuOpen, isCartOpen]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <MobileMenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <PremiumAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <nav
        className={`fixed w-full z-[60] transition-all duration-300 ${isScrolled
          ? "bg-white dark:bg-stone-950 text-stone-900 dark:text-white shadow-sm"
          : "bg-transparent text-white"
          }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between relative">

          {/* MOBILE MENU */}
          <button className="lg:hidden" onClick={() => setIsMenuOpen(true)}>
            <Menu />
          </button>

          {/* DESKTOP LEFT */}
          <div className="hidden lg:flex gap-10 text-[10px] uppercase tracking-[0.25em]">
            <NavLink href="/products">Collections</NavLink>
            <NavLink href="/category">Categories</NavLink>
            <NavLink href="/products">The Maison</NavLink>
          </div>

          {/* LOGO */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-3xl font-serif tracking-[0.3em] font-bold">
              AURUM
            </h1>
          </Link>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex gap-10 text-[10px] uppercase tracking-[0.25em]">
              <NavLink href="/journal">Blogs</NavLink>
              <NavLink href="/about-us">About Us</NavLink>
              <NavLink href="/contact-us">Contact Us</NavLink>
            </div>

            <Link
              href={isLoggedIn ? "/profile" : "#"}
              onClick={(e) => {
                if (!isLoggedIn) {
                  e.preventDefault();
                  setIsAuthOpen(true);
                }
              }}
            >
              <User size={20} />
            </Link>

            <button onClick={() => setIsCartOpen(true)} className="relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-2 -right-2 bg-[#C5A059] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
