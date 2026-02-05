"use client";
import Link from 'next/link';
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-stone-900 text-white pt-24 pb-12 px-10">
            <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-20 mb-20">

                <div className="md:col-span-4 space-y-10">
                    <h1 className="text-3xl font-serif tracking-[0.5em] font-bold">AURUM</h1>
                    <p className="text-stone-400 text-sm font-light leading-loose max-w-sm italic font-serif">
                        "To own an Aurum piece is to hold a fragment of eternity. We design for the stories that haven't been told yet."
                        jana gan man adhinayak jai he
bharat bhagya vidhata
panjab sindhu gujarat maratha
dravida utkal banga
vindhya himachal yamuna ganga
uchchala jaladhi taranga
tava subha name jage
tava subha ashish maange
gahe tava jaya gatha
jai he, jai he, jai he
jai he, jai he, jai he

gurubrahma gururvishnu
gurudevo maheswara
guru sakshat parabrahma
tasmai shri guruve namah
                    </p>
                    {/* <div className="flex gap-8">
                        <Instagram size={20} className="text-stone-500 hover:text-[#C5A059] cursor-pointer transition-colors" />
                        <Facebook size={20} className="text-stone-500 hover:text-[#C5A059] cursor-pointer transition-colors" />
                        <Twitter size={20} className="text-stone-500 hover:text-[#C5A059] cursor-pointer transition-colors" />
                    </div> */}
                </div>

                <div className="md:col-span-2 space-y-6">
                    <h5 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#C5A059]">Quick Links</h5>
                    <ul className="space-y-4 text-stone-400 text-sm font-light">
                        <li className="hover:text-white cursor-pointer transition-colors"><Link href="/products">Collections</Link></li>
                        <li className="hover:text-white cursor-pointer transition-colors"><Link href="/category">Category</Link></li>
                        <li className="hover:text-white cursor-pointer transition-colors"><Link href="/products">The Maison</Link></li>
                        <li className="hover:text-white cursor-pointer transition-colors"><Link href="/about-us">About Us</Link></li>
                        <li className="hover:text-white cursor-pointer transition-colors"><Link href="/contact-us">Contact Us</Link></li>
                    </ul>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <h5 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#C5A059]">Service</h5>
                    <ul className="space-y-4 text-stone-400 text-sm font-light">
                        <li className="hover:text-white cursor-pointer transition-colors">Book a Virtual Appointment</li>
                    </ul>
                </div>

                <div className="md:col-span-4 space-y-8">
                    <h5 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#C5A059]">
                        Contact Info
                    </h5>

                    <div className="space-y-3">
                        <div className="flex items-start  gap-4">
                            <MapPin size={16} className="text-stone-400 shrink-0 mt-1" />
                            <p className="text-stone-400 text-sm font-light">
                                Coventry, West Midlands,<br /> England, CV1 2BP
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Phone size={16} className="text-stone-400 shrink-0" />
                            <p className="text-stone-400 text-sm font-light">
                                +44 7700 900789
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Mail size={16} className="text-stone-400 shrink-0" />
                            <p className="text-stone-400 text-sm font-light">
                                England.concierge@aurum.in
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1500px] mx-auto pt-10 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] text-stone-600 uppercase tracking-widest font-bold">© 2026 Aurum High Jewelry • All Rights Reserved <a href='https://megascale.co.in' className='text-red-700'>@Megascale</a></p>
                {/* <div className="flex gap-10 text-[9px] uppercase tracking-widest text-stone-500 font-bold">
                    <span className="cursor-pointer hover:text-white">Privacy</span>
                    <span className="cursor-pointer hover:text-white">Legal</span>
                    <span className="cursor-pointer hover:text-white">Cookies</span>
                </div> */}
            </div>
        </footer>
    );
}
