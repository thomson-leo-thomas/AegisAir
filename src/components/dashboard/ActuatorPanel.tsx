"use client";

import { Volume2, Fan, Pipette, Gauge, Power } from "lucide-react";
import { motion } from "motion/react";

interface ActuatorPanelProps {
    buzzer: boolean;
    exhaust: boolean;
    gasValve: boolean; // true = OPEN
    servoAngle: number;
    manualOverride: boolean;
    onToggle: (actuator: "buzzer" | "exhaust" | "gasValve" | "manualOverride") => void;
    role: "admin" | "fireforce" | "user";
}

export default function ActuatorPanel({
    buzzer,
    exhaust,
    gasValve,
    servoAngle,
    manualOverride,
    onToggle,
    role,
}: ActuatorPanelProps) {
    const isAdmin = role === "admin";

    const ControlButton = ({
        label,
        icon: Icon,
        isActive,
        color,
        onClick,
        disabled = false,
    }: {
        label: string;
        icon: any;
        isActive: boolean;
        color: string;
        onClick: () => void;
        disabled?: boolean;
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${isActive
                    ? `bg-${color}-500/20 border-${color}-500/50 text-${color}-400`
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
            <Icon className={`w-6 h-6 mb-2 ${isActive ? `text-${color}-400` : "text-slate-400"}`} />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs mt-1">{isActive ? "ON" : "OFF"}</span>
        </button>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Manual Override (Admin Only) */}
            <div className={`col-span-2 md:col-span-1 p-4 rounded-xl border ${manualOverride ? "bg-purple-500/20 border-purple-500/50" : "bg-slate-800/50 border-slate-700"} flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">Manual Override</span>
                    <Power className={`w-5 h-5 ${manualOverride ? "text-purple-400" : "text-slate-500"}`} />
                </div>
                <p className="text-xs text-slate-500 mb-3">Enable to control actuators manually.</p>
                <button
                    onClick={() => isAdmin && onToggle("manualOverride")}
                    disabled={!isAdmin}
                    className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${manualOverride
                            ? "bg-purple-500 text-white hover:bg-purple-600"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        } ${!isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {manualOverride ? "ENABLED" : "DISABLED"}
                </button>
            </div>

            <ControlButton
                label="Buzzer"
                icon={Volume2}
                isActive={buzzer}
                color="red"
                onClick={() => onToggle("buzzer")}
                disabled={!manualOverride || !isAdmin}
            />

            <ControlButton
                label="Exhaust Fan"
                icon={Fan}
                isActive={exhaust}
                color="green"
                onClick={() => onToggle("exhaust")}
                disabled={!manualOverride || !isAdmin}
            />

            <ControlButton
                label="Gas Valve"
                icon={Pipette}
                isActive={gasValve}
                color="blue"
                onClick={() => onToggle("gasValve")}
                disabled={!manualOverride || !isAdmin}
            />
        </div>
    );
}
