"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, X, Trash2, Plus, Minus } from "lucide-react";
import { getCart, removeFromCart, updateQuantity } from "@/lib/cartClient";
import CartRecommendations from "./CartRecommendations";

export default function CartDrawer({ isOpen, onClose }) {
    const [cartItems, setCartItems] = useState([]);

    // Load cart
    const loadCart = () => {
        const items = getCart();
        console.log("CartDrawer: Loading items", items);
        setCartItems(items || []);
    };

    useEffect(() => {
        if (isOpen) {
            loadCart();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    useEffect(() => {
        const handleCartUpdate = () => loadCart();
        window.addEventListener("cart-updated", handleCartUpdate);
        return () => {
            window.removeEventListener("cart-updated", handleCartUpdate);
        };
    }, []);

    const handleRemove = (variantId) => {
        removeFromCart(variantId);
        // Auto-update local state happens via event listener, but we can verify
    };

    const handleIncrement = (item) => {
        updateQuantity(item.variantId, item.quantity + 1);
    };

    const handleDecrement = (item) => {
        updateQuantity(item.variantId, item.quantity - 1);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

    return (
        <div
            className={`fixed inset-0 z-[100] transition-visibility ${isOpen ? "visible" : "invisible"}`}
        >
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />
            {/* 
               Wrapper for both Side Panel (Recommendations) and Main Cart 
               On desktop, this will be flex-row. On mobile, just the Main Cart taking space.
            */}
            <div
                className={`absolute right-0 top-0 h-full flex transition-transform duration-500 ease-expo ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Desktop Recommendations Side Panel */}
                <div className="hidden md:flex w-[320px] bg-white border-r h-full flex-col shadow-lg overflow-hidden">
                    <CartRecommendations isMobile={false} />
                </div>

                <div className="relative w-screen max-w-md bg-white shadow-2xl h-full flex flex-col">
                    <div className="p-4 h-full flex flex-col">
                        {/* Header - Fixed */}
                        <div className="flex justify-between items-center mb-6 border-b pb-6 shrink-0">
                            <h2 className="text-xl font-serif text-black">Your Boutique Bag</h2>
                            <X
                                className="cursor-pointer hover:rotate-90 transition-transform text-black"
                                onClick={onClose}
                            />
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-stone-400 space-y-4">
                                <ShoppingBag size={40} strokeWidth={1} />
                                <p className="italic font-serif">Your bag is currently empty.</p>
                                <Link
                                    href="/products"
                                    onClick={onClose}
                                    className="text-[10px] uppercase tracking-widest border-b border-stone-800 pb-1 text-stone-800"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Cart Items - Scrollable */}
                                <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 min-h-0">
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-sm font-medium text-stone-800">{item.title}</h4>
                                                    <p className="text-xs text-stone-500">{item.variantTitle}</p>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <p className="text-sm font-semibold text-[#8f4a12]">₹{Number(item.price).toFixed(2)}</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center border border-stone-200 rounded">
                                                            <button
                                                                onClick={() => handleDecrement(item)}
                                                                className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                                                            >
                                                                <Minus size={10} />
                                                            </button>
                                                            <span className="w-8 text-[10px] font-medium text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleIncrement(item)}
                                                                className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                                                            >
                                                                <Plus size={10} />
                                                            </button>
                                                        </div>
                                                        <button onClick={() => handleRemove(item.variantId)} className="text-stone-400 hover:text-red-500">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Mobile Recommendations - Fixed at bottom */}
                                <div className="md:hidden h-[110px] shrink-0 py-2 border-t">
                                    <CartRecommendations isMobile={true} />
                                </div>

                                {/* Subtotal - Fixed at bottom */}
                                <div className="border-t pt-2 space-y-4 bg-white shrink-0">
                                    <div className="flex justify-between items-center text-lg font-medium">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-stone-400 text-center">Shipping and taxes calculated at checkout.</p>
                                    <Link href="/check-out">
                                        <button className="w-full bg-stone-900 text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#8f4a12] transition-colors">
                                            Checkout
                                        </button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
