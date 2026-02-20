import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Package, Truck, Home, XCircle, DollarSign, MessageCircle } from 'lucide-react';
import type { CustomOrderStatus } from '../types/customOrder.types';

interface TimelineStep {
    key: CustomOrderStatus;
    label: string;
    icon: React.ElementType;
}

const TIMELINE_STEPS: TimelineStep[] = [
    { key: 'REQUESTED', label: 'Requested', icon: Clock },
    { key: 'QUOTED', label: 'Quoted', icon: MessageCircle },
    { key: 'APPROVED', label: 'Approved', icon: CheckCircle },
    { key: 'PAID', label: 'Paid', icon: DollarSign },
    { key: 'PROCESSING', label: 'Processing', icon: Package },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

const STATUS_ORDER: CustomOrderStatus[] = [
    'REQUESTED', 'QUOTED', 'APPROVED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED',
];

interface OrderTimelineProps {
    currentStatus: CustomOrderStatus;
    updatedAt?: string;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, updatedAt }) => {
    const isRejected = currentStatus === 'REJECTED';
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);

    if (isRejected) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-50 rounded-2xl px-5 py-4 border border-red-100"
            >
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-red-700">Request Rejected</p>
                    {updatedAt && (
                        <p className="text-xs text-red-400 mt-0.5">
                            {new Date(updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between relative">
                {/* Background connector line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0" />
                {/* Active connector line */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{
                        width: currentIndex >= 0
                            ? `${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%`
                            : '0%',
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute top-5 left-5 h-0.5 bg-primary z-[1]"
                    style={{ maxWidth: 'calc(100% - 2.5rem)' }}
                />

                {TIMELINE_STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = step.icon;

                    return (
                        <motion.div
                            key={step.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="flex flex-col items-center relative z-10"
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                                    : isCurrent
                                        ? 'bg-secondary text-white shadow-lg shadow-secondary/30 ring-4 ring-secondary/20'
                                        : 'bg-gray-100 text-gray-300'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                            <span
                                className={`text-[9px] font-black uppercase tracking-wider mt-2 text-center ${isCompleted
                                    ? 'text-primary'
                                    : isCurrent
                                        ? 'text-secondary'
                                        : 'text-gray-300'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTimeline;
