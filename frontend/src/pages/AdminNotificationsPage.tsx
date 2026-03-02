import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Send, Trash2, Users, AlertTriangle, Eye, Reply, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface NotificationRead {
    userId: number;
    username: string;
    email: string;
    phone: string | null;
    readAt: string;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    isGlobal: boolean;
    targetUserEmail?: string;
    targetUsername?: string;
    senderUsername?: string;
    senderEmail?: string;
}

const AdminNotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Compose form state
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('INFO');
    const [targetUserIdStr, setTargetUserIdStr] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [attachmentType, setAttachmentType] = useState('NONE');
    const [submitting, setSubmitting] = useState(false);

    // Expanded view state
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [readsMap, setReadsMap] = useState<Record<number, NotificationRead[]>>({});
    const [readsLoading, setReadsLoading] = useState<Set<number>>(new Set());

    // Reply state
    const [replyingTo, setReplyingTo] = useState<Notification | null>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/notifications');
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error('Failed to load notifications', err);
            setError('Failed to load notification history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchReads = async (id: number) => {
        try {
            setReadsLoading(prev => new Set(prev).add(id));
            const res = await api.get(`/admin/notifications/${id}/reads`);
            setReadsMap(prev => ({ ...prev, [id]: res.data }));
        } catch (err) {
            console.error('Failed to fetch reads for notification', id, err);
        } finally {
            setReadsLoading(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const toggleExpand = (id: number) => {
        const next = new Set(expandedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
            if (!readsMap[id]) {
                fetchReads(id);
            }
        }
        setExpandedIds(next);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to rollback and completely delete this notification from all inboxes?")) return;
        try {
            await api.delete(`/admin/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            alert('Failed to delete notification');
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            let finalAttachmentUrl = attachmentUrl.trim() === '' ? null : attachmentUrl;

            // Handle local file upload if a file was selected
            if (selectedFile && (attachmentType === 'IMAGE' || attachmentType === 'VIDEO')) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalAttachmentUrl = uploadRes.data.fileDownloadUri;
            }

            await api.post('/admin/notifications', {
                title,
                message,
                type,
                targetUserId: targetUserIdStr.trim() === '' ? null : targetUserIdStr,
                attachmentUrl: finalAttachmentUrl,
                attachmentType: attachmentType === 'NONE' ? null : attachmentType
            });
            // Reset form
            setTitle('');
            setMessage('');
            setType('INFO');
            setTargetUserIdStr('');
            setAttachmentUrl('');
            setSelectedFile(null);
            setAttachmentType('NONE');
            setReplyingTo(null);

            // Refresh
            fetchNotifications();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send notification');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = (notif: Notification) => {
        setReplyingTo(notif);
        setTitle(`Re: ${notif.title}`);
        setMessage(''); // let them type
        // User has to supply target ID manually right now, but we can set focus.
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="p-6 lg:p-10 w-full max-w-6xl mx-auto">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black font-serif text-primary">Push Notifications</h1>
                        <p className="text-sm text-gray-500">Manage global broadcasts, receipts, and target alerts.</p>
                    </div>
                </div>
            </header>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 border border-red-200">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Composer */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-gray-100 dark:border-neutral-700 sticky top-24 shadow-sm"
                    >
                        <h2 className="text-lg font-black font-serif text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            {replyingTo ? <><Reply className="h-4 w-4 text-primary" /> Compose Reply</> : <><Send className="h-4 w-4 text-primary" /> Compose Notice</>}
                        </h2>

                        {replyingTo && (
                            <div className="mb-6 text-xs p-4 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-700">
                                <span className="font-bold text-gray-600 dark:text-gray-400 block mb-1">Replying to {replyingTo.senderUsername || 'Admin'}:</span>
                                <span className="text-gray-900 dark:text-white line-clamp-3 italic opacity-80 pt-1 pb-2">"{replyingTo.message}"</span>
                                <button type="button" onClick={() => { setReplyingTo(null); setTitle(''); }} className="mt-2 text-red-500 font-bold hover:underline">Cancel Reply</button>
                            </div>
                        )}
                        {/* PUSH NOTIFICATION FIELD DETAILS */}
                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Target Audience</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Username or Email (Leave blank for Global)"
                                        value={targetUserIdStr}
                                        onChange={e => setTargetUserIdStr(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors pl-10"
                                    />
                                    <Users className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1.5 font-medium italic">Leave blank to broadcast to ALL users.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Headline</label>
                                <input
                                    type="text"
                                    placeholder="e.g. System Update"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Severity</label>
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                                >
                                    <option value="INFO">Information (Blue)</option>
                                    <option value="SUCCESS">Success (Green)</option>
                                    <option value="WARNING">Warning (Yellow)</option>
                                    <option value="ALERT">Critical (Red)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Attachment Type</label>
                                    <select
                                        value={attachmentType}
                                        onChange={e => setAttachmentType(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="NONE">None</option>
                                        <option value="IMAGE">Image / Photo</option>
                                        <option value="VIDEO">Video</option>
                                        <option value="LINK">External Link</option>
                                    </select>
                                </div>
                                {attachmentType !== 'NONE' && (
                                    <div className="flex flex-col gap-2">
                                        {(attachmentType === 'IMAGE' || attachmentType === 'VIDEO') && (
                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Upload File</label>
                                                <input
                                                    type="file"
                                                    accept={attachmentType === 'IMAGE' ? "image/*" : "video/*"}
                                                    onChange={e => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setSelectedFile(e.target.files[0]);
                                                            setAttachmentUrl(''); // Clear URL if picking a file
                                                        }
                                                    }}
                                                    className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                />
                                            </div>
                                        )}
                                        {(!selectedFile || attachmentType === 'LINK') && (
                                            <div>
                                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{attachmentType === 'LINK' ? 'External URL' : 'Or enter an image/video URL'}</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://..."
                                                    value={attachmentUrl}
                                                    onChange={e => setAttachmentUrl(e.target.value)}
                                                    required={attachmentType === 'LINK' || (!selectedFile && attachmentType !== 'NONE')}
                                                    className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Message Body</label>
                                <textarea
                                    placeholder="Type your message here..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    required
                                    rows={5}
                                    className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-sm px-6 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-4"
                            >
                                {submitting ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Send className="h-4 w-4" />}
                                {submitting ? 'Dispatching...' : 'Dispatch Notification'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* History */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-black font-serif text-primary mb-6">Dispatch History & Analytics</h2>

                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-16 text-center border border-gray-100 dark:border-neutral-700 shadow-sm">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No notifications have been dispatched yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((n) => (
                                <motion.div
                                    key={n.id}
                                    layout
                                    className="bg-white dark:bg-neutral-800 rounded-[2rem] border border-gray-100 dark:border-neutral-700 overflow-hidden shadow-sm"
                                >
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${n.type === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                                    n.type === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                                                        n.type === 'ALERT' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {n.type}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${n.isGlobal ? 'bg-purple-100/50 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {n.isGlobal ? 'Global Broadcast' : 'Direct Message'}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg font-serif">{n.title}</h3>
                                            <p className="text-sm text-gray-500 mt-2 leading-relaxed opacity-90">{n.message}</p>

                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                <span>{new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                {n.targetUsername && (
                                                    <span>Target ID: <span className="text-gray-600 dark:text-gray-300">@{n.targetUsername}</span></span>
                                                )}
                                                {n.senderUsername && (
                                                    <span className="flex items-center gap-1 text-primary">
                                                        <CheckCircle className="h-3 w-3" /> Dispatched By: {n.senderUsername}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-2 rounded-2xl w-full md:w-auto">
                                            <button
                                                onClick={() => handleReply(n)}
                                                className="p-3 text-gray-500 hover:text-primary transition-colors hover:bg-primary/10 rounded-xl"
                                                title="Reply directly"
                                            >
                                                <Reply className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => toggleExpand(n.id)}
                                                className="flex flex-1 md:flex-initial items-center justify-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors shadow-sm"
                                            >
                                                <Eye className="h-4 w-4" /> Receipts
                                            </button>
                                            <button
                                                onClick={() => handleDelete(n.id)}
                                                className="p-3 text-red-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl"
                                                title="Rollback Global Notification"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Read Receipts Panel */}
                                    <AnimatePresence>
                                        {expandedIds.has(n.id) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-gray-100 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-900/50 overflow-hidden"
                                            >
                                                <div className="p-6 md:p-8">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-3">
                                                        Read Receipts Status
                                                        {readsMap[n.id] && <span className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white px-3 py-1 rounded-full text-[10px] shadow-sm">{readsMap[n.id].length} Audience Reached</span>}
                                                    </h4>

                                                    {readsLoading.has(n.id) ? (
                                                        <div className="text-xs text-gray-400 flex items-center gap-3 py-4">
                                                            <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Tracking read receipts...
                                                        </div>
                                                    ) : readsMap[n.id]?.length > 0 ? (
                                                        <div className="overflow-x-auto overflow-y-auto max-h-[300px] custom-scrollbar rounded-xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                                                            <table className="w-full text-xs text-left">
                                                                <thead className="bg-gray-50 dark:bg-neutral-800/50">
                                                                    <tr className="text-gray-500">
                                                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Recipient</th>
                                                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Contact Email</th>
                                                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Phone Number</th>
                                                                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Acknowledge Time</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                                                                    {readsMap[n.id].map(r => (
                                                                        <tr key={r.userId} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                                                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">@{r.username}</td>
                                                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{r.email}</td>
                                                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-[11px] bg-gray-100 dark:bg-neutral-800 rounded md:bg-transparent">{r.phone || 'Unavailable'}</td>
                                                                            <td className="px-6 py-4 text-gray-500">{new Date(r.readAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl p-8 text-center text-gray-400">
                                                            <Eye className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                                            <p className="text-sm font-medium">Pending acknowledgement</p>
                                                            <p className="text-xs mt-1">No recipients have opened this notification yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default AdminNotificationsPage;
