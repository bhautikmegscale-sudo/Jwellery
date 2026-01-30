"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, X, CheckCircle, Sparkles } from 'lucide-react';
import { authClient } from '@/lib/authClient';
import { useRouter } from 'next/navigation';

export default function PremiumAuthModal({ isOpen, onClose }) {
  const router = useRouter();

  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await authClient.sendOTP(email);
      setSuccessMsg(res.message);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authClient.verifyOTP(email, otp);
      onClose();
      router.push('/profile');
    } catch (err) {
      setError(err.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setError('');
    setSuccessMsg('');
    onClose();
  };
  useEffect(() => {
    if (isOpen) {
      // Lock scroll
      document.body.style.overflow = "hidden";
    } else {
      // Unlock scroll
      document.body.style.overflow = "auto";
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);


  if (!isOpen) return null;



  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-[9999] p-2 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-black transition-all shadow-lg"
            >

              <X size={20} className='cursor-pointer' />
            </button>

            <div className=" flex flex-col md:flex-row min-h-[500px]">
              {/* LEFT SIDE - IMAGE */}
              <div className="relative w-full md:w-1/2 bg-black overflow-hidden z-0">

                <img
                  src="/6cb19ba340c5c0dddc6cdbf974e2806f.jpg"
                  alt="Jewelry"
                  className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-80"
                />

                {/* Overlay Content */}
                <div className="hidden md:block relative z-10 h-full flex items-center justify-center p-8 text-white">
                  <div className="text-center space-y-6">

                    <h1 className="text-6xl md:text-7xl font-serif italic tracking-[0.15em]">
                      AURUM
                    </h1>

                    <div className="w-24 h-[1px] bg-white/60 mx-auto"></div>

                    <p className="text-sm uppercase tracking-[0.4em] text-white/80">
                      Fine Jewellery House
                    </p>

                  </div>
                </div>


                {/* Decorative Pattern Overlay */}
                <div className="absolute inset-0 bg-black/20"></div>
              </div>

              {/* RIGHT SIDE - FORM */}
              <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-[#faf9f6]">
                <div className="max-w-md mx-auto w-full">
                  {/* Email Step */}
                  {step === 'email' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h3 className="text-2xl font-serif italic text-[#1a1a1a] mb-2">Sign In</h3>
                      <p className="text-gray-500 mb-6 text-sm">Enter your email to receive a one-time code</p>

                      <form onSubmit={handleSendOtp} className="space-y-6">
                        <div className="group">
                          <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#c5a059] transition-colors" size={20} />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@example.com"
                              required
                              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:border-[#c5a059] outline-none transition-all text-sm bg-white"
                            />
                          </div>
                        </div>

                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#1a1a1a] text-white py-4 text-sm uppercase tracking-widest font-bold hover:bg-[#c5a059] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />
                              Sending...
                            </>
                          ) : (
                            <>
                              Continue
                              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </form>

                      <p className="text-xs text-gray-400 text-center mt-6">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </motion.div>
                  )}

                  {/* OTP Step */}
                  {step === 'otp' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h3 className="text-2xl font-serif italic text-[#1a1a1a] mb-2">Verify Code</h3>
                      <p className="text-gray-500 mb-6 text-sm">
                        We sent a 6-digit code to <span className="font-medium text-[#1a1a1a]">{email}</span>
                      </p>

                      {successMsg && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm mb-6 flex items-center gap-2">
                          <CheckCircle size={18} />
                          <span>{successMsg}</span>
                        </div>
                      )}

                      <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="group">
                          <label className="text-xs uppercase tracking-widest text-gray-400 mb-2 block">
                            Verification Code
                          </label>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            required
                            maxLength={6}
                            className="w-full px-4 py-4 border-2 border-gray-200 focus:border-[#c5a059] outline-none transition-all text-center text-2xl tracking-[0.5em] font-bold bg-white"
                          />
                        </div>

                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isLoading || otp.length !== 6}
                          className="w-full bg-[#1a1a1a] text-white py-4 text-sm uppercase tracking-widest font-bold hover:bg-[#c5a059] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="animate-spin" size={18} />
                              Verifying...
                            </>
                          ) : (
                            'Verify & Sign In'
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStep('email');
                            setOtp('');
                            setError('');
                          }}
                          className="w-full text-sm text-gray-500 hover:text-[#c5a059] transition-colors"
                        >
                          ← Back to email
                        </button>
                      </form>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}