import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onRatingChange,
    className
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: 'h-3.5 w-3.5',
        md: 'h-5 w-5',
        lg: 'h-8 w-8'
    };

    return (
        <div className={clsx("flex items-center gap-1", className)}>
            {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1;
                const isActive = hoverRating ? starValue <= hoverRating : starValue <= rating;
                const isPartiallyFilled = !hoverRating && !isActive && starValue - 0.5 <= rating;

                return (
                    <motion.button
                        key={index}
                        type="button"
                        disabled={!interactive}
                        whileHover={interactive ? { scale: 1.2, rotate: 5 } : {}}
                        whileTap={interactive ? { scale: 0.9 } : {}}
                        onMouseEnter={() => interactive && setHoverRating(starValue)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        onClick={() => interactive && onRatingChange?.(starValue)}
                        className={clsx(
                            "relative transition-colors duration-200 focus:outline-none",
                            interactive ? "cursor-pointer" : "cursor-default"
                        )}
                    >
                        <Star
                            className={clsx(
                                sizes[size],
                                isActive ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-100 dark:text-neutral-700 dark:fill-neutral-800",
                                isPartiallyFilled && "text-gray-200 dark:text-neutral-700"
                            )}
                        />
                        {isPartiallyFilled && (
                            <div className="absolute inset-0 overflow-hidden w-[50%]">
                                <Star className={clsx(sizes[size], "fill-amber-400 text-amber-400")} />
                            </div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
};

export default StarRating;
