"use client";

import { useState } from "react";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { Power, TriangleAlert, Volume2, Fan, Pipette, RotateCcw, Gauge, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";

export default function ControlPanelPage() {
    const deviceId = "esp32-001";
    const { data, toggleControl } = useRealtimeData(deviceId);
    const isManual = data.controls.manualOverride;

    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Control Panel</h1>
                <p className="text-slate-500 text-sm mt-0.5">Manual system control and configuration</p>
            </div>

            {/* Warning Banner */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/30">
                <TriangleAlert className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                    <div className="text-yellow-400 font-semibold text-sm">Manual Override Mode</div>
                    <div className="text-slate-400 text-xs mt-0.5">
                        Switching to manual mode will disable automatic safety responses. Only authorized personnel should modify these settings.
                    </div>
                </div>
            </div>

            {/* Operation Mode */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4">Operation Mode</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Auto Mode */}
                    <button
                        onClick={() => isManual && toggleControl("manualOverride")}
                        className={clsx(
                            "flex flex-col items-center justify-center py-7 rounded-xl border-2 transition-all",
                            !isManual
                                ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_24px_rgba(6,182,212,0.15)]"
                                : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                        )}
                    >
                        <Power className={clsx("w-8 h-8 mb-3", !isManual ? "text-cyan-400" : "text-slate-500")} />
                        <div className={clsx("text-base font-bold tracking-wide uppercase", !isManual ? "text-cyan-400" : "text-slate-500")}>
                            Auto Mode
                        </div>
                        <div className={clsx("text-xs mt-1", !isManual ? "text-cyan-400/70" : "text-slate-600")}>
                            System controls automatically based on sensor data
                        </div>
                    </button>

                    {/* Manual Override */}
                    <button
                        onClick={() => !isManual && toggleControl("manualOverride")}
                        className={clsx(
                            "flex flex-col items-center justify-center py-7 rounded-xl border-2 transition-all",
                            isManual
                                ? "border-orange-500 bg-orange-500/10 shadow-[0_0_24px_rgba(249,115,22,0.15)]"
                                : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                        )}
                    >
                        <TriangleAlert className={clsx("w-8 h-8 mb-3", isManual ? "text-orange-400" : "text-slate-500")} />
                        <div className={clsx("text-base font-bold tracking-wide uppercase", isManual ? "text-orange-400" : "text-slate-500")}>
                            Manual Override
                        </div>
                        <div className={clsx("text-xs mt-1", isManual ? "text-orange-400/70" : "text-slate-600")}>
                            Full manual control of all system actuators
                        </div>
                    </button>
                </div>
            </div>

            {/* Mode Status Card */}
            {!isManual ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-8 flex flex-col items-center text-center"
                >
                    <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">Automatic Mode Active</h3>
                    <p className="text-slate-400 text-sm max-w-md">
                        The system is currently operating in automatic mode. All safety systems are actively monitoring environmental conditions and will respond automatically to any detected risks.
                    </p>
                    <div className="grid grid-cols-3 gap-3 mt-6 w-full max-w-lg">
                        {[
                            { label: "Sensor Monitoring", sub: "Continuous data collection", color: "border-slate-700 bg-slate-700/40" },
                            { label: "Risk Assessment", sub: "Real-time analysis", color: "border-slate-700 bg-slate-700/40" },
                            { label: "Auto Response", sub: "Immediate action when needed", color: "border-slate-700 bg-slate-700/40" },
                        ].map(({ label, sub, color }) => (
                            <div key={label} className={`rounded-xl border p-3 ${color}`}>
                                <div className="text-cyan-400 font-semibold text-xs">{label}</div>
                                <div className="text-slate-500 text-[10px] mt-0.5">{sub}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <h2 className="text-white font-semibold">Actuator Controls</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            {
                                label: "Buzzer", icon: Volume2,
                                isOn: data.actuators.buzzer,
                                key: "buzzer" as const,
                                onText: "Buzzer is ACTIVE — alarm sounding",
                                offText: "Buzzer is OFF",
                                onStyle: "border-red-500/50 bg-red-500/10",
                                onBadge: "bg-red-500/20 text-red-400 border border-red-500/30",
                            },
                            {
                                label: "Exhaust Fan", icon: Fan,
                                isOn: data.actuators.exhaust,
                                key: "exhaust" as const,
                                onText: "Exhaust Fan is RUNNING",
                                offText: "Exhaust Fan is OFF",
                                onStyle: "border-green-500/50 bg-green-500/10",
                                onBadge: "bg-green-500/20 text-green-400 border border-green-500/30",
                            },
                            {
                                label: "Gas Valve", icon: Pipette,
                                isOn: data.actuators.gasValve,
                                key: "gasValve" as const,
                                onText: "Gas Valve is OPEN",
                                offText: "Gas Valve is CLOSED — emergency shutoff",
                                onStyle: "border-green-500/50 bg-green-500/10",
                                onBadge: "bg-green-500/20 text-green-400 border border-green-500/30",
                            },
                        ].map(({ label, icon: Icon, isOn, key, onText, offText, onStyle, onBadge }) => (
                            <div key={label} className={clsx("border rounded-xl p-5 transition-all", isOn ? onStyle : "border-slate-700/60 bg-slate-800/50")}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center">
                                            <Icon className="w-4.5 h-4.5 text-slate-300" />
                                        </div>
                                        <span className="text-white font-semibold">{label}</span>
                                    </div>
                                    <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-full", isOn ? onBadge : "bg-slate-700 text-slate-400")}>
                                        {isOn ? "ON" : "OFF"}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-xs mb-4">{isOn ? onText : offText}</p>
                                <button
                                    onClick={() => toggleControl(key)}
                                    className={clsx(
                                        "w-full py-2.5 rounded-lg text-sm font-bold transition-colors",
                                        isOn
                                            ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                                            : "bg-cyan-600 hover:bg-cyan-500 text-white"
                                    )}
                                >
                                    {isOn ? "Turn OFF" : "Turn ON"}
                                </button>
                            </div>
                        ))}

                        {/* Servo info */}
                        <div className="border border-slate-700/60 bg-slate-800/50 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center">
                                    <Gauge className="w-4 h-4 text-slate-300" />
                                </div>
                                <span className="text-white font-semibold">Servo Position</span>
                            </div>
                            <div className="text-3xl font-bold text-cyan-400 mb-2">{data.actuators.servoAngle}°</div>
                            <p className="text-slate-500 text-xs">Gas valve servo angle. Controlled automatically based on risk level.</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
