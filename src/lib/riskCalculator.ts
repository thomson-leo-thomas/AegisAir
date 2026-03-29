/**
 * AegisAir Risk Calculation Engine (Web Layer)
 *
 * The ESP32 sends: gasValue, temperature, humidity, lastUpdate,
 * actuator states, and gas/spike (boolean).
 *
 * The web layer owns: risk scoring, anomaly detection, device health.
 * riskScore is NEVER written back to Firebase — it is UI/analytics only.
 */

// Arduino-style map()
function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

// ─── Step 1: Normalize each sensor to 0–100 ──────────────────────────────────

/** Gas: safe ≤ 800 ppm, dangerous ≥ 2000 ppm */
export function calcGasScore(gas: number): number {
    return clamp(mapRange(gas, 800, 2000, 0, 100), 0, 100);
}

/** Temperature: risk starts at 30 °C */
export function calcTempScore(temp: number): number {
    return clamp(mapRange(temp, 30, 60, 0, 100), 0, 100);
}

/** Humidity: low humidity → higher fire risk */
export function calcHumidityScore(humidity: number): number {
    return clamp(mapRange(100 - humidity, 40, 100, 0, 100), 0, 100);
}

// ─── Step 2: Weighted combination ────────────────────────────────────────────

export function calcBaseRisk(gas: number, temp: number, humidity: number): number {
    return (
        calcGasScore(gas) * 0.5 +
        calcTempScore(temp) * 0.3 +
        calcHumidityScore(humidity) * 0.2
    );
}

// ─── Step 3: Full risk score ───────────────────────────────────────────────
/**
 * @param gas      Gas concentration (ppm)
 * @param temp     Temperature (°C)
 * @param humidity Relative humidity (%)
 * @param gasSpike Whether ESP32 detected a spike (ΔGas > 200 ppm in 10 s)
 *                 Spike detection runs on ESP; web only reads the flag.
 */
export function calcRiskScore(
    gas: number,
    temp: number,
    humidity: number,
    gasSpike: boolean = false
): number {
    let risk = calcBaseRisk(gas, temp, humidity);
    if (gasSpike) risk += 10; // Sudden leak penalty
    return clamp(risk, 0, 100);
}

// ─── Step 4: Classification ───────────────────────────────────────────────

export type RiskLevel = "SAFE" | "WARNING" | "HIGH" | "CRITICAL";

export function classifyRisk(riskScore: number): RiskLevel {
    if (riskScore < 30) return "SAFE";
    if (riskScore < 60) return "WARNING";
    if (riskScore < 80) return "HIGH";
    return "CRITICAL";
}

export function getRiskColor(level: RiskLevel) {
    switch (level) {
        case "SAFE": return { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", hex: "#06b6d4" };
        case "WARNING": return { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", hex: "#eab308" };
        case "HIGH": return { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", hex: "#f97316" };
        case "CRITICAL": return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", hex: "#ef4444" };
    }
}
