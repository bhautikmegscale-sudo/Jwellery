// "use client";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { ShoppingBag, Search, Menu, User } from "lucide-react";
// import { getCart } from "@/lib/cartClient";
// import { authClient } from "@/lib/authClient";
// import CartDrawer from "./CartDrawer";
// import PremiumAuthModal from "./login";

// const NavLink = ({ children, href }) => (
//   <Link
//     href={href || "/products"}
//     className="hover:text-[#C5A059] transition-colors duration-300 relative group"
//   >
//     {children}
//     <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C5A059] transition-all group-hover:w-full"></span>
//   </Link>
// );

// export default function Navbar2() {
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [cartCount, setCartCount] = useState(0);

//   // Load cart count
//   const updateCount = () => {
//     const items = getCart();
//     const count = items.reduce((acc, item) => acc + item.quantity, 0);
//     setCartCount(count);
//   };

//   const checkAuth = () => {
//     const token = authClient.getToken();
//     setIsLoggedIn(!!token);
//   };

//   useEffect(() => {
//     updateCount();
//     checkAuth();

//     const handleCartUpdate = () => updateCount();
//     const handleOpenCart = () => setIsCartOpen(true);
//     const handleAuthUpdate = () => checkAuth();

//     window.addEventListener("cart-updated", handleCartUpdate);
//     window.addEventListener("open-cart-drawer", handleOpenCart);
//     window.addEventListener("auth-updated", handleAuthUpdate);

//     return () => {
//       window.removeEventListener("cart-updated", handleCartUpdate);
//       window.removeEventListener("open-cart-drawer", handleOpenCart);
//       window.removeEventListener("auth-updated", handleAuthUpdate);
//     };
//   }, []);

//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 50) {
//         setIsScrolled(true);
//       } else {
//         setIsScrolled(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <>
//       <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
//       <PremiumAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

//       {/* DYNAMIC NAVIGATION */}
//       <nav
//         className={`fixed top-0 w-full z-[60] transition-all duration-500 ease-in-out
//     ${isScrolled
//             ? "bg-white py-4 h-20 text-black shadow-sm"
//             : "bg-transparent py-6 h-24 text-black"
//           }`}
//       >
//         <div className="max-w-[1800px] mx-auto px-8 h-full flex justify-between items-center relative">
//           <div className="hidden lg:flex gap-10 text-[10px] uppercase tracking-[0.25em] font-medium">
//             <NavLink href="/products">Collections</NavLink>
//             <NavLink href="/category">Categories</NavLink>
//             <NavLink href="/products">The Maison</NavLink>
//           </div>

//           <Link href="/">
//             <h1
//               className={`cursor-pointer text-3xl font-serif tracking-[0.3em] font-bold absolute left-1/2 -translate-x-1/2 transition-all duration-500 ${isScrolled ? "scale-90" : "scale-100"
//                 }`}
//             >
//               AURUM
//             </h1>
//           </Link>

//           <div className="flex items-center gap-8">
//             <div className="hidden lg:flex gap-10 text-[10px] uppercase tracking-[0.25em] font-medium mr-4">
//               <NavLink href="/journal">Blogs</NavLink>
//               <NavLink href="/about-us">About Us</NavLink>
//               <NavLink href="/contact-us">Contact Us</NavLink>
//             </div>
//             {/* <Search size={20} className="stroke-[1px] cursor-pointer" /> */}

//             <Link
//               href={isLoggedIn ? "/profile" : "#"}
//               onClick={(e) => {
//                 if (!isLoggedIn) {
//                   e.preventDefault();
//                   setIsAuthOpen(true);
//                 }
//               }}
//               className="text-inherit"
//             >
//               <User size={20} className="stroke-[1px] cursor-pointer hover:text-[#C5A059] transition-colors" />
//             </Link>

//             <div
//               className="relative cursor-pointer"
//               onClick={() => setIsCartOpen(true)}
//             >
//               <ShoppingBag size={20} className="stroke-[1px]" />
//               <span className="absolute -top-2 -right-2 bg-[#C5A059] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
//                 {cartCount}
//               </span>
//             </div>
//             <Menu className="lg:hidden" />
//           </div>
//         </div>
//       </nav>
//     </>
//   );
// }
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

    const handleOpenCart = () => setIsCartOpen(true);

    window.addEventListener("cart-updated", updateCount);
    window.addEventListener("open-cart-drawer", handleOpenCart);
    window.addEventListener("auth-updated", checkAuth);

    return () => {
      window.removeEventListener("cart-updated", updateCount);
      window.removeEventListener("open-cart-drawer", handleOpenCart);
      window.removeEventListener("auth-updated", checkAuth);
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
        className={`fixed top-0 w-full z-[60] transition-all duration-500 ease-in-out
   ${isScrolled
            ? "bg-white py-4 h-20 text-black shadow-sm"
            : "bg-transparent py-6 h-24 text-black"
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
