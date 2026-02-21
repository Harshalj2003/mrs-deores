import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, CheckCircle2, Star, Send } from 'lucide-react';
import api from '../services/api';
import type { Review, ReviewStats } from '../types/catalog.types';
import StarRating from './StarRating';

interface ReviewSectionProps {
    productId: number;
    currentUser?: any;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId, currentUser }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const [reviewsRes, statsRes] = await Promise.all([
                    api.get(`/reviews/product/${productId}`),
                    api.get(`/reviews/product/${productId}/stats`)
                ]);
                setReviews(reviewsRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            } finally {
                setLoading(false);
            }
        };

        if (productId) fetchReviews();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userComment.trim()) return;

        try {
            setSubmitting(true);
            setError(null);
            await api.post('/reviews', {
                productId,
                rating: userRating,
                comment: userComment
            });

            // Refresh reviews & stats
            const [reviewsRes, statsRes] = await Promise.all([
                api.get(`/reviews/product/${productId}`),
                api.get(`/reviews/product/${productId}/stats`)
            ]);
            setReviews(reviewsRes.data);
            setStats(statsRes.data);

            // Reset form
            setShowForm(false);
            setUserComment('');
            setUserRating(5);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !reviews.length) return (
        <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="mt-20 border-t border-gray-100 dark:border-neutral-800 pt-20">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                {/* Stats Summary */}
                <div className="md:w-1/3">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white font-serif mb-6">Customer Feedback</h2>
                    {stats && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="text-6xl font-black text-primary font-serif">{stats.averageRating}</div>
                                <div>
                                    <StarRating rating={stats.averageRating} size="md" />
                                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Based on {stats.totalReviews} reviews</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map(stars => (
                                    <div key={stars} className="flex items-center gap-3">
                                        <span className="text-xs font-black text-gray-500 w-4">{stars}</span>
                                        <div className="flex-1 h-2 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(stats.ratingDistribution[stars] || 0) / stats.totalReviews * 100}%` }}
                                                className="h-full bg-amber-400"
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 w-8">{Math.round((stats.ratingDistribution[stars] || 0) / stats.totalReviews * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Call to Action */}
                <div className="md:w-2/3 bg-neutral-light dark:bg-neutral-800/50 rounded-[2rem] p-8 md:p-12 border border-primary/5">
                    <MessageSquare className="h-10 w-10 text-primary/30 mb-6" />
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white font-serif mb-4">Have you tried this tradition?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">Your review helps other families discover authentic homemade tastes.</p>

                    {!currentUser ? (
                        <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-accent transition-all">
                            Sign in to review
                        </Link>
                    ) : (
                        !showForm && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowForm(true)}
                                className="px-8 py-4 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-accent transition-all"
                            >
                                Write a Review
                            </motion.button>
                        )
                    )}

                    <AnimatePresence>
                        {showForm && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-6 mt-6"
                            >
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Your Rating</label>
                                    <StarRating rating={userRating} interactive size="lg" onRatingChange={setUserRating} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Your Experience</label>
                                    <textarea
                                        required
                                        value={userComment}
                                        onChange={(e) => setUserComment(e.target.value)}
                                        rows={4}
                                        placeholder="Tell us what you loved about this product..."
                                        className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-8 py-4 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting ? "Submitting..." : <><Send className="h-4 w-4" /> Post Review</>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-8 py-4 bg-white dark:bg-neutral-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-neutral-700 rounded-full font-black text-xs uppercase tracking-widest hover:border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-8">
                {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 dark:bg-neutral-800/30 rounded-[3rem] border border-dashed border-gray-200 dark:border-neutral-700">
                        <p className="text-gray-400 font-bold italic">No reviews yet. Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {reviews.map((review, idx) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 shadow-sm relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <Star className="h-32 w-32 fill-amber-400 text-amber-400 rotate-12" />
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                                            {review.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 dark:text-white">{review.user.username}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                                {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <StarRating rating={review.rating} size="sm" />
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 italic">
                                    "{review.comment}"
                                </p>

                                {review.isVerifiedPurchase && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-widest">
                                        <CheckCircle2 className="h-3 w-3" /> Verified Purchase
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
