import React, { useState, useEffect } from 'react';
import {
    Mail, Phone, Calendar, Package, MapPin, Edit3, Save, X,
    Trash2, AlertTriangle, Eye, EyeOff, Clock, Shield, CheckCircle2, Crown,
    Sparkles, FileText, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import AuthService from '../services/auth.service';
import { useTheme } from '../contexts/ThemeContext';

interface ProfileData {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    fullName: string | null;
    bio: string | null;
    profilePicUrl: string | null;
    isEmailVerified: boolean;
    accountStatus: string;
    createdAt: string | null;
    lastLoginAt: string | null;
    roles: string[];
    stats: {
        totalOrders: number;
        savedAddresses: number;
    };
}

const AccountDetails: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Edit form
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');

    // Delete
    const [showDeleteZone, setShowDeleteZone] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile/me');
            setProfile(res.data);
            setFullName(res.data.fullName || '');
            setPhone(res.data.phone || '');
            setBio(res.data.bio || '');
        } catch {
            console.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage(null);
        try {
            await api.put('/profile/me', { fullName, phone, bio });
            setSaveMessage({ type: 'success', text: 'Profile updated!' });
            setEditing(false);
            fetchProfile();
        } catch {
            setSaveMessage({ type: 'error', text: 'Failed to save changes.' });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    };

    const handleDelete = async () => {
        if (!deletePassword) {
            setDeleteError('Password is required');
            return;
        }
        setDeleting(true);
        setDeleteError('');
        try {
            await api.delete('/profile/me', { data: { password: deletePassword } });
            AuthService.logout();
            window.location.href = '/login';
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setDeleteError(error?.response?.data?.message || 'Failed to delete account.');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const timeAgo = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 30) return `${days}d ago`;
        return formatDate(dateStr);
    };

    const isAdmin = profile?.roles?.includes('ROLE_ADMIN');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="h-10 w-10 border-3 border-primary/20 border-t-primary rounded-full"
                    />
                    <p className="text-sm font-bold text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-[50vh] text-center">
                <div>
                    <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                    <p className="font-bold text-gray-600 dark:text-gray-400">Could not load profile data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ─── SECTION 1: Profile Hero ─── */}
            <div
                className="rounded-[2rem] overflow-hidden border shadow-sm"
                style={{
                    backgroundColor: isDark ? '#1a1209' : '#fffdf8',
                    borderColor: isDark ? 'rgba(194,65,12,0.15)' : 'rgba(194,65,12,0.08)'
                }}
            >
                {/* Gradient banner */}
                <div className="relative h-24 sm:h-28" style={{ background: 'linear-gradient(135deg, #C2410C, #D97706, #B45309)' }}>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                    {isAdmin && (
                        <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <Crown className="h-3 w-3" /> Administrator
                        </div>
                    )}
                </div>

                {/* Profile info */}
                <div className="px-6 sm:px-8 pb-6 -mt-10 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                        {/* Avatar */}
                        <div
                            className="h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl border-4"
                            style={{
                                background: 'linear-gradient(135deg, #C2410C, #D97706)',
                                borderColor: isDark ? '#1a1209' : '#fffdf8'
                            }}
                        >
                            {profile.username.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-black font-serif" style={{ color: isDark ? '#F0DEC8' : '#3E2723' }}>
                                {profile.fullName || profile.username}
                            </h2>
                            <p className="text-sm font-medium mt-0.5" style={{ color: isDark ? '#7D5F45' : '#8D6E63' }}>
                                @{profile.username}
                            </p>
                            {profile.bio && (
                                <p className="text-xs mt-2 leading-relaxed max-w-md" style={{ color: isDark ? '#6B5540' : '#A1887F' }}>
                                    {profile.bio}
                                </p>
                            )}
                        </div>

                        {/* Edit toggle */}
                        {!editing && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all self-start sm:self-auto"
                                style={{
                                    color: isDark ? '#D97706' : '#C2410C',
                                    backgroundColor: isDark ? 'rgba(217,119,6,0.1)' : 'rgba(194,65,12,0.08)',
                                    border: isDark ? '1px solid rgba(217,119,6,0.2)' : '1px solid rgba(194,65,12,0.15)'
                                }}
                            >
                                <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                            </motion.button>
                        )}
                    </div>

                    {/* Contact badges */}
                    <div className="flex flex-wrap gap-3 mt-5">
                        <div className="flex items-center gap-2 text-xs font-bold rounded-xl px-3 py-2"
                            style={{ backgroundColor: isDark ? 'rgba(74,45,20,0.3)' : 'rgba(194,65,12,0.05)', color: isDark ? '#A08060' : '#8D6E63' }}>
                            <Mail className="h-3.5 w-3.5" />
                            {profile.email}
                            {profile.isEmailVerified && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                        </div>
                        {profile.phone && (
                            <div className="flex items-center gap-2 text-xs font-bold rounded-xl px-3 py-2"
                                style={{ backgroundColor: isDark ? 'rgba(74,45,20,0.3)' : 'rgba(194,65,12,0.05)', color: isDark ? '#A08060' : '#8D6E63' }}>
                                <Phone className="h-3.5 w-3.5" />
                                {profile.phone}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── SECTION 2: Account Stats ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: Calendar, label: 'Member Since', value: formatDate(profile.createdAt), color: '#C2410C' },
                    { icon: Package, label: 'Total Orders', value: String(profile.stats.totalOrders), color: '#D97706' },
                    { icon: MapPin, label: 'Addresses', value: String(profile.stats.savedAddresses), color: '#B45309' },
                    { icon: Clock, label: 'Last Login', value: timeAgo(profile.lastLoginAt), color: '#92400E' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="rounded-2xl p-4 border shadow-sm text-center"
                        style={{
                            backgroundColor: isDark ? '#1a1209' : '#fffdf8',
                            borderColor: isDark ? 'rgba(194,65,12,0.12)' : 'rgba(194,65,12,0.06)'
                        }}
                    >
                        <stat.icon className="h-5 w-5 mx-auto mb-2 opacity-60" style={{ color: stat.color }} />
                        <p className="text-lg font-black font-serif" style={{ color: isDark ? '#F0DEC8' : '#3E2723' }}>
                            {stat.value}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: isDark ? '#6B5540' : '#A1887F' }}>
                            {stat.label}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* ─── SECTION 3: Edit Profile Form ─── */}
            <AnimatePresence>
                {editing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div
                            className="rounded-[2rem] border p-6 sm:p-8 shadow-sm"
                            style={{
                                backgroundColor: isDark ? '#1a1209' : '#fffdf8',
                                borderColor: isDark ? 'rgba(194,65,12,0.15)' : 'rgba(194,65,12,0.08)'
                            }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(217,119,6,0.15)' : 'rgba(194,65,12,0.1)' }}>
                                    <Edit3 className="h-4 w-4" style={{ color: isDark ? '#D97706' : '#C2410C' }} />
                                </div>
                                <h3 className="text-base font-black font-serif" style={{ color: isDark ? '#F0DEC8' : '#3E2723' }}>Edit Profile</h3>
                            </div>

                            <div className="space-y-4 max-w-lg">
                                {/* Full Name */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: isDark ? '#7D5F45' : '#8D6E63' }}>Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="Your display name"
                                        maxLength={50}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-primary/30"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(74,45,20,0.3)' : 'rgba(194,65,12,0.04)',
                                            border: isDark ? '1px solid rgba(74,45,20,0.5)' : '1px solid rgba(194,65,12,0.1)',
                                            color: isDark ? '#F0DEC8' : '#3E2723'
                                        }}
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: isDark ? '#7D5F45' : '#8D6E63' }}>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="+91 9876543210"
                                        maxLength={20}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-primary/30"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(74,45,20,0.3)' : 'rgba(194,65,12,0.04)',
                                            border: isDark ? '1px solid rgba(74,45,20,0.5)' : '1px solid rgba(194,65,12,0.1)',
                                            color: isDark ? '#F0DEC8' : '#3E2723'
                                        }}
                                    />
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block" style={{ color: isDark ? '#7D5F45' : '#8D6E63' }}>Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                        maxLength={200}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all resize-none focus:ring-2 focus:ring-primary/30"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(74,45,20,0.3)' : 'rgba(194,65,12,0.04)',
                                            border: isDark ? '1px solid rgba(74,45,20,0.5)' : '1px solid rgba(194,65,12,0.1)',
                                            color: isDark ? '#F0DEC8' : '#3E2723'
                                        }}
                                    />
                                    <p className="text-[10px] font-medium mt-1 text-right" style={{ color: isDark ? '#6B5540' : '#BCAAA4' }}>{bio.length}/200</p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #C2410C, #B45309)', boxShadow: '0 4px 14px rgba(194,65,12,0.25)' }}
                                    >
                                        <Save className="h-3.5 w-3.5" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </motion.button>
                                    <button
                                        onClick={() => { setEditing(false); setFullName(profile.fullName || ''); setPhone(profile.phone || ''); setBio(profile.bio || ''); }}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                                        style={{ color: isDark ? '#7D5F45' : '#8D6E63', backgroundColor: isDark ? 'rgba(74,45,20,0.2)' : 'rgba(141,110,99,0.08)' }}
                                    >
                                        <X className="h-3.5 w-3.5" /> Cancel
                                    </button>
                                </div>
                            </div>

                            {/* Save message */}
                            <AnimatePresence>
                                {saveMessage && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`text-xs font-bold mt-4 ${saveMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}
                                    >
                                        {saveMessage.text}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── SECTION 4: Quick Info Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { icon: Shield, label: 'Account Status', value: profile.accountStatus || 'ACTIVE', desc: 'Your account is secure' },
                    { icon: Sparkles, label: 'Account Type', value: isAdmin ? 'Administrator' : 'Member', desc: isAdmin ? 'Full platform access' : 'Standard member perks' },
                    { icon: FileText, label: 'Email Status', value: profile.isEmailVerified ? 'Verified' : 'Unverified', desc: profile.isEmailVerified ? 'Email confirmed' : 'Please verify your email' },
                ].map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="rounded-2xl p-4 border shadow-sm"
                        style={{
                            backgroundColor: isDark ? '#1a1209' : '#fffdf8',
                            borderColor: isDark ? 'rgba(194,65,12,0.12)' : 'rgba(194,65,12,0.06)'
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: isDark ? 'rgba(217,119,6,0.12)' : 'rgba(194,65,12,0.06)' }}>
                                <card.icon className="h-4.5 w-4.5" style={{ color: isDark ? '#D97706' : '#C2410C' }} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: isDark ? '#6B5540' : '#A1887F' }}>{card.label}</p>
                                <p className="text-sm font-black mt-0.5" style={{ color: isDark ? '#F0DEC8' : '#3E2723' }}>{card.value}</p>
                                <p className="text-[10px] font-medium mt-0.5" style={{ color: isDark ? '#5A4535' : '#BCAAA4' }}>{card.desc}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ─── SECTION 5: Danger Zone ─── */}
            <div className="rounded-[2rem] border overflow-hidden shadow-sm"
                style={{
                    borderColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                    backgroundColor: isDark ? '#1a0a0a' : '#FFF5F5'
                }}
            >
                <button
                    onClick={() => setShowDeleteZone(v => !v)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
                    style={{ color: isDark ? '#FCA5A5' : '#EF4444' }}
                >
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5" />
                        <div>
                            <p className="text-sm font-black">Danger Zone</p>
                            <p className="text-[10px] font-medium opacity-60">Irreversible actions for your account</p>
                        </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDeleteZone ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {showDeleteZone && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pb-6 pt-2 border-t" style={{ borderColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)' }}>
                                <div className="rounded-2xl p-5"
                                    style={{ backgroundColor: isDark ? 'rgba(127,29,29,0.15)' : 'rgba(239,68,68,0.04)', border: isDark ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(239,68,68,0.08)' }}>
                                    <h4 className="text-sm font-black" style={{ color: isDark ? '#FCA5A5' : '#DC2626' }}>Delete Account</h4>
                                    <p className="text-xs mt-1 leading-relaxed" style={{ color: isDark ? '#F87171' : '#EF4444', opacity: 0.7 }}>
                                        Once deactivated, your account data will be retained for 30 days before permanent deletion. You can contact support to reactivate within this period.
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white transition-all"
                                        style={{ backgroundColor: '#DC2626', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Delete My Account
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Delete Confirmation Modal ─── */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(30, 10, 10, 0.7)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.85, y: 30, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            onClick={e => e.stopPropagation()}
                            className="w-[320px] rounded-3xl overflow-hidden"
                            style={{
                                backgroundColor: isDark ? '#1a0a0a' : '#FFF5F5',
                                boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                                border: isDark ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(239,68,68,0.15)'
                            }}
                        >
                            {/* Red header */}
                            <div className="h-14 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)' }}>
                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <AlertTriangle className="h-7 w-7 text-white" />
                                </motion.div>
                            </div>

                            <div className="p-5">
                                <h3 className="text-base font-black text-center" style={{ color: isDark ? '#FCA5A5' : '#DC2626' }}>
                                    Delete your account?
                                </h3>
                                <p className="text-[11px] text-center mt-1.5 leading-relaxed" style={{ color: isDark ? '#F87171' : '#EF4444', opacity: 0.7 }}>
                                    Enter your password to confirm. This action cannot be undone.
                                </p>

                                {/* Password input */}
                                <div className="relative mt-4">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={deletePassword}
                                        onChange={e => setDeletePassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full px-4 py-3 pr-10 rounded-xl text-sm font-medium outline-none"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(127,29,29,0.2)' : 'rgba(239,68,68,0.05)',
                                            border: isDark ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(239,68,68,0.12)',
                                            color: isDark ? '#FCA5A5' : '#7F1D1D'
                                        }}
                                    />
                                    <button
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                                        style={{ color: isDark ? '#FCA5A5' : '#DC2626' }}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                {deleteError && (
                                    <p className="text-xs font-bold text-red-500 mt-2">{deleteError}</p>
                                )}

                                <div className="flex gap-2.5 mt-5">
                                    <button
                                        onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(''); }}
                                        className="flex-1 py-2.5 text-xs font-bold rounded-xl transition-colors"
                                        style={{
                                            color: isDark ? '#A08060' : '#8D6E63',
                                            backgroundColor: isDark ? 'rgba(74,45,20,0.3)' : 'rgba(141,110,99,0.08)',
                                            border: isDark ? '1px solid rgba(74,45,20,0.4)' : '1px solid rgba(141,110,99,0.15)'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex-1 py-2.5 text-xs font-black text-white rounded-xl transition-all disabled:opacity-50"
                                        style={{ backgroundColor: '#DC2626', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}
                                    >
                                        {deleting ? 'Deleting...' : 'Delete Forever'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccountDetails;
