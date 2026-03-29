"use client";

import { useMemo, useState } from "react";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { useUserRole } from "@/hooks/useUserRole";
import type { HistoryEntry } from "@/hooks/useRealtimeData";
import { TrendingUp, TrendingDown, Wifi, WifiOff, Volume2, Fan, Pipette, Gauge } from "lucide-react";
import { motion } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function barHeightsFromHistory(
  history: HistoryEntry[],
  key: "gas" | "temp" | "humidity",
  count: number
): number[] {
  const slice = history.slice(-count);
  if (slice.length === 0) return [];
  const vals = slice.map((h) => (key === "gas" ? h.gas : key === "temp" ? h.temp : h.humidity));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  return vals.map((v) => Math.round(15 + ((v - min) / span) * 85));
}

export default function OverviewPage() {
  const { profile } = useUserRole();
  const deviceId = profile?.deviceId || "esp32-001";
  const { data } = useRealtimeData(deviceId);
  const [timeRange, setTimeRange] = useState<"10min" | "1hour" | "24hours">("10min");

  const trendData = useMemo(() => {
    const cutoffMs =
      timeRange === "10min"
        ? Date.now() - 10 * 60 * 1000
        : timeRange === "1hour"
          ? Date.now() - 60 * 60 * 1000
          : Date.now() - 24 * 60 * 60 * 1000;

    return data.history
      .filter((e) => e.timestamp >= cutoffMs)
      .map((e) => ({
        time: new Date(e.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        risk: e.risk,
      }));
  }, [data.history, timeRange]);

  const getRiskStyle = (risk: number) => {
    if (risk < 30) return { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", label: "SAFE" };
    if (risk < 60) return { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", label: "WARNING" };
    if (risk < 80) return { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", label: "HIGH" };
    return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "CRITICAL" };
  };

  const rs = getRiskStyle(data.riskScore);

  const sensorSparkConfig = [
    { label: "Gas Sensor", value: data.gas.value, unit: "ppm", trend: data.gas.trend, color: "cyan" as const, key: "gas" as const },
    { label: "Temperature", value: data.temperature.value, unit: "°C", trend: data.temperature.trend, color: "orange" as const, key: "temp" as const },
    { label: "Humidity", value: data.humidity.value, unit: "%", trend: data.humidity.trend, color: "blue" as const, key: "humidity" as const },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time environmental monitoring</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs">
          {data.deviceStatus === "ONLINE"
            ? <><Wifi className="w-3 h-3 text-green-400" /><span className="text-green-400 font-medium">LIVE</span></>
            : <><WifiOff className="w-3 h-3 text-red-400" /><span className="text-red-400 font-medium">OFFLINE</span></>
          }
        </div>
      </div>

      {/* Fire Risk Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${rs.bg} border ${rs.border} rounded-2xl p-6`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Gauge */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full -rotate-90">
              <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="10" fill="none" className="text-slate-700/40" />
              <motion.circle
                cx="72" cy="72" r="62"
                stroke="currentColor" strokeWidth="10" fill="none"
                strokeDasharray={`${(data.riskScore / 100) * 389.6} 389.6`}
                className={rs.text}
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 389.6" }}
                animate={{ strokeDasharray: `${(data.riskScore / 100) * 389.6} 389.6` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${rs.text}`}>{Math.round(data.riskScore)}%</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Risk</span>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">Fire Risk Index</h2>
            <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold ${rs.bg} border ${rs.border} ${rs.text}`}>
              {rs.label}
            </span>
            <p className="text-slate-500 text-xs max-w-xs">
              Computed from gas concentration, temperature, humidity, and rate of rise.
            </p>
          </div>

          {/* Device Meta */}
          <div className="ml-auto hidden sm:flex flex-col items-end gap-2">
            <div className="text-xs text-slate-500">Device ID</div>
            <div className="font-mono text-sm text-cyan-500">{deviceId}</div>
            <div className="text-xs text-slate-500">Last Update</div>
            <div className="text-xs text-slate-400">
              {data.lastUpdate ? new Date(data.lastUpdate).toLocaleString() : "—"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sensorSparkConfig.map(({ label, value, unit, trend, color, key }, i) => {
          const barColor = color === "cyan" ? "bg-cyan-500" : color === "orange" ? "bg-orange-500" : "bg-blue-500";
          const trendUp = trend === "up";
          const heights = barHeightsFromHistory(data.history, key, 20);
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">{label}</span>
                {trend !== "stable" && (
                  trendUp
                    ? <TrendingUp className="w-4 h-4 text-red-400" />
                    : <TrendingDown className="w-4 h-4 text-green-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-3xl font-bold text-white">{value.toFixed(label === "Temperature" ? 1 : 0)}</span>
                <span className="text-slate-500 text-sm">{unit}</span>
              </div>
              <div className="h-10 flex items-end gap-[2px]">
                {heights.length > 0 ? (
                  heights.map((h, j) => (
                    <div
                      key={j}
                      className={`flex-1 rounded-sm ${barColor}/40`}
                      style={{ height: `${h}%` }}
                    />
                  ))
                ) : (
                  <div className="w-full text-xs text-slate-600 flex items-center h-10">No Firebase history yet for spark bars</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Actuators Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Buzzer", icon: Volume2, on: data.actuators.buzzer, onColor: "text-red-400 bg-red-500/20 border-red-500/30", offColor: "text-slate-500 bg-slate-700/40 border-slate-700" },
          { label: "Exhaust", icon: Fan, on: data.actuators.exhaust, onColor: "text-green-400 bg-green-500/20 border-green-500/30", offColor: "text-slate-500 bg-slate-700/40 border-slate-700" },
          { label: "Gas Valve", icon: Pipette, on: data.actuators.gasValve, onColor: "text-green-400 bg-green-500/20 border-green-500/30", offColor: "text-red-400 bg-red-500/20 border-red-500/30", labelOn: "OPEN", labelOff: "CLOSED" },
          { label: "Servo", icon: Gauge, on: true, onColor: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30", offColor: "", angle: data.actuators.servoAngle },
        ].map(({ label, icon: Icon, on, onColor, offColor, labelOn, labelOff, angle }) => (
          <div key={label} className={`bg-slate-800/50 border border-slate-700/60 rounded-xl p-4`}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center">
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-slate-300 text-sm font-medium">{label}</span>
            </div>
            {angle !== undefined ? (
              <span className={`text-xl font-bold ${onColor.split(" ")[0]}`}>{angle}°</span>
            ) : (
              <span className={`text-xs font-bold px-2 py-1 rounded border ${on ? onColor : offColor}`}>
                {on ? (labelOn || "ON") : (labelOff || "OFF")}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Risk Trend Chart */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Risk Trend Analysis</h3>
          <div className="flex gap-1.5">
            {([
              ["10min", "10min" as const],
              ["1hour", "1hour" as const],
              ["24hours", "24hours" as const],
            ] as const).map(([label, r]) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${timeRange === r ? "bg-slate-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
              >
                {label === "10min" ? "10 min" : label === "1hour" ? "1 hour" : "24 hours"}
              </button>
            ))}
          </div>
        </div>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fill: "#475569", fontSize: 10 }} interval={Math.max(0, Math.floor(trendData.length / 12))} />
              <YAxis stroke="#475569" tick={{ fill: "#475569", fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9", fontSize: 12 }} />
              <Line type="monotone" dataKey="risk" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-slate-600 text-sm">
            No risk history in Firebase for this time range yet.
          </div>
        )}
      </div>
    </div>
  );
}
