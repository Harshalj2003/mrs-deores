import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollSectionProps {
    children: React.ReactNode;
    /** Background color or gradient for this section's "world" */
    bg?: string;
    /** Optional decorative pattern overlay */
    pattern?: 'dots' | 'radial' | 'waves' | 'none';
    /** Accent color for the pattern */
    patternColor?: string;
    /** Whether to use full viewport height (only for hero) */
    fullHeight?: boolean;
    /** Unique id for anchor navigation */
    id?: string;
    /** Custom className */
    className?: string;
    /** Animation style for section entrance */
    revealStyle?: 'rise' | 'zoom' | 'curtain' | 'blur' | 'split';
}

/**
 * ScrollSection — Wraps content in an immersive, fullscreen snap section.
 * Each section feels like entering a different "world" with its own
 * background, pattern, and dramatic entrance animation.
 */
const ScrollSection: React.FC<ScrollSectionProps> = ({
    children,
    bg = 'transparent',
    pattern = 'none',
    patternColor = 'rgba(194, 65, 12, 0.04)',
    fullHeight = false,
    id,
    className = '',
    revealStyle = 'rise'
}) => {
    const ref = useRef<HTMLDivElement>(null);
    // Trigger animation when just 15% of section is visible — fires fast, no empty wait
    const isInView = useInView(ref, { once: false, amount: 0.15 });

    // Different dramatic animation styles per section
    const revealVariants = {
        rise: {
            hidden: { opacity: 0, y: 80, scale: 0.96 },
            visible: { opacity: 1, y: 0, scale: 1 }
        },
        zoom: {
            hidden: { opacity: 0, scale: 0.85, filter: 'blur(8px)' },
            visible: { opacity: 1, scale: 1, filter: 'blur(0px)' }
        },
        curtain: {
            hidden: { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' },
            visible: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }
        },
        blur: {
            hidden: { opacity: 0, filter: 'blur(20px)', y: 40 },
            visible: { opacity: 1, filter: 'blur(0px)', y: 0 }
        },
        split: {
            hidden: { opacity: 0, scale: 0.9, rotateX: 8 },
            visible: { opacity: 1, scale: 1, rotateX: 0 }
        }
    };

    const variants = revealVariants[revealStyle];

    // Pattern overlays for visual richness
    const patternStyles: Record<string, React.CSSProperties> = {
        dots: {
            backgroundImage: `radial-gradient(${patternColor} 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
        },
        radial: {
            backgroundImage: `radial-gradient(circle at 30% 50%, ${patternColor} 0%, transparent 60%)`,
            backgroundSize: '100% 100%'
        },
        waves: {
            backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 20px,
                ${patternColor} 20px,
                ${patternColor} 21px
            )`
        },
        none: {}
    };

    return (
        <section
            ref={ref}
            id={id}
            className={`scroll-section relative overflow-hidden ${fullHeight ? 'min-h-[100dvh] flex flex-col justify-center' : ''} ${className}`}
            style={{ background: bg }}
        >
            {/* Pattern overlay */}
            {pattern !== 'none' && (
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={patternStyles[pattern]}
                />
            )}

            {/* Ambient glow — adds depth to each section */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-1/2 -left-1/4 w-[80%] h-[80%] rounded-full opacity-[0.03]"
                    style={{ background: `radial-gradient(circle, ${patternColor} 0%, transparent 70%)` }}
                />
                <div
                    className="absolute -bottom-1/3 -right-1/4 w-[60%] h-[60%] rounded-full opacity-[0.04]"
                    style={{ background: `radial-gradient(circle, ${patternColor} 0%, transparent 70%)` }}
                />
            </div>

            {/* Content with dramatic reveal animation */}
            <motion.div
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                variants={variants}
                transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                    filter: { duration: 0.6 },
                    scale: { duration: 0.7 }
                }}
                className="relative z-10 w-full"
            >
                {children}
            </motion.div>


        </section>
    );
};

export default ScrollSection;
