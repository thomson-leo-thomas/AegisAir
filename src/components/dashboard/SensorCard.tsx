"use client";

import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface SensorCardProps {
    title: string;
    value: number;
    unit: string;
    trend: "up" | "down" | "stable";
    icon?: LucideIcon;
    color: "cyan" | "orange" | "blue" | "red" | "green";
    delay?: number;
    /** Normalized bar heights 0–100 from Firebase history; no synthetic/mock bars. */
    sparklineHeights?: number[];
}

export default function SensorCard({ title, value, unit, trend, color, delay = 0, sparklineHeights }: SensorCardProps) {
    const colorMap = {
        cyan: { bg: "bg-cyan-500/30", border: "border-cyan-500/50", text: "text-cyan-400", bar: "bg-cyan-500" },
        orange: { bg: "bg-orange-500/30", border: "border-orange-500/50", text: "text-orange-400", bar: "bg-orange-500" },
        blue: { bg: "bg-blue-500/30", border: "border-blue-500/50", text: "text-blue-400", bar: "bg-blue-500" },
        red: { bg: "bg-red-500/30", border: "border-red-500/50", text: "text-red-400", bar: "bg-red-500" },
        green: { bg: "bg-green-500/30", border: "border-green-500/50", text: "text-green-400", bar: "bg-green-500" },
    };

    const styles = colorMap[color];
    const trendColor = trend === "up" ? "text-red-400" : "text-green-400"; // Assuming up is bad for gas/temp
    const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:${styles.border} transition-all duration-300`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-300 font-medium">{title}</h3>
                {trend !== "stable" && <TrendIcon className={`w-5 h-5 ${trendColor}`} />}
            </div>
            <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold text-white">{value}</span>
                <span className="text-slate-400">{unit}</span>
            </div>

            <div className="h-12 flex items-end gap-1">
                {sparklineHeights && sparklineHeights.length > 0 ? (
                    sparklineHeights.map((h, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-t ${styles.bar}/30`}
                            style={{ height: `${Math.min(100, Math.max(0, h))}%` }}
                        />
                    ))
                ) : (
                    <div className="w-full h-full flex items-center text-xs text-slate-600">
                        No history series passed — pass sparklineHeights from Firebase readings.
                    </div>
                )}
            </div>
        </motion.div>
    );
}
