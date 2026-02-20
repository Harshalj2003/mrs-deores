import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-neutral-800 text-white pt-16 pb-8 mt-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                {/* Contact Info */}
                <div className="space-y-4">
                    <h3 className="text-xl font-serif font-black mb-6 border-b-2 border-primary w-fit pb-2">Get In Touch</h3>
                    <div className="flex items-start gap-3 text-gray-400 text-sm">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                        <p>Plot No. 21, ZP Colony, Near Dutt Mandir Chowk, Deopur, Dhule 424005</p>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                        <p>contact@mrsdeore.com</p>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                        <p>+91 98765 43210</p>
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <h3 className="text-xl font-serif font-black mb-6 border-b-2 border-primary w-fit pb-2">Collections</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/category/1" className="hover:text-primary transition-colors">Season Special</Link></li>
                        <li><Link to="/category/2" className="hover:text-primary transition-colors">Instant Food</Link></li>
                        <li><Link to="/category/3" className="hover:text-primary transition-colors">Millet Superfood</Link></li>
                        <li><Link to="/category/4" className="hover:text-primary transition-colors">Organic Foodgrain</Link></li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-xl font-serif font-black mb-6 border-b-2 border-primary w-fit pb-2">Information</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link to="/blog" className="hover:text-primary transition-colors">Recipes & Blog</Link></li>
                        <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                        <li><Link to="/refund" className="hover:text-primary transition-colors">Return & Refund</Link></li>
                    </ul>
                </div>

                {/* Social & Newsletter */}
                <div>
                    <h3 className="text-xl font-serif font-black mb-6 border-b-2 border-primary w-fit pb-2">Connect</h3>
                    <div className="flex space-x-4 mb-8">
                        <a href="#" className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary text-white transition-all transform hover:-translate-y-1">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href="#" className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary text-white transition-all transform hover:-translate-y-1">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="#" className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary text-white transition-all transform hover:-translate-y-1">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="#" className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary text-white transition-all transform hover:-translate-y-1">
                            <Twitter className="w-5 h-5" />
                        </a>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Subscribe for latest updates & offers.</p>
                    <div className="flex">
                        <input type="email" placeholder="Your Email" className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-full" />
                        <button className="bg-primary text-white px-4 py-2 rounded-r-lg text-sm font-bold hover:bg-secondary transition-colors">GO</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Copyright © 2026. All Rights Reserved
                </p>
                <p className="text-xs font-serif text-gray-400">
                    Made with ❤️ by <span className="text-primary font-bold">MRS. DEORE PREMIX</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
