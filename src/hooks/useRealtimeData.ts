"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ref, onValue, update, query, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";
import { calcRiskScore, classifyRisk, RiskLevel } from "@/lib/riskCalculator";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeviceStatus = "ONLINE" | "OFFLINE";

export interface AnomalyState {
    active: boolean;
    message: string | null;
    sensorFault: boolean;
}

export interface HistoryEntry {
    timestamp: number;
    gas: number;
    temp: number;
    humidity: number;
    risk: number; // computed on web, never stored in DB
}

export interface DeviceData {
    gas: { value: number; trend: "up" | "down" | "stable"; spike: boolean };
    temperature: { value: number; trend: "up" | "down" | "stable" };
    humidity: { value: number; trend: "up" | "down" | "stable" };
    riskScore: number;        // computed on web, NOT written to DB
    riskLevel: RiskLevel;     // computed on web
    actuators: {
        buzzer: boolean;
        exhaust: boolean;
        gasValve: boolean;      // true = OPEN
        servoAngle: number;
    };
    controls: {
        manualOverride: boolean;
        forceBuzzer: boolean;
        forceExhaust: boolean;
        forceValveClose: boolean;
    };
    lastUpdate: number;
    deviceStatus: DeviceStatus;
    anomaly: AnomalyState;
    history: HistoryEntry[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultAnomaly: AnomalyState = { active: false, message: null, sensorFault: false };

const defaultData: DeviceData = {
    gas: { value: 0, trend: "stable", spike: false },
    temperature: { value: 0, trend: "stable" },
    humidity: { value: 0, trend: "stable" },
    riskScore: 0,
    riskLevel: "SAFE",
    actuators: { buzzer: false, exhaust: false, gasValve: true, servoAngle: 0 },
    controls: { manualOverride: false, forceBuzzer: false, forceExhaust: false, forceValveClose: false },
    lastUpdate: 0,
    deviceStatus: "OFFLINE",
    anomaly: defaultAnomaly,
    history: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTrend(current: number, previous: number | undefined): "up" | "down" | "stable" {
    if (previous === undefined) return "stable";
    if (current > previous + 0.5) return "up";
    if (current < previous - 0.5) return "down";
    return "stable";
}

/** True if temperature is physically impossible for this system */
function isInvalidTemp(t: number) {
    return t < 0 || t > 80;
}

// ─── Anomaly Detection ────────────────────────────────────────────────────────
// Runs entirely on the web layer. No DB writes.

const STUCK_READINGS_THRESHOLD = 20;   // 20 identical readings ≈ 5 min at 15 s/reading
const OFFLINE_THRESHOLD_MS = 10_000;   // 10 seconds

function detectAnomalies(
    gasVal: number,
    tempVal: number,
    humVal: number,
    recentReadings: number[] // sliding window of last N gas readings
): AnomalyState {
    // A. Invalid readings
    if (gasVal === 0 && humVal === 0) {
        return { active: true, message: "Sensor offline or returning zero values", sensorFault: true };
    }
    if (isInvalidTemp(tempVal)) {
        return { active: true, message: `Temperature out of range: ${tempVal}°C`, sensorFault: true };
    }
    if (humVal === 0) {
        return { active: true, message: "Humidity sensor may be disconnected", sensorFault: false };
    }

    // B. Flatline / stuck detection (last N readings all identical)
    if (
        recentReadings.length >= STUCK_READINGS_THRESHOLD &&
        recentReadings.every((v) => v === recentReadings[0])
    ) {
        return { active: true, message: "Gas sensor may be stuck — readings unchanged for 5 minutes", sensorFault: true };
    }

    return defaultAnomaly;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRealtimeData(deviceId: string) {
    const [data, setData] = useState<DeviceData>(defaultData);
    const [loading, setLoading] = useState(true);

    // Trend tracking (previous values)
    const prevGas = useRef<number | undefined>(undefined);
    const prevTemp = useRef<number | undefined>(undefined);
    const prevHum = useRef<number | undefined>(undefined);

    // Sliding window for stuck-sensor detection
    const gasWindow = useRef<number[]>([]);

    // ── Live device data listener ──────────────────────────────────────────────
    useEffect(() => {
        if (!deviceId) return;

        const deviceRef = ref(db, `devices/${deviceId}`);

        const unsubscribe = onValue(deviceRef, (snapshot) => {
            if (!snapshot.exists()) {
                setLoading(false);
                return;
            }

            const val = snapshot.val();

            // Extract raw sensor values (handle flat or nested ESP formats)
            const gasVal: number = val.gas?.value ?? val.gasValue ?? 0;
            const tempVal: number = val.temperature?.value ?? val.temperature ?? 0;
            const humVal: number = val.humidity?.value ?? val.humidity ?? 0;

            // Spike flag written by ESP: devices/{id}/gas/spike
            const spikeFlag: boolean = val.gas?.spike ?? false;

            // ── Risk calculation (web only, never written to DB) ──
            const riskScore = calcRiskScore(gasVal, tempVal, humVal, spikeFlag);
            const riskLevel = classifyRisk(riskScore);

            // ── Trends ──
            const gasTrend = getTrend(gasVal, prevGas.current);
            const tempTrend = getTrend(tempVal, prevTemp.current);
            const humTrend = getTrend(humVal, prevHum.current);

            prevGas.current = gasVal;
            prevTemp.current = tempVal;
            prevHum.current = humVal;

            // ── Sliding window for anomaly detection ──
            gasWindow.current = [...gasWindow.current.slice(-STUCK_READINGS_THRESHOLD + 1), gasVal];

            // ── Device health ──
            const lastUpdate: number = val.lastUpdate ?? 0;
            const deviceStatus: DeviceStatus =
                Date.now() - lastUpdate < OFFLINE_THRESHOLD_MS ? "ONLINE" : "OFFLINE";

            // ── Anomaly detection (web layer) ──
            const anomaly = detectAnomalies(gasVal, tempVal, humVal, gasWindow.current);

            setData((prev) => {
                // Handle actuators from either nested or flat structure, and strings ("ON", "OFF", "OPEN", "CLOSED")
                const rawActuators = val.actuators || {};
                const parseBool = (v: any) => v === true || v === "ON" || v === "OPEN" || v === "1" || v === 1;

                const actuators = {
                    buzzer: rawActuators.buzzer !== undefined ? parseBool(rawActuators.buzzer) : (val.buzzer !== undefined ? parseBool(val.buzzer) : prev.actuators.buzzer),
                    exhaust: rawActuators.exhaust !== undefined ? parseBool(rawActuators.exhaust) : (val.exhaust !== undefined ? parseBool(val.exhaust) : prev.actuators.exhaust),
                    gasValve: rawActuators.gasValve !== undefined ? parseBool(rawActuators.gasValve) : (val.gasValve !== undefined ? parseBool(val.gasValve) : prev.actuators.gasValve),
                    servoAngle: Number(rawActuators.servoAngle ?? val.servoAngle ?? prev.actuators.servoAngle),
                };

                return {
                    ...prev,
                    gas: { value: gasVal, trend: gasTrend, spike: spikeFlag },
                    temperature: { value: tempVal, trend: tempTrend },
                    humidity: { value: humVal, trend: humTrend },
                    riskScore,
                    riskLevel,
                    actuators,
                    controls: val.controls ?? prev.controls,
                    lastUpdate,
                    deviceStatus,
                    anomaly,
                };
            });

            setLoading(false);
        });

        return () => unsubscribe();
    }, [deviceId]);

    // ── History listener (ESP pushes every 15 s) ──────────────────────────────
    useEffect(() => {
        if (!deviceId) return;

        const historyRef = query(
            ref(db, `devices/${deviceId}/history`),
            limitToLast(25000)
        );

        const unsubscribe = onValue(historyRef, (snapshot) => {
            if (!snapshot.exists()) return;

            const raw = snapshot.val() as Record<string, { gasValue: number; temperature: number; humidity: number }>;

            const entries: HistoryEntry[] = Object.entries(raw)
                .map(([ts, entry]) => ({
                    timestamp: Number(ts),
                    gas: entry.gasValue ?? 0,
                    temp: entry.temperature ?? 0,
                    humidity: entry.humidity ?? 0,
                    // Compute risk per historical entry using the real formula
                    // No spike bonus for historical entries (ESP doesn't store spike in history)
                    risk: parseFloat(calcRiskScore(entry.gasValue ?? 0, entry.temperature ?? 0, entry.humidity ?? 0, false).toFixed(1)),
                }))
                .sort((a, b) => a.timestamp - b.timestamp);

            setData((prev) => ({ ...prev, history: entries }));
        });

        return () => unsubscribe();
    }, [deviceId]);

    // ── Actuator control (writes ONLY to controls/ — never touches riskScore) ──
    const toggleControl = useCallback(
        async (control: "manualOverride" | "buzzer" | "exhaust" | "gasValve") => {
            if (!deviceId) return;

            const updates: Record<string, boolean> = {};

            if (control === "manualOverride") {
                updates[`devices/${deviceId}/controls/manualOverride`] = !data.controls.manualOverride;
            } else if (control === "buzzer") {
                updates[`devices/${deviceId}/controls/forceBuzzer`] = !data.controls.forceBuzzer;
                if (data.controls.manualOverride) {
                    updates[`devices/${deviceId}/actuators/buzzer`] = !data.actuators.buzzer;
                }
            } else if (control === "exhaust") {
                updates[`devices/${deviceId}/controls/forceExhaust`] = !data.controls.forceExhaust;
                if (data.controls.manualOverride) {
                    updates[`devices/${deviceId}/actuators/exhaust`] = !data.actuators.exhaust;
                }
            } else if (control === "gasValve") {
                const targetState = !data.actuators.gasValve;
                updates[`devices/${deviceId}/controls/forceValveClose`] = !targetState;
                if (data.controls.manualOverride) {
                    updates[`devices/${deviceId}/actuators/gasValve`] = targetState;
                }
            }

            try {
                await update(ref(db), updates);
            } catch (err) {
                console.error("Control update failed:", err);
            }
        },
        [deviceId, data]
    );

    return { data, loading, toggleControl };
}
