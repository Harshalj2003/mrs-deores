import type { Variants, Transition } from 'framer-motion';

// ============================================================
// Centralized Scroll Animation Variant Library
// Premium, dynamic reveal effects for each section type.
// ============================================================

/** Hero sections — subtle scale-up reveal */
export const scaleReveal: Variants = {
    hidden: { opacity: 0, scale: 0.92, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
};

/** Content sliding up from below */
export const fadeSlideUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

/** Content sliding down from above */
export const fadeSlideDown: Variants = {
    hidden: { opacity: 0, y: -40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

/** Slight skew that straightens on reveal — great for titles */
export const skewReveal: Variants = {
    hidden: { opacity: 0, y: 30, skewY: 2 },
    visible: {
        opacity: 1,
        y: 0,
        skewY: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
};

/** Parallax-style drift — subtle float effect */
export const parallaxDrift: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: 'easeOut' }
    }
};

/** Container for staggered children */
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

/** Individual card item — spring-based entrance */
export const staggerCard: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
            mass: 0.8
        }
    }
};

/** Slide-in from left for navigation */
export const slideFromLeft: Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
};

/** Slide-in from right for navigation */
export const slideFromRight: Variants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
};

/** Pop-in for buttons and small interactive elements */
export const popIn: Variants = {
    hidden: { opacity: 0, scale: 0.6 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20
        }
    }
};

/** Page transition variants — directional */
export const pageTransitions = {
    slideLeft: {
        initial: { opacity: 0, x: 40 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -40 }
    },
    slideRight: {
        initial: { opacity: 0, x: -40 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: 40 }
    },
    slideUp: {
        initial: { opacity: 0, y: 30 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
    },
    fade: {
        initial: { opacity: 0 },
        in: { opacity: 1 },
        out: { opacity: 0 }
    }
};

export const pageEase: Transition = {
    type: 'tween',
    ease: [0.22, 1, 0.36, 1],
    duration: 0.4
};

/** Viewport settings for whileInView animations */
export const defaultViewport = {
    once: true,
    margin: '-60px' as const
};

export const aggressiveViewport = {
    once: true,
    margin: '-120px' as const
};
