"use client";

import { useEffect, useState } from "react";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

const GAS_THRESHOLD_PPM = 1000;
const TEMP_THRESHOLD_C = 100;
const HISTORY_LIMIT = 5000;

export interface SensorIncidentRow {
    id: string;
    timestamp: number;
    severity: "CRITICAL" | "HIGH";
    message: string;
    gasPpm: number;
    tempC: number;
}

interface IncidentFeedProps {
    deviceId: string;
}

function buildIncidentsFromHistory(
    raw: Record<string, { gasValue?: number; temperature?: number; humidity?: number }>
): SensorIncidentRow[] {
    const rows: SensorIncidentRow[] = [];

    for (const [tsKey, entry] of Object.entries(raw)) {
        const timestamp = Number(tsKey);
        if (!Number.isFinite(timestamp)) continue;

        const gas = entry.gasValue ?? 0;
        const temp = entry.temperature ?? 0;

        const gasHigh = gas > GAS_THRESHOLD_PPM;
        const tempHigh = temp >= TEMP_THRESHOLD_C;

        if (!gasHigh && !tempHigh) continue;

        const parts: string[] = [];
        if (gasHigh) {
            parts.push(`Gas concentration above ${GAS_THRESHOLD_PPM} ppm (read ${Math.round(gas)} ppm)`);
        }
        if (tempHigh) {
            parts.push(`High temperature (read ${temp.toFixed(1)}°C, threshold ${TEMP_THRESHOLD_C}°C)`);
        }

        const severity: "CRITICAL" | "HIGH" =
            temp >= TEMP_THRESHOLD_C || gas > 2000 ? "CRITICAL" : "HIGH";

        rows.push({
            id: `${timestamp}-${gas}-${temp}`,
            timestamp,
            severity,
            message: parts.join(" · "),
            gasPpm: gas,
            tempC: temp,
        });
    }

    return rows.sort((a, b) => b.timestamp - a.timestamp);
}

export default function IncidentFeed({ deviceId }: IncidentFeedProps) {
    const [incidents, setIncidents] = useState<SensorIncidentRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!deviceId) {
            setLoading(false);
            return;
        }

        const historyRef = query(ref(db, `devices/${deviceId}/history`), limitToLast(HISTORY_LIMIT));

        const unsubscribe = onValue(historyRef, (snapshot) => {
            if (!snapshot.exists()) {
                setIncidents([]);
                setLoading(false);
                return;
            }

            const raw = snapshot.val() as Record<
                string,
                { gasValue?: number; temperature?: number; humidity?: number }
            >;
            setIncidents(buildIncidentsFromHistory(raw));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [deviceId]);

    if (loading) return <div className="text-slate-500 text-sm">Loading sensor history…</div>;

    if (incidents.length === 0) {
        return (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
                <h3 className="text-slate-300 font-medium">No threshold events</h3>
                <p className="text-slate-500 text-sm mt-1">
                    No readings above {GAS_THRESHOLD_PPM} ppm gas or {TEMP_THRESHOLD_C}°C in stored history.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {incidents.map((incident) => (
                <div
                    key={incident.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all bg-red-500/10 border-red-500/30`}
                >
                    <div className="mt-1 p-2 rounded-full bg-red-500/20 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span
                                className={`text-sm font-bold px-2 py-0.5 rounded ${
                                    incident.severity === "CRITICAL"
                                        ? "bg-red-500 text-white"
                                        : "bg-orange-500 text-white"
                                }`}
                            >
                                {incident.severity}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(incident.timestamp).toLocaleString()}
                            </span>
                        </div>

                        <p className="text-slate-300 font-medium mb-2">{incident.message}</p>
                        <p className="text-xs text-slate-500 font-mono">
                            Device: {deviceId} · Gas {Math.round(incident.gasPpm)} ppm · Temp{" "}
                            {incident.tempC.toFixed(1)}°C
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
