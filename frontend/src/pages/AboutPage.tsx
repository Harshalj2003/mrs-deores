import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

interface StoryChapter {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    videoUrl: string;
}

const AboutPage: React.FC = () => {
    const [title, setTitle] = useState('Our Story');
    const [tagline, setTagline] = useState('Made with love, served with tradition.');
    const [description, setDescription] = useState('');
    const [chapters, setChapters] = useState<StoryChapter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/settings').then(res => {
            const s = res.data as Record<string, string>;
            if (s.story_title) setTitle(s.story_title);
            if (s.story_tagline) setTagline(s.story_tagline);
            if (s.story_description) setDescription(s.story_description);
            try { if (s.story_chapters) setChapters(JSON.parse(s.story_chapters)); } catch { /**/ }
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center font-serif italic text-primary animate-pulse text-2xl">
                Opening Our Story...
            </div>
        </div>
    );

    return (
        <div className="bg-background min-h-screen">
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-[#FFF8E7] via-[#FFECD2] to-[#FFF8E7] overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#C2410C 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
                            ✨ Est. With Tradition
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black font-serif text-accent leading-tight mb-6">
                            {title}
                        </h1>
                        <p className="text-xl md:text-2xl text-[#8D6E63] font-medium font-serif italic leading-relaxed max-w-2xl mx-auto">
                            {tagline}
                        </p>
                    </motion.div>
                </div>
                {/* Decorative wave */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
            </div>

            {/* Main Story Content */}
            {description && (
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="max-w-3xl mx-auto px-6 py-16 text-center"
                >
                    <p className="text-lg text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                        {description}
                    </p>
                </motion.section>
            )}

            {/* Story Chapters — Timeline */}
            {chapters.length > 0 && (
                <div className="max-w-4xl mx-auto px-6 pb-20">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center text-3xl font-black font-serif text-accent mb-16"
                    >
                        Our Journey
                    </motion.h2>
                    <div className="relative space-y-16">
                        {/* Timeline vertical line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/15 hidden md:block -translate-x-1/2" />

                        {chapters.map((chapter, idx) => {
                            const isEven = idx % 2 === 0;
                            return (
                                <motion.div
                                    key={chapter.id}
                                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: '-80px' }}
                                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                                    className={`relative grid md:grid-cols-2 gap-8 items-center ${isEven ? '' : 'md:[direction:rtl]'}`}
                                >
                                    {/* Timeline dot */}
                                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-0 w-5 h-5 bg-primary rounded-full border-4 border-white shadow-md hidden md:block z-10" />

                                    {/* Content */}
                                    <div className={`md:[direction:ltr] ${isEven ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}`}>
                                        <span className="text-xs font-black text-primary uppercase tracking-widest mb-2 block">
                                            Chapter {idx + 1}
                                        </span>
                                        <h3 className="text-2xl font-black font-serif text-accent mb-3">{chapter.title}</h3>
                                        <p className="text-gray-500 leading-relaxed">{chapter.description}</p>
                                        {chapter.videoUrl && (
                                            <a
                                                href={chapter.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-primary hover:text-accent transition-colors"
                                            >
                                                ▶ Watch the Story
                                            </a>
                                        )}
                                    </div>

                                    {/* Image */}
                                    <div className={`md:[direction:ltr] ${isEven ? 'md:pl-10' : 'md:pr-10'}`}>
                                        {chapter.imageUrl ? (
                                            <div className="rounded-3xl overflow-hidden shadow-xl aspect-video">
                                                <img
                                                    src={chapter.imageUrl}
                                                    alt={chapter.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="rounded-3xl bg-gradient-to-br from-[#FFF8E7] to-[#FFECD2] aspect-video flex items-center justify-center border-2 border-dashed border-primary/20">
                                                <span className="text-4xl opacity-30">📖</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty state — no story added yet */}
            {!description && chapters.length === 0 && (
                <div className="max-w-2xl mx-auto px-6 py-24 text-center">
                    <div className="text-6xl mb-6">📖</div>
                    <h2 className="text-2xl font-bold font-serif text-accent mb-3">Coming Soon</h2>
                    <p className="text-gray-400">Our story is being crafted with love. Check back soon!</p>
                </div>
            )}

            {/* Trust strip */}
            <div className="bg-secondary/10 py-10">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center uppercase tracking-widest text-sm font-bold text-accent">
                    <motion.div whileInView={{ y: [10, 0], opacity: [0, 1] }} viewport={{ once: true }}>✨ 100% Homemade</motion.div>
                    <motion.div whileInView={{ y: [10, 0], opacity: [0, 1] }} viewport={{ once: true }} transition={{ delay: 0.1 }}>🌿 Natural Ingredients</motion.div>
                    <motion.div whileInView={{ y: [10, 0], opacity: [0, 1] }} viewport={{ once: true }} transition={{ delay: 0.2 }}>❤️ Family Tradition</motion.div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
