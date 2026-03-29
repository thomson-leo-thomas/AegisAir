"use client";

import { useMemo } from "react";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from "recharts";
import { Activity, Flame, Droplets, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { motion } from "motion/react";

const tooltipStyle = {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 8,
    color: "#f1f5f9",
    fontSize: 12,
};

export default function AnalyticsPage() {
    const deviceId = "esp32-001";
    const { data } = useRealtimeData(deviceId);

    // Only real Firebase history — no mock, no random
    const chartData = useMemo(() =>
        data.history.map((entry) => ({
            time: new Date(entry.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            gas: entry.gas,
            temp: entry.temp,
            humidity: entry.humidity,
            risk: entry.risk,
        })),
        [data.history]);

    const hasData = chartData.length > 0;

    // Derived stats — computed from real readings only
    const avgGas = hasData ? Math.round(chartData.reduce((s, d) => s + d.gas, 0) / chartData.length) : null;
    const peakTemp = hasData ? Math.max(...chartData.map((d) => d.temp)).toFixed(1) : null;
    const avgHum = hasData ? Math.round(chartData.reduce((s, d) => s + d.humidity, 0) / chartData.length) : null;
    const riskIncidents = hasData ? chartData.filter((d) => d.risk >= 60).length : null;

    const statCards = [
        { label: "Avg Gas Level", value: avgGas != null ? `${avgGas} ppm` : "–", icon: Activity, color: "text-cyan-400" },
        { label: "Peak Temperature", value: peakTemp != null ? `${peakTemp}°C` : "–", icon: Flame, color: "text-orange-400" },
        { label: "Avg Humidity", value: avgHum != null ? `${avgHum}%` : "–", icon: Droplets, color: "text-blue-400" },
        { label: "Risk Events (≥60)", value: riskIncidents != null ? `${riskIncidents}` : "–", icon: TrendingUp, color: "text-yellow-400" },
    ];

    const factors = [
        { label: "Gas Concentration", pct: 50, impact: "High", color: "bg-cyan-500" },
        { label: "Temperature", pct: 30, impact: "Medium", color: "bg-orange-500" },
        { label: "Humidity Effect", pct: 20, impact: "Low", color: "bg-blue-500" },
    ];

    // Empty state shown when ESP hasn't pushed history yet
    const EmptyChart = ({ label }: { label: string }) => (
        <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-slate-600">
            <Clock className="w-6 h-6" />
            <p className="text-xs text-center">No data yet<br /><span className="text-slate-700">{label}</span></p>
        </div>
    );

    const charts = [
        { key: "gas", label: "Gas Concentration (ppm)", color: "#06b6d4", name: "Gas (ppm)" },
        { key: "temp", label: "Temperature (°C)", color: "#f97316", name: "Temp (°C)" },
        { key: "humidity", label: "Humidity (%)", color: "#3b82f6", name: "Humidity (%)" },
        { key: "risk", label: "Risk Score (0–100)", color: "#eab308", name: "Risk Score" },
    ];

    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {hasData ? `${chartData.length} readings from Firebase` : "Waiting for ESP32 to send history…"}
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${data.deviceStatus === "ONLINE"
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        : "border-slate-600 bg-slate-800 text-slate-500"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${data.deviceStatus === "ONLINE" ? "bg-cyan-400 animate-pulse" : "bg-slate-500"}`} />
                    {data.deviceStatus}
                </div>
            </div>

            {/* Anomaly banner */}
            {data.anomaly.active && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3"
                >
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span className="text-yellow-300 text-sm">{data.anomaly.message}</span>
                    {data.anomaly.sensorFault && (
                        <span className="ml-auto text-yellow-600 text-xs font-semibold uppercase tracking-wide">Sensor Fault</span>
                    )}
                </motion.div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map(({ label, value, icon: Icon, color }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-xl border border-slate-700/60 bg-slate-800/50 p-4"
                    >
                        <Icon className={`w-5 h-5 mb-2 ${color}`} />
                        <div className="text-2xl font-bold text-white">{value}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Individual Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {charts.map(({ key, label, color, name }) => (
                    <div key={key} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                        <h3 className="text-white font-semibold mb-3 text-sm">{label}</h3>
                        {hasData ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="time" stroke="#475569" tick={{ fill: "#475569", fontSize: 9 }} interval={Math.max(1, Math.floor(chartData.length / 6))} />
                                    <YAxis stroke="#475569" tick={{ fill: "#475569", fontSize: 9 }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} name={name} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart label="ESP32 pushes history every 15 s" />
                        )}
                    </div>
                ))}
            </div>

            {/* Combined */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3 text-sm">Combined Metrics</h3>
                {hasData ? (
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#475569" tick={{ fill: "#475569", fontSize: 9 }} interval={Math.max(1, Math.floor(chartData.length / 6))} />
                            <YAxis stroke="#475569" tick={{ fill: "#475569", fontSize: 9 }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => <span style={{ color: "#94a3b8" }}>{v}</span>} />
                            <Line type="monotone" dataKey="gas" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="Gas (ppm)" />
                            <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={1.5} dot={false} name="Temp (°C)" />
                            <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Humidity (%)" />
                            <Line type="monotone" dataKey="risk" stroke="#eab308" strokeWidth={1.5} dot={false} name="Risk Score" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChart label="Waiting for first history entry" />
                )}
            </div>

            {/* Contributing Factors */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4 text-sm">Contributing Factors to Fire Risk</h3>
                <div className="space-y-4">
                    {factors.map(({ label, pct, impact, color }) => (
                        <div key={label}>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-slate-300">{label}</span>
                                <span className="text-slate-400">
                                    Impact: <span className="text-slate-200 font-medium">{impact}</span>
                                    <span className="text-white font-bold ml-4">{pct}%</span>
                                </span>
                            </div>
                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full ${color}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
