"use client";

import IncidentFeed from "@/components/dashboard/IncidentFeed";
import { useUserRole } from "@/hooks/useUserRole";

export default function IncidentsPage() {
    const { profile } = useUserRole();
    const deviceId = profile?.deviceId || "esp32-001";

    return (
        <div className="p-6 space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white">Incidents</h1>
                <p className="text-slate-500 text-sm mt-0.5">
                    Sensor-driven alerts from stored readings (gas &gt; {1000} ppm or temperature ≥ {100}°C)
                </p>
            </div>
            <IncidentFeed deviceId={deviceId} />
        </div>
    );
}
