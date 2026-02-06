"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, updateQuantity, removeFromCart } from '@/lib/cartClient';
import {
    ChevronLeft,
    Lock,
    CreditCard,
    Truck,
    ShieldCheck,
    CheckCircle2,
    Banknote,
    Plus,
    Minus,
    Trash2
} from 'lucide-react';





// Move InputField outside to prevent re-creation on every render
const InputField = ({ label, placeholder, name, type = "text", required = false, value, onChange, readOnly = false }) => (
    <div className="group space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 dark:text-muted-foreground group-focus-within:text-[#C5A059] transition-colors">
            {label} {required && <span className="text-red-400">*</span>}
            {readOnly && <span className="ml-2 text-[9px] text-stone-400 dark:text-muted-foreground">(Auto-filled)</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full bg-transparent border-b py-3 text-sm outline-none transition-all duration-300 placeholder:text-stone-300 dark:placeholder:text-stone-600 dark:text-foreground ${readOnly
                ? 'border-stone-100 dark:border-stone-800 text-stone-500 dark:text-stone-400 cursor-not-allowed bg-stone-50/50 dark:bg-stone-900/50'
                : 'border-stone-200 dark:border-stone-700 focus:border-[#C5A059]'
                }`}
        />
    </div>
);

export default function CheckoutPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        address1: '', city: '', zip: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [sessionId, setSessionId] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);

    // Generate tracking session ID on mount
    useEffect(() => {
        const generateSessionId = () => {
            return `chk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        };
        const sid = generateSessionId();
        setSessionId(sid);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('checkout_session_id', sid);
        }
    }, []);

    // Helper function to send tracking events
    const sendTrackingEvent = async (eventName, eventData = {}) => {
        if (!sessionId) return;

        const shopurl = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'mega-jwels.myshopify.com';

        const trackingPayload = {
            shopurl,
            sessionId,
            event: eventName,
            ...eventData,
            meta: {
                url: typeof window !== 'undefined' ? window.location.href : '',
                timestamp: new Date().toISOString(),
            }
        };

        try {
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(trackingPayload)], { type: 'application/json' });
                navigator.sendBeacon('/api/track/checkout', blob);
            } else {
                await fetch('/api/track/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(trackingPayload),
                    keepalive: true
                });
            }
        } catch (error) {
            console.error('Tracking error:', error);
        }
    };

    const continuetopayment = () => {
        const requiredFields = {
            'First Name': formData.firstName?.trim(),
            'Last Name': formData.lastName?.trim(),
            'Email': formData.email?.trim(),
            'Phone': formData.phone?.trim(),
            'Address': formData.address1?.trim(),
            'City': formData.city?.trim(),
            'Zip Code': formData.zip?.trim()
        };

        // Check for empty fields
        const emptyFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field, _]) => field);

        if (emptyFields.length > 0) {
            alert(`Please fill in all required fields:\n${emptyFields.join(', ')}`);
            setIsProcessing(false);
            return;
        }
        setStep(2);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Track checkout progress when form data changes
    useEffect(() => {
        if (!sessionId || step !== 1 || !cartItems || cartItems.length === 0) return;

        const hasAnyData = formData.firstName || formData.lastName || formData.email ||
            formData.phone || formData.address1 || formData.city || formData.zip;

        if (hasAnyData) {
            sendTrackingEvent('checkout_progress', {
                customer: {
                    firstName: formData.firstName || null,
                    lastName: formData.lastName || null,
                    email: formData.email || null,
                    phone: formData.phone || null,
                },
                address: {
                    address1: formData.address1 || null,
                    city: formData.city || null,
                    zip: formData.zip || null,
                },
                cart: {
                    items: cartItems.map(item => ({
                        title: item.title || item.name,
                        variant_id: item.variantId || item.id,
                        quantity: item.quantity,
                        price: item.price,
                        image: item.image || null
                    })),
                    subtotal: subtotal,
                    totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                    currency: 'USD'
                },
                pricing: {
                    subtotal: subtotal,
                    total: subtotal,
                    currency: 'USD'
                }
            });
        }
    }, [formData, sessionId, step, cartItems, subtotal]);

    // Fetch logged-in user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { authClient } = await import('@/lib/authClient');
                const customer = await authClient.getCustomer();

                if (customer) {
                    setIsLoggedIn(true);
                    // Pre-fill form with user data
                    setFormData({
                        firstName: customer.firstName || '',
                        lastName: customer.lastName || '',
                        email: customer.email || '',
                        phone: customer.phone || '',
                        address1: customer.defaultAddress?.address1 || '',
                        city: customer.defaultAddress?.city || '',
                        zip: customer.defaultAddress?.zip || ''
                    });
                }
            } catch (error) {
                console.log('User not logged in or error fetching data:', error);
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUserData();
    }, []);

    const handleCompleteOrder = async () => {
        // Validate all required fields
        const requiredFields = {
            'First Name': formData.firstName?.trim(),
            'Last Name': formData.lastName?.trim(),
            'Email': formData.email?.trim(),
            'Phone': formData.phone?.trim(),
            'Address': formData.address1?.trim(),
            'City': formData.city?.trim(),
            'Zip Code': formData.zip?.trim()
        };

        // Check for empty fields
        const emptyFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field, _]) => field);

        if (emptyFields.length > 0) {
            alert(`Please fill in all required fields:\n${emptyFields.join(', ')}`);
            setIsProcessing(false);
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address');
            setIsProcessing(false);
            return;
        }

        setIsProcessing(true);

        // Track checkout started event
        await sendTrackingEvent('checkout_started', {
            customer: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
            },
            address: {
                address1: formData.address1,
                city: formData.city,
                zip: formData.zip,
            },
            cart: {
                items: cartItems.map(item => ({
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal: subtotal,
            },
            paymentMethod: paymentMethod
        });

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: formData,
                    cart: { items: cartItems, subtotal: subtotal, tax: 0 },
                    paymentMethod: paymentMethod
                })
            });

            const data = await response.json();

            if (data.success) {
                // Prepare order data for confirmation page
                const orderData = {
                    orderNumber: data.order.name,
                    date: new Date().toISOString(),
                    total: totalAmount,
                    subtotal: subtotal,
                    tax: 0,
                    items: cartItems,
                    customer: formData,
                    paymentMethod: paymentMethod
                };

                // Store order data in sessionStorage
                sessionStorage.setItem('lastOrder', JSON.stringify(orderData));

                // Clear the cart
                const { clearCart } = await import('@/lib/cartClient');
                clearCart();

                // Redirect to order confirmation page
                router.push('/order-confirmation');
            } else {
                alert("Order failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };


    const loadCart = () => {
        const items = getCart();
        setCartItems(items);
        const total = items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
        setSubtotal(total);
    };

    useEffect(() => {
        loadCart();
        window.addEventListener('cart-updated', loadCart);
        return () => window.removeEventListener('cart-updated', loadCart);
    }, []);

    const handleIncrement = (item) => {
        updateQuantity(item.variantId, item.quantity + 1);
    };

    const handleDecrement = (item) => {
        updateQuantity(item.variantId, item.quantity - 1);
    };

    const handleRemove = (item) => {
        removeFromCart(item.variantId);
    };

    const tax = 0; // Tax removed
    const totalAmount = subtotal;

    const [paymentMethod, setPaymentMethod] = useState('card');

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#C5A059]/20">
            <main className="max-w-[1200px] mx-auto pt-24 pb-20 px-6">

                {/* Navigation & Progress */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors group"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Bag
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${step >= 1 ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200'}`}>
                                {step > 1 ? <CheckCircle2 size={12} /> : "1"}
                            </span>
                            <span className={`text-[11px] uppercase tracking-[0.2em] ${step === 1 ? 'font-bold text-foreground' : 'text-stone-400 dark:text-stone-600'}`}>Shipping</span>
                        </div>
                        <div className="w-12 h-[1px] bg-stone-200 dark:bg-stone-800" />
                        <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${step === 2 ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900' : 'border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-600'}`}>2</span>
                            <span className={`text-[11px] uppercase tracking-[0.2em] ${step === 2 ? 'font-bold text-foreground' : 'text-stone-400 dark:text-stone-600'}`}>Payment</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-20">

                    {/* LEFT: FORM SECTION */}
                    <div className="lg:w-[55%]">
                        {step === 1 ? (
                            <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <header>
                                    <h2 className="text-3xl font-serif italic mb-2 text-foreground">Shipping information</h2>
                                    <p className="text-stone-400 dark:text-stone-500 text-sm">Please enter your delivery details below.</p>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                    <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="e.g. Enter your first name" required />
                                    <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="e.g. Enter your last name" required />
                                    <div className="md:col-span-2">
                                        <InputField
                                            label="Email Address"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="user@example.com"
                                            type="email"
                                            required
                                            readOnly={isLoggedIn}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputField
                                            label="Phone Number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="1234567890"
                                            required
                                            readOnly={isLoggedIn}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputField label="Delivery Address" name="address1" value={formData.address1} onChange={handleInputChange} placeholder="Street name and number" />
                                    </div>
                                    <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
                                    <InputField label="Postal Code" name="zip" value={formData.zip} onChange={handleInputChange} placeholder="10001" />
                                </div>

                                <button
                                    onClick={() => continuetopayment()}
                                    className="w-full bg-stone-900 text-white py-6 text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-[#C5A059] transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1"
                                >
                                    Continue to Payment
                                </button>
                            </section>
                        ) : (
                            <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <header>
                                    <h2 className="text-3xl font-serif italic mb-2">Payment Method</h2>
                                    <p className="text-stone-400 text-sm">All transactions are secure and encrypted.</p>
                                </header>

                                {/* Payment Method Selection */}
                                <div className="space-y-4">
                                    <div
                                        onClick={() => setPaymentMethod('card')}
                                        className={`border p-6 rounded-sm cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-stone-200 dark:border-stone-800 hover:border-stone-500 dark:hover:border-stone-600'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#C5A059]' : 'border-stone-300 dark:border-stone-600'}`}>
                                                    {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-[#C5A059]" />}
                                                </div>
                                                <span className="text-xs tracking-[0.2em] uppercase font-semibold text-foreground">Credit / Debit Card</span>
                                            </div>
                                            <div className="flex gap-2 text-stone-400">
                                                <CreditCard size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`border p-6 rounded-sm cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-stone-200 dark:border-stone-800 hover:border-stone-500 dark:hover:border-stone-600'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#C5A059]' : 'border-stone-300 dark:border-stone-600'}`}>
                                                    {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-[#C5A059]" />}
                                                </div>
                                                <span className="text-xs tracking-[0.2em] uppercase font-semibold text-foreground">Cash on Delivery</span>
                                            </div>
                                            <div className="flex gap-2 text-stone-400">
                                                <Banknote size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Details Form */}
                                <div className="border border-stone-200 dark:border-stone-800 p-8 rounded-sm bg-white dark:bg-stone-900 shadow-sm transition-all duration-500">
                                    {paymentMethod === 'card' ? (
                                        <div className="space-y-10 animate-in fade-in duration-500">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-xs uppercase text-stone-400 tracking-widest">Enter Card Details</span>
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-6 bg-stone-100 rounded flex items-center justify-center text-[8px] font-bold text-stone-400 border border-stone-200">VISA</div>
                                                    <div className="w-10 h-6 bg-stone-100 rounded flex items-center justify-center text-[8px] font-bold text-stone-400 border border-stone-200">MC</div>
                                                </div>
                                            </div>
                                            <InputField label="Card Number" placeholder="0000 0000 0000 0000" />
                                            <div className="grid grid-cols-2 gap-8">
                                                <InputField label="Expiry Date" placeholder="MM / YY" />
                                                <InputField label="Security Code" placeholder="CVV" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 animate-in fade-in duration-500">
                                            <div className="w-16 h-16 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C5A059]">
                                                <Truck size={32} strokeWidth={1.5} />
                                            </div>
                                            <h4 className="font-serif text-lg mb-2">Pay upon delivery</h4>
                                            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                                                You can pay in cash or via UPI when our courier partner delivers the package to your doorstep.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-10 py-6 border border-stone-200 dark:border-stone-800 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCompleteOrder}
                                        disabled={isProcessing}
                                        className="flex-grow bg-stone-900 text-white py-6 text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-[#C5A059] transition-all duration-500 shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? "Processing..." : `Complete Order — £ ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* Trust Footer */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 mt-16 border-t border-stone-100 dark:border-stone-800">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                                    <Lock size={14} />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Secure</span>
                                </div>
                                <p className="text-[10px] text-stone-400 leading-relaxed">256-bit SSL encrypted payment processing.</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                                    <Truck size={14} />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Shipping</span>
                                </div>
                                <p className="text-[10px] text-stone-400 leading-relaxed">Complimentary insured global delivery.</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
                                    <ShieldCheck size={14} />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Warranty</span>
                                </div>
                                <p className="text-[10px] text-stone-400 leading-relaxed">Lifetime authenticity guarantee.</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: SUMMARY SECTION */}
                    <div className="lg:w-[45%]">
                        <div className="bg-stone-50/50 dark:bg-stone-900/30 p-10 lg:sticky lg:top-10 border border-stone-100 dark:border-stone-800">
                            <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-stone-400 dark:text-stone-500 mb-8 pb-4 border-b border-stone-200 dark:border-stone-800">Your Selection</h3>

                            {cartItems.length === 0 ? (
                                /* Empty Cart State */
                                <div className="text-center py-12 animate-in fade-in duration-500">
                                    <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                                            <circle cx="9" cy="21" r="1"></circle>
                                            <circle cx="20" cy="21" r="1"></circle>
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                        </svg>
                                    </div>
                                    <h4 className="font-serif text-lg italic text-stone-800 dark:text-stone-200 mb-2">Your bag is empty</h4>
                                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mb-8 max-w-xs mx-auto">
                                        Explore our collections and discover exquisite pieces crafted just for you.
                                    </p>
                                    <button
                                        onClick={() => router.push('/products')}
                                        className="bg-stone-900 text-white px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#C5A059] transition-all duration-500"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                /* Cart Items */
                                <>
                                    <div className="space-y-8 mb-10">
                                        {cartItems.map((item, idx) => (
                                            <div key={idx} className="flex gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                                <div className="relative group shrink-0">
                                                    <div className="w-24 h-24 bg-white dark:bg-stone-800 overflow-hidden border border-stone-100 dark:border-stone-800">
                                                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-between py-1 flex-grow">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="text-[12px] uppercase tracking-wider font-bold text-stone-800 dark:text-stone-200 pr-4">{item.title}</h4>
                                                            <button
                                                                onClick={() => handleRemove(item)}
                                                                className="text-stone-300 hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                        <p className="text-[11px] text-stone-400 mt-1">{item.variantTitle}</p>
                                                    </div>

                                                    <div className="flex justify-between items-end mt-2">
                                                        <div className="flex items-center border border-stone-200 dark:border-stone-800">
                                                            <button
                                                                onClick={() => handleDecrement(item)}
                                                                className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                                                            >
                                                                <Minus size={10} />
                                                            </button>
                                                            <span className="w-8 text-[10px] font-medium text-center text-foreground">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleIncrement(item)}
                                                                className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                                                            >
                                                                <Plus size={10} />
                                                            </button>
                                                        </div>
                                                        <p className="text-[12px] font-medium">£ {(Number(item.price) * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4 pt-8 border-t border-stone-200 dark:border-stone-800">
                                        <div className="flex justify-between text-[11px] uppercase tracking-widest">
                                            <span className="text-stone-400 dark:text-stone-500">Subtotal</span>
                                            <span className="text-stone-900 dark:text-stone-100 font-medium">£ {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] uppercase tracking-widest">
                                            <span className="text-stone-400">Shipping</span>
                                            <span className="text-[#C5A059] font-bold italic">Complimentary</span>
                                        </div>

                                        <div className="flex justify-between items-baseline pt-6 border-t border-stone-900 dark:border-stone-100">
                                            <span className="text-xs uppercase tracking-[0.3em] font-bold">Total Amount</span>
                                            <div className="text-right">
                                                <span className="text-2xl font-light tracking-tighter">£ {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#C5A059]" />
                                        <p className="text-[10px] leading-relaxed text-stone-500 italic">
                                            "Each Maison piece is meticulously handcrafted by our master artisans. Due to the high value of your selection, a signature will be required upon delivery."
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </main >
        </div >
    );
}