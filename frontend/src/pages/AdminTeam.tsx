import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, Copy, Check, ShieldCheck, ArrowRight, Clock, CheckCircle2, XCircle, Users, Settings, X } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Invitation {
    id: number;
    email: string;
    phone: string;
    tokenPreview: string;
    isFullyEnrolled: boolean;
    used: boolean;
    username: string | null;
    createdAt: string | null;
    expiresAt: string | null;
    sessionExpiresAt: string | null;
}

const AdminTeam: React.FC = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [invitationResult, setInvitationResult] = useState<{ email: string; token: string } | null>(null);
    const [copied, setCopied] = useState(false);

    // Session Expiry State (New Invite)
    const [enableSessionExpiry, setEnableSessionExpiry] = useState(true);
    const [expiryType, setExpiryType] = useState('days'); // 'days', 'weeks', 'months', 'custom'
    const [customDays, setCustomDays] = useState(5);

    // Session Expiry State (Editing Existing)
    const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
    const [editEnableSessionExpiry, setEditEnableSessionExpiry] = useState(true);
    const [editExpiryType, setEditExpiryType] = useState('days');
    const [editCustomDays, setEditCustomDays] = useState(5);
    const [updateSessionLoading, setUpdateSessionLoading] = useState(false);

    // Invitation History
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    const fetchInvitations = async () => {
        try {
            const res = await api.get('/admin/invitations');
            setInvitations(res.data || []);
        } catch (err) {
            console.error('Failed to fetch invitations', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInvitationResult(null);

        try {
            // Calculate days based on selection
            let sessionExpiryDays = customDays;
            if (enableSessionExpiry) {
                if (expiryType === 'days') sessionExpiryDays = 1;
                else if (expiryType === 'weeks') sessionExpiryDays = 7;
                else if (expiryType === 'months') sessionExpiryDays = 30;
                // 'custom' uses the customDays value directly
            }

            const payload = {
                email,
                phone,
                enableSessionExpiry: enableSessionExpiry.toString(),
                sessionExpiryDays: enableSessionExpiry ? sessionExpiryDays.toString() : "0"
            };

            const response = await api.post('/auth/admin/invite', payload);
            setInvitationResult({
                email: response.data.email,
                token: response.data.inviteToken
            });
            setEmail('');
            setPhone('');
            // Refresh invitation history
            fetchInvitations();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create invitation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSessionId) return;

        setUpdateSessionLoading(true);
        try {
            let sessionExpiryDays = editCustomDays;
            if (editEnableSessionExpiry) {
                if (editExpiryType === 'days') sessionExpiryDays = 1;
                else if (editExpiryType === 'weeks') sessionExpiryDays = 7;
                else if (editExpiryType === 'months') sessionExpiryDays = 30;
            }

            await api.put(`/admin/invitations/${editingSessionId}/session`, {
                enableSessionExpiry: editEnableSessionExpiry.toString(),
                sessionExpiryDays: editEnableSessionExpiry ? sessionExpiryDays.toString() : "0"
            });

            setEditingSessionId(null);
            fetchInvitations();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update session.');
        } finally {
            setUpdateSessionLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!invitationResult) return;
        const enrollmentLink = `${window.location.origin}/login?enroll=true&token=${invitationResult.token}`;
        navigator.clipboard.writeText(enrollmentLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 p-6 lg:p-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white font-serif italic lowercase tracking-tight">
                    Invite Team Member
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Create a secure invitation for new administrative staff.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 border border-gray-100 dark:border-neutral-700 shadow-sm">
                        <form onSubmit={handleInvite} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Pre-approved Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="staff@mrsdeore.com"
                                            className="block w-full rounded-2xl border-none bg-neutral-light dark:bg-neutral-900 py-4 pl-12 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Staff Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="70380XXXXX"
                                            className="block w-full rounded-2xl border-none bg-neutral-light dark:bg-neutral-900 py-4 pl-12 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Session Expiry Settings */}
                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-neutral-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Session Expiry</h3>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">Force admin to re-authenticate periodically</p>
                                        </div>

                                        {/* Custom Toggle Switch matching premium aesthetic */}
                                        <button
                                            type="button"
                                            onClick={() => setEnableSessionExpiry(!enableSessionExpiry)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-neutral-800 ${enableSessionExpiry ? 'bg-primary' : 'bg-gray-200 dark:bg-neutral-700'}`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enableSessionExpiry ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {enableSessionExpiry && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-2 space-y-4">
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {['days', 'weeks', 'months', 'custom'].map((type) => (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                onClick={() => setExpiryType(type)}
                                                                className={`py-2 px-1 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${expiryType === type
                                                                    ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20 dark:text-primary-light'
                                                                    : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-500 hover:border-gray-300 dark:hover:border-neutral-600'
                                                                    }`}
                                                            >
                                                                {type === 'days' ? '1 Day' : type === 'weeks' ? '1 Week' : type === 'months' ? '1 Month' : 'Custom'}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {expiryType === 'custom' && (
                                                        <div className="relative group">
                                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="365"
                                                                value={customDays}
                                                                onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                                                                placeholder="Enter number of days"
                                                                className="block w-full rounded-2xl border-none bg-neutral-light dark:bg-neutral-900 py-4 pl-12 pr-12 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                                                required={expiryType === 'custom'}
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">
                                                                Days
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-primary dark:bg-primary-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark dark:hover:bg-primary-500 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {loading ? (
                                    'Generating Invitation...'
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        Generate Invitation
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Info / Result Section */}
                <div className="lg:col-span-1 space-y-6">
                    {invitationResult ? (
                        <div className="bg-green-50 dark:bg-green-500/5 rounded-3xl p-6 border-2 border-dashed border-green-200 dark:border-green-500/20 animate-in fade-in zoom-in duration-300">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-green-900 dark:text-green-400 italic font-serif">Success!</h3>
                                    <p className="text-[11px] text-green-700 dark:text-green-500 leading-tight">
                                        An invitation for <strong>{invitationResult.email}</strong> is ready.
                                    </p>
                                </div>

                                <div className="w-full space-y-2 mt-4">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-green-800/60 dark:text-green-500/60">Invite token</p>
                                    <code className="block w-full p-3 rounded-xl bg-white dark:bg-neutral-900 text-[10px] font-mono border border-green-100 dark:border-green-500/20 break-all text-gray-900 dark:text-green-300">
                                        {invitationResult.token}
                                    </code>
                                </div>

                                <button
                                    onClick={copyToClipboard}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-neutral-900 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 text-[10px] font-black uppercase tracking-widest hover:bg-green-50 dark:hover:bg-green-500/10 transition-all"
                                >
                                    {copied ? (
                                        <><Check className="h-3.5 w-3.5" /> Copied!</>
                                    ) : (
                                        <><Copy className="h-3.5 w-3.5" /> Copy Enrollment Link</>
                                    )}
                                </button>

                                <p className="text-[9px] text-gray-500 italic mt-2">
                                    Send this link securely to the new team member.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 border border-primary/10 dark:border-primary/20 space-y-4">
                            <h3 className="font-serif italic font-bold text-primary dark:text-primary-light lowercase">Chain of Trust</h3>
                            <ul className="space-y-3">
                                {[
                                    'Secure pre-approval of staff contact data.',
                                    'Automated unique cryptographic token generation.',
                                    'One-time use enrollment links for maximum security.',
                                    'Role assignment is handled strictly by the server.'
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-2 text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                                        <ArrowRight className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Invitation History ────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-neutral-800 rounded-3xl border border-gray-100 dark:border-neutral-700 shadow-sm overflow-hidden"
            >
                <div className="px-8 py-6 border-b border-gray-100 dark:border-neutral-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white font-serif">Invitation History</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} total
                            </p>
                        </div>
                    </div>
                </div>

                {historyLoading ? (
                    <div className="p-12 text-center">
                        <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <p className="text-sm text-gray-400 mt-3">Loading history...</p>
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-sm text-gray-400 italic">No invitations created yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-neutral-700">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Token</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Created</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {invitations.map((inv) => (
                                        <motion.tr
                                            key={inv.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border-b border-gray-50 dark:border-neutral-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                                    <span className="font-medium text-gray-900 dark:text-white text-xs">{inv.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">{inv.phone}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-[10px] font-mono bg-gray-100 dark:bg-neutral-900 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">
                                                    {inv.tokenPreview}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                {inv.isFullyEnrolled ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-bold">
                                                        <CheckCircle2 className="h-3 w-3" /> Enrolled
                                                        {inv.username && <span className="opacity-60">({inv.username})</span>}
                                                    </span>
                                                ) : inv.used ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold">
                                                        <Clock className="h-3 w-3" /> Token Used
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-400 text-[10px] font-bold">
                                                        <XCircle className="h-3 w-3" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[11px] text-gray-500 dark:text-gray-400">{formatDate(inv.createdAt)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setEditingSessionId(inv.id);

                                                        // Sync UI with actual database state
                                                        const isExpiryEnabled = inv.sessionExpiresAt !== null && inv.sessionExpiresAt !== undefined;
                                                        setEditEnableSessionExpiry(isExpiryEnabled);

                                                        if (isExpiryEnabled && inv.sessionExpiresAt) {
                                                            // Calculate days remaining
                                                            const diffTime = new Date(inv.sessionExpiresAt).getTime() - new Date().getTime();
                                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                            const days = diffDays > 0 ? diffDays : 1;

                                                            setEditCustomDays(days);
                                                            if (days === 1) setEditExpiryType('days');
                                                            else if (days === 7) setEditExpiryType('weeks');
                                                            else if (days === 30) setEditExpiryType('months');
                                                            else setEditExpiryType('custom');
                                                        } else {
                                                            setEditExpiryType('days');
                                                            setEditCustomDays(5);
                                                        }
                                                    }}
                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
                                                    title="Update Session"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Edit Session Expiry Modal */}
            <AnimatePresence>
                {editingSessionId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setEditingSessionId(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-100 dark:border-neutral-800 shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white font-serif">Update Session</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Configure session expiry for this admin.</p>
                                </div>
                                <button
                                    onClick={() => setEditingSessionId(null)}
                                    className="h-8 w-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateSession} className="space-y-6">
                                <div className="space-y-3 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl border border-gray-100 dark:border-neutral-800/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Enable Expiry</h4>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Require regular re-login</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEditEnableSessionExpiry(!editEnableSessionExpiry)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-offset-neutral-900 ${editEnableSessionExpiry ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'}`}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editEnableSessionExpiry ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {editEnableSessionExpiry && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-4 space-y-4 border-t border-gray-200 dark:border-neutral-700/50 mt-4">
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {['days', 'weeks', 'months', 'custom'].map((type) => (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                onClick={() => setEditExpiryType(type)}
                                                                className={`py-2 px-1 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${editExpiryType === type
                                                                    ? 'bg-primary text-white shadow-md'
                                                                    : 'bg-white dark:bg-neutral-800 text-gray-500 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700'
                                                                    }`}
                                                            >
                                                                {type === 'days' ? '1 Day' : type === 'weeks' ? '1 Week' : type === 'months' ? '1 Month' : 'Custom'}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {editExpiryType === 'custom' && (
                                                        <div className="relative group">
                                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="365"
                                                                value={editCustomDays}
                                                                onChange={(e) => setEditCustomDays(parseInt(e.target.value) || 1)}
                                                                className="block w-full rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 py-3 pl-12 pr-12 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                                                required={editExpiryType === 'custom'}
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">
                                                                Days
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button
                                    type="submit"
                                    disabled={updateSessionLoading}
                                    className="w-full h-12 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    {updateSessionLoading ? 'Saving...' : 'Save Settings'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminTeam;
