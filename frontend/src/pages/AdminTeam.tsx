import React, { useState } from 'react';
import { UserPlus, Mail, Phone, Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../services/api';

const AdminTeam: React.FC = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [invitationResult, setInvitationResult] = useState<{ email: string; token: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setInvitationResult(null);

        try {
            const response = await api.post('/auth/admin/invite', { email, phone });
            setInvitationResult({
                email: response.data.email,
                token: response.data.inviteToken
            });
            setEmail('');
            setPhone('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create invitation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!invitationResult) return;
        const enrollmentLink = `${window.location.origin}/login?enroll=true&token=${invitationResult.token}`;
        navigator.clipboard.writeText(enrollmentLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
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
                                            className="block w-full rounded-2xl border-none bg-neutral-light dark:bg-neutral-900 py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
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
                                            className="block w-full rounded-2xl border-none bg-neutral-light dark:bg-neutral-900 py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                            required
                                        />
                                    </div>
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
                                    <code className="block w-full p-3 rounded-xl bg-white dark:bg-neutral-900 text-[10px] font-mono border border-green-100 dark:border-green-500/20 break-all">
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
        </div>
    );
};

export default AdminTeam;
