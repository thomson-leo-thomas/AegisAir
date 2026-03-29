"use client";

import { useEffect, useMemo, useState } from "react";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { db } from "@/lib/firebase";
import { useUserRole } from "@/hooks/useUserRole";
import { calcRiskScore } from "@/lib/riskCalculator";
import { Download } from "lucide-react";

const HISTORY_LIMIT = 25000;

type ExportRange = "1h" | "24h" | "7d";

function escapeCsvField(s: string): string {
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

function buildCsvRows(
    raw: Record<string, { gasValue?: number; temperature?: number; humidity?: number }>,
    fromMs: number
): { line: string }[] {
    const rows: { ts: number; line: string }[] = [];

    for (const [tsKey, entry] of Object.entries(raw)) {
        const timestamp = Number(tsKey);
        if (!Number.isFinite(timestamp) || timestamp < fromMs) continue;

        const gas = entry.gasValue ?? 0;
        const temp = entry.temperature ?? 0;
        const humidity = entry.humidity ?? 0;
        const risk = parseFloat(calcRiskScore(gas, temp, humidity, false).toFixed(1));
        const iso = new Date(timestamp).toISOString();

        const line = [
            escapeCsvField(iso),
            String(gas),
            String(temp),
            String(humidity),
            String(risk),
        ].join(",");

        rows.push({ ts: timestamp, line });
    }

    rows.sort((a, b) => a.ts - b.ts);
    return rows.map((r) => ({ line: r.line }));
}

export default function ReportsPage() {
    const { profile } = useUserRole();
    const deviceId = profile?.deviceId || "esp32-001";
    const [exportRange, setExportRange] = useState<ExportRange>("1h");
    const [historyRaw, setHistoryRaw] = useState<Record<
        string,
        { gasValue?: number; temperature?: number; humidity?: number }
    > | null>(null);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        if (!deviceId) {
            setHistoryLoading(false);
            return;
        }

        const historyRef = query(ref(db, `devices/${deviceId}/history`), limitToLast(HISTORY_LIMIT));

        const unsub = onValue(historyRef, (snapshot) => {
            if (!snapshot.exists()) {
                setHistoryRaw({});
                setHistoryLoading(false);
                return;
            }
            setHistoryRaw(snapshot.val() as Record<string, { gasValue?: number; temperature?: number; humidity?: number }>);
            setHistoryLoading(false);
        });

        return () => unsub();
    }, [deviceId]);

    const rangeFromMs = useMemo(() => {
        const now = Date.now();
        if (exportRange === "1h") return now - 60 * 60 * 1000;
        if (exportRange === "24h") return now - 24 * 60 * 60 * 1000;
        return now - 7 * 24 * 60 * 60 * 1000;
    }, [exportRange]);

    const filteredCount = useMemo(() => {
        if (!historyRaw) return 0;
        return buildCsvRows(historyRaw, rangeFromMs).length;
    }, [historyRaw, rangeFromMs]);

    const downloadCsv = () => {
        if (!historyRaw || Object.keys(historyRaw).length === 0) return;

        const header = "timestamp_iso,gas_ppm,temperature_c,humidity_percent,risk_score";
        const body = buildCsvRows(historyRaw, rangeFromMs)
            .map((r) => r.line)
            .join("\n");
        const csv = `${header}\n${body}`;

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `aegisair-${deviceId}-${exportRange}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-2">Reports</h1>
            <p className="text-slate-500 text-sm mb-6">
                Export sensor readings from Firebase Realtime Database as CSV (same fields as device history).
            </p>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-6 space-y-5 max-w-xl">
                <div>
                    <div className="text-xs text-slate-500 mb-1">Device</div>
                    <div className="font-mono text-sm text-cyan-400">{deviceId}</div>
                </div>

                <div>
                    <div className="text-sm text-slate-300 mb-2">Time range</div>
                    <div className="flex flex-wrap gap-2">
                        {([
                            ["1h", "1h" as const, "Last hour"],
                            ["24h", "24h" as const, "Last 24 hours"],
                            ["7d", "7d" as const, "Last 7 days"],
                        ] as const).map(([key, val, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setExportRange(val)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                    exportRange === val
                                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                                        : "text-slate-400 border border-slate-700 hover:border-slate-600"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="text-sm text-slate-400">
                    {historyLoading
                        ? "Loading history…"
                        : `Rows in range: ${filteredCount} (from stored history; older data may not exist if the device has not logged that far back).`}
                </div>

                <button
                    type="button"
                    onClick={downloadCsv}
                    disabled={historyLoading || filteredCount === 0}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                    <Download className="w-4 h-4" />
                    Download CSV
                </button>
            </div>
        </div>
    );
}
