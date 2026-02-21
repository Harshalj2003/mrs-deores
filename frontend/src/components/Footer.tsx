import React, { useEffect, useState } from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface SiteSettings {
    contact_address?: string;
    contact_email?: string;
    contact_phone?: string;
    social_facebook?: string;
    social_instagram?: string;
    social_linkedin?: string;
    social_twitter?: string;
}

const Footer: React.FC = () => {
    const { t } = useLanguage();
    const [settings, setSettings] = useState<SiteSettings>({
        contact_address: 'Plot No. 21, ZP Colony, Near Dutt Mandir Chowk, Deopur, Dhule 424005',
        contact_email: 'contact@mrsdeore.com',
        contact_phone: '+91 98765 43210',
    });

    useEffect(() => {
        api.get('/settings').then(res => {
            setSettings(res.data);
        }).catch(() => {/* Use defaults on error */ });
    }, []);

    const socialLinks = [
        { icon: Facebook, key: 'social_facebook', label: 'Facebook' },
        { icon: Instagram, key: 'social_instagram', label: 'Instagram' },
        { icon: Linkedin, key: 'social_linkedin', label: 'LinkedIn' },
        { icon: Twitter, key: 'social_twitter', label: 'Twitter' },
    ];

    return (
        <footer className="bg-neutral-800 text-white pt-16 pb-8 mt-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                {/* Contact Info — Dynamic from Admin Settings */}
                <div className="space-y-4">
                    <h3 className="text-xl font-serif font-black mb-6 border-b-2 border-primary w-fit pb-2">{t('contactUs')}</h3>
                    {settings.contact_address && (
                        <div className="flex items-start gap-3 text-gray-400 text-sm">
                            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <p>{settings.contact_address}</p>
                        </div>
                    )}
                    {settings.contact_email && (
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                            <a href={`mailto:${settings.contact_email}`} className="hover:text-primary transition-colors">{settings.contact_email}</a>
                        </div>
                    )}
                    {settings.contact_phone && (
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                            <a href={`tel:${settings.contact_phone}`} className="hover:text-primary transition-colors">{settings.contact_phone}</a>
                        </div>
                    )}
                </div>

                {/* Collections */}
                <div>
                    <h3 className="text-xl font-serif font-black mb-6 border-b-2 border-primary w-fit pb-2">{t('categories')}</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/category/1" className="hover:text-primary transition-colors">Season Special</Link></li>
                        <li><Link to="/category/2" className="hover:text-primary transition-colors">Instant Food</Link></li>
                        <li><Link to="/category/3" className="hover:text-primary transition-colors">Millet Superfood</Link></li>
                        <li><Link to="/category/4" className="hover:text-primary transition-colors">Organic Foodgrain</Link></li>
                    </ul>
                </div>

                {/* Information */}
                <div>
                    <h3 className="text-xl font-serif font-black mb-6 border-b-2 border-primary w-fit pb-2">{t('quickLinks')}</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><Link to="/about" className="hover:text-primary transition-colors">{t('aboutUs')} &amp; Our Story</Link></li>
                        <li><Link to="/custom-order" className="hover:text-primary transition-colors">{t('customOrder')}</Link></li>
                        <li><Link to="/terms" className="hover:text-primary transition-colors">{t('terms')}</Link></li>
                        <li><Link to="/refund" className="hover:text-primary transition-colors">{t('refund')}</Link></li>
                    </ul>
                </div>

                {/* Social — Dynamic */}
                <div>
                    <h3 className="text-xl font-serif font-black mb-6 border-b-2 border-primary w-fit pb-2">Connect</h3>
                    <div className="flex flex-wrap gap-3 mb-8">
                        {socialLinks.map(({ icon: Icon, key, label }) => {
                            const href = settings[key as keyof SiteSettings];
                            if (!href) return null;
                            return (
                                <a
                                    key={key}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={label}
                                    className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary text-white transition-all transform hover:-translate-y-1"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            );
                        })}
                        {!socialLinks.some(l => settings[l.key as keyof SiteSettings]) && (
                            <p className="text-xs text-gray-600">Social links coming soon.</p>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Subscribe for latest updates &amp; offers.</p>
                    <div className="flex">
                        <input type="email" placeholder="Your Email" className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-full" />
                        <button className="bg-primary text-white px-4 py-2 rounded-r-lg text-sm font-bold hover:bg-accent transition-colors">GO</button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Copyright © {new Date().getFullYear()}. {t('rightsReserved')}
                </p>
                <p className="text-xs font-serif text-gray-400">
                    Made with ❤️ by <span className="text-primary font-bold">MRS. DEORE PREMIX</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
