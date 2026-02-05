"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Truck,
  Loader2,
} from "lucide-react";

import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedOrder = sessionStorage.getItem("lastOrder");

    if (storedOrder) {
      setOrderData(JSON.parse(storedOrder));
    } else {
      router.push("/");
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <Loader2 size={40} className="animate-spin text-[#c5a059]" />
      </div>
    );
  }

  if (!orderData) return null;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getEstimatedDelivery = () => {
    const start = new Date();
    start.setDate(start.getDate() + 5);

    const end = new Date();
    end.setDate(end.getDate() + 7);

    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  return (
    <>
      <Navbar2 />

      <div className="min-h-screen bg-[#faf9f6] py-24 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-3xl mx-auto">

          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <CheckCircle className="text-emerald-600 w-16 h-16 stroke-[1.5]" />
            </div>
            <h1 className="text-4xl font-serif text-[#1a1a1a] mb-2">
              Thank you for your order
            </h1>
            <p className="text-gray-600">
              We've received your order and are preparing it with care.
            </p>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">

            {/* Order Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  Order Number
                </p>
                <p className="font-medium text-[#1a1a1a]">
                  {orderData.orderNumber}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  Date
                </p>
                <p className="font-medium text-[#1a1a1a]">
                  {formatDate(orderData.date)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  Total
                </p>
                <p className="font-medium text-[#1a1a1a]">
                  ${orderData.total.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
                  Status
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                  Processing
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <h3 className="text-lg font-serif mb-4">Order Details</h3>

              <div className="space-y-4">
                {orderData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.title}
                        className="w-16 h-16 object-cover bg-gray-100"
                      />
                      <div>
                        <p className="font-medium text-[#1a1a1a]">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-[#1a1a1a]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${orderData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="p-6 bg-[#1a1a1a] text-white">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Estimated Delivery</p>
                    <p className="text-xs text-gray-400">
                      {getEstimatedDelivery()}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  <p className="font-medium text-white mb-1">
                    Shipping Address
                  </p>
                  <p>
                    {orderData.customer.firstName}{" "}
                    {orderData.customer.lastName}
                  </p>
                  <p>{orderData.customer.address1}</p>
                  <p>
                    {orderData.customer.city},{" "}
                    {orderData.customer.zip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 text-center space-y-6">
            <p className="text-gray-500 italic">
              A confirmation email has been sent to{" "}
              {orderData.customer.email}
            </p>

            <button
              onClick={() => {
                sessionStorage.removeItem("lastOrder");
                router.push("/");
              }}
              className="px-8 py-3 bg-[#c5a059] text-white hover:bg-[#b08d4b] transition-all uppercase tracking-widest text-sm"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
