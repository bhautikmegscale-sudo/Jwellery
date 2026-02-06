"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Package,
    MapPin,
    LogOut,
    Loader2,
    Edit2,
    Plus,
    Trash2,
    X,
    Check
} from "lucide-react";
import { authClient } from "@/lib/authClient";
import Navbar2 from "../../components/Navbar2";
import Footer from "../../components/Footer";

export default function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "" });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState("");

    // Address Modal State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        address1: "", city: "", zip: "", country: "", firstName: "", lastName: "", phone: ""
    });
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [addressError, setAddressError] = useState("");

    // Initial Fetch
    const fetchCustomer = async () => {
        try {
            const data = await authClient.getCustomer();
            if (!data) {
                router.push("/");
                return;
            }
            setCustomer(data);
            setProfileForm({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                phone: data.phone || ""
            });
        } catch (error) {
            console.error("Failed to load profile", error);
            router.push("/");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, [router]);

    const handleLogout = () => {
        authClient.logout();
        router.push("/");
    };

    // --- Profile Handlers ---

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        setProfileError("");
        try {
            const updatedCustomer = await authClient.updateProfile(profileForm);
            setCustomer({ ...customer, ...updatedCustomer });
            setIsEditingProfile(false);
        } catch (error) {
            setProfileError(error.message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    // --- Address Handlers ---

    const openAddressModal = (address = null) => {
        if (address) {
            setEditingAddressId(address.id);
            setAddressForm({
                address1: address.address1,
                city: address.city,
                zip: address.zip,
                country: address.country,
                firstName: address.firstName || customer.firstName,
                lastName: address.lastName || customer.lastName,
                phone: address.phone || ""
            });
        } else {
            setEditingAddressId(null);
            setAddressForm({
                address1: "", city: "", zip: "", country: "", firstName: customer.firstName, lastName: customer.lastName, phone: ""
            });
        }
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setIsSavingAddress(true);
        setAddressError("");
        try {
            if (editingAddressId) {
                await authClient.updateAddress(editingAddressId, addressForm);
            } else {
                await authClient.createAddress(addressForm);
            }
            await fetchCustomer(); // Refresh full data
            setIsAddressModalOpen(false);
        } catch (error) {
            setAddressError(error.message);
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            await authClient.deleteAddress(id);
            await fetchCustomer(); // Refresh
        } catch (error) {
            alert("Failed to delete: " + error.message);
        }
    };

    const handleSetDefaultAddress = async (id) => {
        if (!confirm("Set this as your default address?")) return;
        try {
            await authClient.setDefaultAddress(id);
            await fetchCustomer(); // Refresh to update default status
        } catch (error) {
            alert("Failed to set default: " + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
                <Loader2 size={40} className="animate-spin text-[#c5a059]" />
            </div>
        );
    }

    if (!customer) return null;

    const menuItems = [
        { id: "profile", label: "My Profile", icon: <User size={18} /> },
        { id: "orders", label: "Order History", icon: <Package size={18} /> },
        { id: "address", label: "Delivery Addresses", icon: <MapPin size={18} /> },
    ];

    return (
        <>
            <Navbar2 />
            <div className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] pb-20">
                <div className="h-48 w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-center" />
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#faf9f6] to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Sidebar */}
                        <aside className="w-full lg:w-1/4">
                            <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-16 w-16 bg-[#c5a059] rounded-full flex items-center justify-center text-white text-xl font-serif uppercase">
                                        {customer.firstName?.[0]}
                                        {customer.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-lg">
                                            {customer.firstName} {customer.lastName}
                                        </h2>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400">
                                            Member
                                        </p>
                                    </div>
                                </div>

                                <nav className="space-y-1">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-all ${activeTab === item.id
                                                ? "bg-[#1a1a1a] text-white"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-[#c5a059]"
                                                }`}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </button>
                                    ))}
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-red-400 hover:bg-red-50 transition-all mt-4">
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                </nav>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 space-y-6">

                            {/* --- PROFILE TAB --- */}
                            {activeTab === "profile" && (
                                <section className="bg-white p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-serif text-2xl italic">Personal Details</h3>
                                        {!isEditingProfile && (
                                            <button onClick={() => setIsEditingProfile(true)} className="text-[#c5a059] hover:text-[#b08d4b] flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                                                <Edit2 size={14} /> Edit
                                            </button>
                                        )}
                                    </div>
                                    {profileError && (
                                        <div className="bg-red-50 text-red-600 p-3 text-sm mb-6 border border-red-100 flex items-center gap-2">
                                            <span>⚠️</span> {profileError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400 block mb-1">First Name</label>
                                            {isEditingProfile ? (
                                                <input
                                                    type="text"
                                                    className="w-full border-b border-gray-300 py-1 focus:outline-none focus:border-[#c5a059]"
                                                    value={profileForm.firstName}
                                                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                                />
                                            ) : (
                                                <p className="text-sm font-medium">{customer.firstName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400 block mb-1">Last Name</label>
                                            {isEditingProfile ? (
                                                <input
                                                    type="text"
                                                    className="w-full border-b border-gray-300 py-1 focus:outline-none focus:border-[#c5a059]"
                                                    value={profileForm.lastName}
                                                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                                />
                                            ) : (
                                                <p className="text-sm font-medium">{customer.lastName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400 block mb-1">Email</label>
                                            <p className="text-sm font-medium text-gray-500">{customer.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400 block mb-1">Phone</label>
                                            {isEditingProfile ? (
                                                <input
                                                    type="text"
                                                    className="w-full border-b border-gray-300 py-1 focus:outline-none focus:border-[#c5a059]"
                                                    value={profileForm.phone}
                                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                />
                                            ) : (
                                                <p className="text-sm font-medium">{customer.phone || "N/A"}</p>
                                            )}
                                        </div>
                                    </div>

                                    {isEditingProfile && (
                                        <div className="mt-8 flex gap-4">
                                            <button
                                                disabled={isSavingProfile}
                                                onClick={handleSaveProfile}
                                                className="bg-[#1a1a1a] text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-[#333] flex items-center gap-2"
                                            >
                                                {isSavingProfile ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Save Changes
                                            </button>
                                            <button
                                                onClick={() => setIsEditingProfile(false)}
                                                className="border border-gray-200 text-gray-500 px-6 py-2 text-xs uppercase tracking-widest hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* --- ORDERS TAB --- */}
                            {activeTab === "orders" && (
                                <section className="space-y-4">
                                    <h3 className="font-serif text-2xl italic mb-6">Order History</h3>
                                    {customer.orders?.edges.length === 0 ? (
                                        <p className="text-sm text-gray-500">No orders found.</p>
                                    ) : (
                                        customer.orders.edges.map(({ node: order }) => (
                                            <div
                                                key={order.orderNumber}
                                                onClick={() => {
                                                    // Prepare order data for confirmation page
                                                    const orderData = {
                                                        orderNumber: order.orderNumber,
                                                        date: order.processedAt,
                                                        total: parseFloat(order.totalPrice.amount),
                                                        subtotal: parseFloat(order.subtotalPrice?.amount || order.totalPrice.amount),
                                                        tax: 0,
                                                        items: order.lineItems?.edges?.map(({ node: item }) => ({
                                                            title: item.title,
                                                            quantity: item.quantity,
                                                            price: parseFloat(item.originalTotalPrice?.amount || 0) / item.quantity,
                                                            image: item.variant?.image?.url || item.image?.url || '/api/placeholder/80/80'
                                                        })) || [],
                                                        customer: {
                                                            firstName: customer.firstName,
                                                            lastName: customer.lastName,
                                                            email: customer.email,
                                                            phone: customer.phone,
                                                            address1: order.shippingAddress?.address1 || customer.defaultAddress?.address1 || '',
                                                            city: order.shippingAddress?.city || customer.defaultAddress?.city || '',
                                                            zip: order.shippingAddress?.zip || customer.defaultAddress?.zip || ''
                                                        },
                                                        paymentMethod: 'card'
                                                    };

                                                    // Store in sessionStorage
                                                    sessionStorage.setItem('lastOrder', JSON.stringify(orderData));

                                                    // Navigate to order confirmation page
                                                    router.push('/order-confirmation');
                                                }}
                                                className="bg-white p-6 border border-gray-100 flex justify-between cursor-pointer hover:border-[#c5a059] hover:shadow-md transition-all group"
                                            >
                                                <div>
                                                    <p className="text-[10px] text-[#c5a059] uppercase tracking-widest">{order.fulfillmentStatus}</p>
                                                    <p className="text-sm uppercase group-hover:text-[#c5a059] transition-colors">Order #{order.orderNumber}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(order.processedAt).toLocaleDateString()}</p>
                                                </div>
                                                <p className="font-serif">{order.totalPrice.amount} {order.totalPrice.currencyCode}</p>
                                            </div>
                                        ))
                                    )}
                                </section>
                            )}

                            {/* --- ADDRESS TAB --- */}
                            {activeTab === "address" && (
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Add New Button */}
                                    <div
                                        onClick={() => openAddressModal()}
                                        className="bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 min-h-[160px] cursor-pointer hover:border-[#c5a059] hover:bg-white transition-all group"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-[#c5a059] group-hover:text-[#c5a059] transition-all mb-3">
                                            <Plus size={20} />
                                        </div>
                                        <p className="text-xs uppercase tracking-widest text-gray-500 group-hover:text-[#c5a059]">Add New Address</p>
                                    </div>

                                    {/* Address List */}
                                    {customer.addresses?.map((addr) => (
                                        <div key={addr.id} className={`bg-white p-6 border relative group transition-all ${addr.id === customer.defaultAddress?.id ? "border-[#c5a059]" : "border-gray-100 hover:border-gray-300"}`}>
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openAddressModal(addr)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-[#c5a059]"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>

                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className={`text-[10px] uppercase tracking-widest font-bold ${addr.id === customer.defaultAddress?.id ? "text-[#c5a059]" : "text-gray-400"}`}>
                                                    {addr.id === customer.defaultAddress?.id ? "Default Address" : "Address"}
                                                </h4>
                                                {addr.id !== customer.defaultAddress?.id && (
                                                    <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#c5a059] underline opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Set as Default
                                                    </button>
                                                )}
                                            </div>

                                            <p className="text-sm font-medium mb-1">{addr.firstName} {addr.lastName}</p>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {addr.address1}<br />
                                                {addr.city}, {addr.zip}<br />
                                                {addr.country}
                                            </p>
                                            {addr.phone && <p className="text-xs text-gray-400 mt-2">{addr.phone}</p>}
                                        </div>
                                    ))}
                                </section>
                            )}
                        </main>
                    </div>
                </div>
            </div>

            {/* Address Modal Overlay */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg shadow-xl p-8 relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setIsAddressModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20} /></button>
                        <h3 className="font-serif text-2xl italic mb-6">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>

                        {addressError && (
                            <div className="bg-red-50 text-red-600 p-3 text-sm mb-4 border border-red-100 rounded">
                                ⚠️ {addressError}
                            </div>
                        )}

                        <form onSubmit={handleSaveAddress} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-[10px] uppercase text-gray-400 block mb-1">First Name</label>
                                <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#c5a059]" required
                                    value={addressForm.firstName} onChange={e => setAddressForm({ ...addressForm, firstName: e.target.value })} />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-[10px] uppercase text-gray-400 block mb-1">Last Name</label>
                                <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#c5a059]" required
                                    value={addressForm.lastName} onChange={e => setAddressForm({ ...addressForm, lastName: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase text-gray-400 block mb-1">Address</label>
                                <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#c5a059]" required
                                    value={addressForm.address1} onChange={e => setAddressForm({ ...addressForm, address1: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] uppercase text-gray-400 block mb-1">City</label>
                                <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#c5a059]" required
                                    value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] uppercase text-gray-400 block mb-1">Zip Code</label>
                                <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#c5a059]" required
                                    value={addressForm.zip} onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase text-gray-400 block mb-1">Country</label>
                                <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#c5a059]" required
                                    value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase text-gray-400 block mb-1">Phone (Optional)</label>
                                <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#c5a059]"
                                    value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} />
                            </div>

                            <div className="col-span-2 mt-4">
                                <button type="submit" disabled={isSavingAddress} className="w-full bg-[#1a1a1a] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#333] flex justify-center items-center gap-2">
                                    {isSavingAddress ? <Loader2 className="animate-spin" size={16} /> : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}