import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 dark:border-neutral-800 last:border-0 py-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left group"
            >
                <span className={`text-lg font-bold transition-colors pr-8 ${isOpen ? 'text-primary' : 'text-gray-900 dark:text-white group-hover:text-primary'}`}>
                    {question}
                </span>
                <div className={`p-2 rounded-xl transition-all flex-shrink-0 ${isOpen ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 group-hover:bg-primary/10'}`}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pt-4 text-gray-600 dark:text-neutral-400 leading-relaxed max-w-2xl font-medium">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface FAQSectionProps {
    items: FAQItemProps[];
    title?: string;
    subtitle?: string;
}

const FAQSection: React.FC<FAQSectionProps> = ({
    items,
    title = "Frequently Asked Questions",
    subtitle = "Everything you need to know about MRS. DEORE traditions and quality."
}) => {
    return (
        <section className="py-24">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 dark:bg-primary/10 rounded-full mb-6 border border-primary/10">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Knowledge Base</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white font-serif tracking-tight mb-4">{title}</h2>
                    <p className="text-gray-600 dark:text-neutral-500 max-w-lg mx-auto leading-relaxed">{subtitle}</p>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-6 lg:p-12 shadow-2xl shadow-gray-200/40 dark:shadow-none border border-gray-100 dark:border-neutral-800 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 divide-y divide-gray-100 dark:divide-neutral-800">
                        {items.map((item, idx) => (
                            <FAQItem key={idx} {...item} />
                        ))}
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center">
                    <div className="inline-flex items-center gap-6 p-2 pr-6 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-full shadow-lg">
                        <div className="flex -space-x-3 overflow-hidden p-1">
                            <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-neutral-900 bg-primary/20 flex items-center justify-center font-black text-xs text-primary">MA</div>
                            <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-neutral-900 bg-secondary/20 flex items-center justify-center font-black text-xs text-secondary">SD</div>
                            <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-neutral-900 bg-accent/20 flex items-center justify-center font-black text-xs text-accent">RD</div>
                        </div>
                        <p className="text-sm font-bold text-gray-600 dark:text-neutral-400">Still have specific questions?</p>
                        <a
                            href="https://wa.me/918459424840"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-secondary text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-accent transition-all flex items-center gap-2 group"
                        >
                            WhatsApp Us <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
