"use client";

import { motion } from "motion/react";

interface RiskGaugeProps {
    risk: number;
}

export default function RiskGauge({ risk }: RiskGaugeProps) {
    const getRiskColor = (risk: number) => {
        if (risk < 30) return { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", badge: "SAFE" };
        if (risk < 60) return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", badge: "WARNING" };
        if (risk < 80) return { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", badge: "HIGH" };
        return { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "CRITICAL" };
    };

    const riskStyle = getRiskColor(risk);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${riskStyle.bg} border ${riskStyle.border} rounded-2xl p-8 backdrop-blur-sm transition-colors duration-500`}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Circular Gauge */}
                <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                className="text-slate-700/30"
                            />
                            <motion.circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={`${(risk / 100) * 439.6} 439.6`}
                                className={riskStyle.text}
                                strokeLinecap="round"
                                initial={{ strokeDasharray: "0 439.6" }}
                                animate={{ strokeDasharray: `${(risk / 100) * 439.6} 439.6` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-bold ${riskStyle.text}`}>{Math.round(risk)}%</span>
                        </div>
                    </div>
                </div>

                {/* Risk Info */}
                <div className="text-center md:text-left space-y-3">
                    <h2 className="text-2xl font-bold text-white">Fire Risk Index</h2>
                    <div className={`inline-block px-4 py-2 rounded-lg ${riskStyle.bg} border ${riskStyle.border}`}>
                        <span className={`font-bold ${riskStyle.text}`}>{riskStyle.badge}</span>
                    </div>
                    <p className="text-sm text-slate-400">
                        Calculated from Gas, Temp, Humidity & Rate of Rise.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
