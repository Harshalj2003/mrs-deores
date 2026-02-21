import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import {
    Save, Loader2, AlertCircle, CheckCircle2,
    Megaphone, Store, Truck, Eye, Palette, Phone,
    Facebook, Instagram, Linkedin, Twitter, BookOpen, Plus, Trash2, Image as ImageIcon
} from 'lucide-react';
import api from '../services/api';

type Settings = Record<string, string>;

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label?: string }> = ({ value, onChange, label }) => (
    <div className="flex items-center gap-3">
        <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${value ? 'bg-primary' : 'bg-gray-300'}`}
        >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        {label && <span className="text-sm text-gray-600 font-medium">{label}</span>}
    </div>
);

const SectionCard: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
        </div>
        <div className="p-8">{children}</div>
    </section>
);

const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-black text-gray-600 uppercase tracking-widest">{label}</label>
        {children}
        {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
);

const Input: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; type?: string }> = ({ value, onChange, placeholder, type = 'text' }) => (
    <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-colors"
    />
);

const AdminSettings: React.FC = () => {
    const [settings, setSettings] = useState<Settings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [chapters, setChapters] = useState<{ id: string; title: string; description: string; imageUrl: string; videoUrl: string }[]>([]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const set = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));
    const get = (key: string, fallback = '') => settings[key] ?? fallback;
    const getBool = (key: string, fallback = 'true') => (settings[key] ?? fallback) === 'true';
    const setBool = (key: string, v: boolean) => set(key, v ? 'true' : 'false');

    useEffect(() => {
        api.get('/settings').then(res => {
            setSettings(res.data || {});
            try { if (res.data.story_chapters) setChapters(JSON.parse(res.data.story_chapters)); } catch { /**/ }
        }).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...settings, story_chapters: JSON.stringify(chapters) };
            await api.patch('/settings', payload);
            showToast('All settings saved successfully!');
        } catch (e: any) {
            showToast(e?.response?.data?.message || 'Save failed. Please try again.', 'error');
        }
        setSaving(false);
    };

    const addChapter = () => setChapters(prev => [...prev, { id: Date.now().toString(), title: '', description: '', imageUrl: '', videoUrl: '' }]);
    const removeChapter = (id: string) => setChapters(prev => prev.filter(c => c.id !== id));
    const updateChapter = (id: string, field: string, value: string) =>
        setChapters(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

    if (loading) return (
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--admin-page-bg)' }}>
            <AdminSidebar />
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen font-sans" style={{ backgroundColor: 'var(--admin-page-bg)' }}>
            <AdminSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                <div className="max-w-4xl mx-auto">

                    {/* Toast */}
                    {toast && (
                        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                            {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {toast.msg}
                        </div>
                    )}

                    <header className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900 font-serif mb-2">⚙️ Website Control Room</h1>
                        <p className="text-gray-500">Full control of your website — customize, configure, and control everything from here.</p>
                    </header>

                    <div className="space-y-6">

                        {/* 1. Store General */}
                        <SectionCard icon={<Store className="h-5 w-5" />} title="Store Information" subtitle="Name, tagline, currency, and branding">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Store Name"><Input value={get('store_name')} onChange={v => set('store_name', v)} placeholder="Mrs. Deore's Premix" /></Field>
                                <Field label="Currency Symbol"><Input value={get('store_currency', '₹')} onChange={v => set('store_currency', v)} placeholder="₹" /></Field>
                                <Field label="Store Tagline" hint="Appears in hero and About page">
                                    <Input value={get('store_tagline')} onChange={v => set('store_tagline', v)} placeholder="Authentic Homemade Tradition..." />
                                </Field>
                                <Field label="Store Logo URL"><Input value={get('store_logo_url')} onChange={v => set('store_logo_url', v)} placeholder="https://..." /></Field>
                            </div>
                        </SectionCard>

                        {/* 2. Announcement Bar */}
                        <SectionCard icon={<Megaphone className="h-5 w-5" />} title="Announcement Bar" subtitle="Top banner across the website">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-4 bg-neutral-light/50 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Enable Announcement Bar</p>
                                        <p className="text-xs text-gray-400">Show the top strip across all pages</p>
                                    </div>
                                    <Toggle value={getBool('announcement_enabled')} onChange={v => setBool('announcement_enabled', v)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Announcement Text">
                                        <Input value={get('announcement_text')} onChange={v => set('announcement_text', v)} placeholder="FREE DELIVERY FOR ALL PRODUCTS 🎉" />
                                    </Field>
                                    <Field label="Link URL (optional)">
                                        <Input value={get('announcement_link')} onChange={v => set('announcement_link', v)} placeholder="https://... or /products" />
                                    </Field>
                                    <Field label="Background Color">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={get('announcement_bg_color', '#C2410C')}
                                                onChange={e => set('announcement_bg_color', e.target.value)}
                                                className="h-10 w-14 rounded-xl border border-gray-200 cursor-pointer"
                                            />
                                            <Input value={get('announcement_bg_color', '#C2410C')} onChange={v => set('announcement_bg_color', v)} placeholder="#C2410C" />
                                        </div>
                                    </Field>
                                </div>
                            </div>
                        </SectionCard>

                        {/* 3. Delivery Settings */}
                        <SectionCard icon={<Truck className="h-5 w-5" />} title="Delivery Configuration" subtitle="Free delivery threshold and charges">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-4 bg-neutral-light/50 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Enable Delivery</p>
                                        <p className="text-xs text-gray-400">Disable if store is pickup-only</p>
                                    </div>
                                    <Toggle value={getBool('delivery_enabled')} onChange={v => setBool('delivery_enabled', v)} />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <Field label="Free Above (₹)" hint="Orders above this get free delivery">
                                        <Input type="number" value={get('delivery_free_above', '499')} onChange={v => set('delivery_free_above', v)} placeholder="499" />
                                    </Field>
                                    <Field label="Delivery Charge (₹)" hint="Charged when below the free threshold">
                                        <Input type="number" value={get('delivery_charge', '50')} onChange={v => set('delivery_charge', v)} placeholder="50" />
                                    </Field>
                                </div>
                            </div>
                        </SectionCard>

                        {/* 4. Feature Visibility */}
                        <SectionCard icon={<Eye className="h-5 w-5" />} title="Feature Visibility" subtitle="Toggle website sections on or off">
                            <div className="space-y-4">
                                {[
                                    { key: 'feature_custom_order', label: 'Custom Order', desc: 'Show the Custom Order form and nav link' },
                                    { key: 'feature_wishlist', label: 'Wishlist', desc: 'Allow customers to save products to wishlist' },
                                    { key: 'feature_reviews', label: 'Product Reviews', desc: 'Show customer reviews on product pages' },
                                    { key: 'feature_bulk_pricing', label: 'Bulk Pricing', desc: 'Show bulk pricing tiers on product pages' },
                                ].map(({ key, label, desc }) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-neutral-light/50 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{label}</p>
                                            <p className="text-xs text-gray-400">{desc}</p>
                                        </div>
                                        <Toggle value={getBool(key)} onChange={v => setBool(key, v)} />
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* 5. Theme & Appearance */}
                        <SectionCard icon={<Palette className="h-5 w-5" />} title="Theme & Appearance" subtitle="Brand colors and hero section customization">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Primary Brand Color">
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={get('theme_primary_color', '#C2410C')} onChange={e => set('theme_primary_color', e.target.value)} className="h-10 w-14 rounded-xl border border-gray-200 cursor-pointer" />
                                        <Input value={get('theme_primary_color', '#C2410C')} onChange={v => set('theme_primary_color', v)} />
                                    </div>
                                </Field>
                                <Field label="Secondary / Gold Color">
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={get('theme_secondary_color', '#EAB308')} onChange={e => set('theme_secondary_color', e.target.value)} className="h-10 w-14 rounded-xl border border-gray-200 cursor-pointer" />
                                        <Input value={get('theme_secondary_color', '#EAB308')} onChange={v => set('theme_secondary_color', v)} />
                                    </div>
                                </Field>
                                <Field label="Hero Title" hint="Main homepage heading">
                                    <Input value={get('theme_hero_title', 'Authentic Homemade')} onChange={v => set('theme_hero_title', v)} />
                                </Field>
                                <Field label="Hero Subtitle">
                                    <Input value={get('theme_hero_subtitle', 'Tradition in every bite')} onChange={v => set('theme_hero_subtitle', v)} />
                                </Field>
                                <Field label="Hero Background Image URL" hint="Replaces default hero section background">
                                    <Input value={get('theme_hero_image_url')} onChange={v => set('theme_hero_image_url', v)} placeholder="https://..." />
                                </Field>
                            </div>
                        </SectionCard>

                        {/* 6. Contact Information */}
                        <SectionCard icon={<Phone className="h-5 w-5" />} title="Contact Information" subtitle="Shown in the website footer">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Email Address"><Input value={get('contact_email')} onChange={v => set('contact_email', v)} placeholder="contact@mrsdeore.com" /></Field>
                                <Field label="Phone Number"><Input value={get('contact_phone')} onChange={v => set('contact_phone', v)} placeholder="+91 98765 43210" /></Field>
                                <div className="md:col-span-2">
                                    <Field label="Full Address">
                                        <textarea value={get('contact_address')} onChange={e => set('contact_address', e.target.value)} rows={2} placeholder="Plot No. 21, ZP Colony, Dhule 424005" className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
                                    </Field>
                                </div>
                            </div>
                        </SectionCard>

                        {/* 6.1 WhatsApp Support */}
                        <SectionCard icon={<Phone className="h-5 w-5 text-green-500" />} title="WhatsApp Support Chatbot" subtitle="Floating support button settings">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-neutral-light/50 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Enable WhatsApp Button</p>
                                        <p className="text-xs text-gray-400">Show the floating chat button on all pages</p>
                                    </div>
                                    <Toggle value={getBool('whatsapp_enabled')} onChange={v => setBool('whatsapp_enabled', v)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="WhatsApp Number" hint="Include country code (e.g., 919876543210)">
                                        <Input value={get('whatsapp_number', '918459424840')} onChange={v => set('whatsapp_number', v)} placeholder="918459424840" />
                                    </Field>
                                    <Field label="Initial Message" hint="Default text when user clicks">
                                        <Input value={get('whatsapp_message', "Hello Mrs. Deores! I'm interested in your traditions. Could you help me with my order?")} onChange={v => set('whatsapp_message', v)} />
                                    </Field>
                                    <Field label="Button Position">
                                        <div className="flex gap-2">
                                            {[['left', 'Bottom Left'], ['right', 'Bottom Right']].map(([val, label]) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => set('whatsapp_position', val)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${get('whatsapp_position', 'left') === val ? 'bg-primary text-white' : 'bg-neutral-light/50 text-gray-600'}`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field label="Button Size">
                                        <div className="flex gap-2">
                                            {[['sm', 'Small'], ['md', 'Medium'], ['lg', 'Large']].map(([val, label]) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => set('whatsapp_size', val)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${get('whatsapp_size', 'md') === val ? 'bg-primary text-white' : 'bg-neutral-light/50 text-gray-600'}`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                </div>
                            </div>
                        </SectionCard>

                        {/* 7. Social Media Links */}
                        <SectionCard icon={<Facebook className="h-5 w-5" />} title="Social Media Links" subtitle="URLs shown as social icons in footer">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    { key: 'social_facebook', label: 'Facebook', icon: <Facebook className="h-4 w-4 text-blue-600" />, placeholder: 'https://facebook.com/page' },
                                    { key: 'social_instagram', label: 'Instagram', icon: <Instagram className="h-4 w-4 text-pink-500" />, placeholder: 'https://instagram.com/page' },
                                    { key: 'social_linkedin', label: 'LinkedIn', icon: <Linkedin className="h-4 w-4 text-blue-700" />, placeholder: 'https://linkedin.com/company/...' },
                                    { key: 'social_twitter', label: 'Twitter / X', icon: <Twitter className="h-4 w-4" />, placeholder: 'https://twitter.com/...' },
                                ].map(({ key, label, icon, placeholder }) => (
                                    <Field key={key} label={label}>
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden bg-neutral-light/50">
                                            <div className="px-3 py-3 border-r border-gray-200">{icon}</div>
                                            <input type="url" value={get(key)} onChange={e => set(key, e.target.value)} placeholder={placeholder} className="flex-1 py-3 pr-3 bg-transparent outline-none text-sm" />
                                        </div>
                                    </Field>
                                ))}
                            </div>
                        </SectionCard>

                        {/* 8. Our Story / About Section */}
                        <SectionCard icon={<BookOpen className="h-5 w-5" />} title="Our Story & About Page" subtitle="Controls the public /about page content">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Page Title"><Input value={get('story_title', 'Our Story')} onChange={v => set('story_title', v)} /></Field>
                                    <Field label="Tagline"><Input value={get('story_tagline')} onChange={v => set('story_tagline', v)} placeholder="Made with love..." /></Field>
                                </div>
                                <Field label="Main Description">
                                    <textarea value={get('story_description')} onChange={e => set('story_description', e.target.value)} rows={4} placeholder="Tell the story of your brand..." className="w-full px-4 py-3 bg-neutral-light/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
                                </Field>

                                {/* Story Chapters */}
                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Story Chapters</p>
                                        <button onClick={addChapter} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors">
                                            <Plus className="h-3 w-3" /> Add Chapter
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {chapters.map((chapter, idx) => (
                                            <div key={chapter.id} className="p-5 bg-neutral-light/50 rounded-2xl border border-gray-200 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Chapter {idx + 1}</span>
                                                    <button onClick={() => removeChapter(chapter.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Field label="Chapter Title">
                                                        <input value={chapter.title} onChange={e => updateChapter(chapter.id, 'title', e.target.value)} placeholder="How it all started..." className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
                                                    </Field>
                                                    <Field label="Image URL">
                                                        <div className="flex items-center gap-2">
                                                            <ImageIcon className="h-4 w-4 text-gray-300 flex-shrink-0" />
                                                            <input value={chapter.imageUrl} onChange={e => updateChapter(chapter.id, 'imageUrl', e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
                                                        </div>
                                                    </Field>
                                                </div>
                                                <Field label="Description">
                                                    <textarea value={chapter.description} onChange={e => updateChapter(chapter.id, 'description', e.target.value)} rows={2} placeholder="What happened in this chapter..." className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm resize-none" />
                                                </Field>
                                                <Field label="Video URL (optional)">
                                                    <input value={chapter.videoUrl} onChange={e => updateChapter(chapter.id, 'videoUrl', e.target.value)} placeholder="https://youtube.com/..." className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm" />
                                                </Field>
                                            </div>
                                        ))}
                                        {chapters.length === 0 && (
                                            <div className="text-center py-10 text-gray-400 text-sm">
                                                No story chapters yet. Click "Add Chapter" to begin your journey narrative.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* 9. Grid View Customizer */}
                        <SectionCard
                            icon={<span className="text-lg">⊞</span>}
                            title="Grid View Customizer"
                            subtitle="Control how categories and products are shown on mobile & desktop"
                        >
                            <div className="space-y-8">
                                {/* Category Grid */}
                                <div className="space-y-4">
                                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Category Grid</p>
                                    <div className="grid grid-cols-2 gap-5">
                                        <Field label="Mobile Columns" hint="📱 Most users are on mobile!">
                                            <div className="flex gap-2 flex-wrap">
                                                {['1', '2', '3'].map(n => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        onClick={() => set('grid_categories_mobile', n)}
                                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${get('grid_categories_mobile', '2') === n ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-neutral-light/50 text-gray-600 hover:bg-primary/10'}`}
                                                    >
                                                        {n} col
                                                    </button>
                                                ))}
                                            </div>
                                        </Field>
                                        <Field label="Desktop Columns" hint="🖥 For desktop/tablet users">
                                            <div className="flex gap-2 flex-wrap">
                                                {['2', '3', '4', '5', '6'].map(n => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        onClick={() => set('grid_categories_desktop', n)}
                                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${get('grid_categories_desktop', '4') === n ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-neutral-light/50 text-gray-600 hover:bg-primary/10'}`}
                                                    >
                                                        {n} col
                                                    </button>
                                                ))}
                                            </div>
                                        </Field>
                                    </div>
                                    {/* Live Preview — Category */}
                                    <div className="p-4 bg-neutral-light/50 rounded-2xl border border-gray-200">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Live Preview — Mobile ({get('grid_categories_mobile', '2')} cols)</p>
                                        <div
                                            className="gap-3 grid"
                                            style={{ gridTemplateColumns: `repeat(${get('grid_categories_mobile', '2')}, minmax(0, 1fr))` }}
                                        >
                                            {Array.from({ length: parseInt(get('grid_categories_mobile', '2')) * 2 }).map((_, i) => (
                                                <div key={i} className="bg-primary/10 rounded-xl aspect-square flex items-center justify-center text-primary/30 font-black text-xs">
                                                    Cat {i + 1}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Product Grid */}
                                <div className="space-y-4">
                                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest">Product Grid</p>
                                    <div className="grid grid-cols-2 gap-5">
                                        <Field label="Mobile Columns" hint="📱 Most users are on mobile!">
                                            <div className="flex gap-2 flex-wrap">
                                                {['1', '2'].map(n => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        onClick={() => set('grid_products_mobile', n)}
                                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${get('grid_products_mobile', '2') === n ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-neutral-light/50 text-gray-600 hover:bg-secondary/10'}`}
                                                    >
                                                        {n} col
                                                    </button>
                                                ))}
                                            </div>
                                        </Field>
                                        <Field label="Desktop Columns" hint="🖥 For desktop/tablet users">
                                            <div className="flex gap-2 flex-wrap">
                                                {['2', '3', '4'].map(n => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        onClick={() => set('grid_products_desktop', n)}
                                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${get('grid_products_desktop', '3') === n ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-neutral-light/50 text-gray-600 hover:bg-secondary/10'}`}
                                                    >
                                                        {n} col
                                                    </button>
                                                ))}
                                            </div>
                                        </Field>
                                    </div>
                                    {/* Live Preview — Products */}
                                    <div className="p-4 bg-neutral-light/50 rounded-2xl border border-gray-200">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Live Preview — Mobile ({get('grid_products_mobile', '2')} cols)</p>
                                        <div
                                            className="gap-3 grid"
                                            style={{ gridTemplateColumns: `repeat(${get('grid_products_mobile', '2')}, minmax(0, 1fr))` }}
                                        >
                                            {Array.from({ length: parseInt(get('grid_products_mobile', '2')) * 2 }).map((_, i) => (
                                                <div key={i} className="bg-secondary/15 rounded-xl overflow-hidden">
                                                    <div className="aspect-square bg-secondary/20 flex items-center justify-center text-secondary/40 font-black text-xs">IMG</div>
                                                    <div className="p-2">
                                                        <div className="h-2 bg-gray-200 rounded-full w-3/4 mb-1" />
                                                        <div className="h-2 bg-primary/20 rounded-full w-1/2" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Branding Controls */}
                        <SectionCard
                            icon={<Eye className="h-4 w-4" />}
                            title="Branding Controls"
                            subtitle="Control logo size, web name and tagline visibility, and hero section"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Field label="Logo Size" hint="Controls the header logo's displayed size">
                                    <div className="flex gap-2">
                                        {[['sm', 'Small'], ['md', 'Medium'], ['lg', 'Large']].map(([val, label]) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => set('brand_logo_size', val)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${get('brand_logo_size', 'md') === val ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-neutral-light/50 text-gray-600 hover:bg-primary/10'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </Field>

                                <Field label="Announcement Bar" hint="Enable in the Announcement section to show a top banner">
                                    <Toggle
                                        value={get('announce_enabled', 'false') === 'true'}
                                        onChange={v => set('announce_enabled', v ? 'true' : 'false')}
                                        label="Show Announcement Bar"
                                    />
                                </Field>

                                <Field label="Web Name Visibility" hint="Show or hide store name text next to logo">
                                    <Toggle
                                        value={get('brand_show_webname', 'true') !== 'false'}
                                        onChange={v => set('brand_show_webname', v ? 'true' : 'false')}
                                        label="Show Store Name"
                                    />
                                </Field>

                                <Field label="Tagline Visibility" hint="Show or hide the store tagline in the hero">
                                    <Toggle
                                        value={get('brand_show_tagline', 'true') !== 'false'}
                                        onChange={v => set('brand_show_tagline', v ? 'true' : 'false')}
                                        label="Show Tagline"
                                    />
                                </Field>

                                <Field label="Hero Section" hint="Show or hide the full hero on the home page">
                                    <Toggle
                                        value={get('brand_hero_enabled', 'true') !== 'false'}
                                        onChange={v => set('brand_hero_enabled', v ? 'true' : 'false')}
                                        label="Enable Hero Section"
                                    />
                                </Field>
                            </div>
                        </SectionCard>

                        {/* Save Button */}
                        <div className="flex justify-end py-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg shadow-primary/20 disabled:opacity-70 text-sm"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {saving ? 'Saving...' : 'Save All Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;
