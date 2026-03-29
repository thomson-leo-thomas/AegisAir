"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import { auth, firestore } from "@/lib/firebase";
import { useUserRole } from "@/hooks/useUserRole";
import { User, Mail, MapPin, Cpu, Hash } from "lucide-react";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Puducherry", "Chandigarh",
];

export default function ProfilePage() {
    const { user, loading: authLoading } = useUserRole();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [city, setCity] = useState("");
    const [stateVal, setStateVal] = useState("");
    const [deviceId, setDeviceId] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

    useEffect(() => {
        if (!user?.uid) return;

        const unsub = onSnapshot(doc(firestore, "users", user.uid), (snap) => {
            if (!snap.exists()) return;
            const d = snap.data();
            setFullName((d.fullName as string) || "");
            setEmail((d.email as string) || user.email || "");
            setCity((d.city as string) || "");
            setStateVal((d.state as string) || "");
            setDeviceId((d.deviceId as string) || "");
        });

        return () => unsub();
    }, [user?.uid, user?.email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) return;

        setSaving(true);
        setMessage(null);

        try {
            const payload = {
                fullName: fullName.trim(),
                email: email.trim(),
                city: city.trim(),
                state: stateVal.trim(),
                deviceId: deviceId.trim() || "esp32-001",
            };

            await updateDoc(doc(firestore, "users", user.uid), payload);

            const cu = auth.currentUser;
            if (cu && email.trim() && cu.email !== email.trim()) {
                try {
                    await updateEmail(cu, email.trim());
                } catch {
                    setMessage({
                        type: "ok",
                        text: "Profile saved to Firestore. Email sign-in address was not changed — update it from Firebase Auth settings if required.",
                    });
                    setSaving(false);
                    return;
                }
            }

            setMessage({ type: "ok", text: "Profile updated." });
        } catch (err) {
            console.error(err);
            setMessage({ type: "err", text: "Could not save profile. Check your connection and permissions." });
        } finally {
            setSaving(false);
        }
    };

    const inputCls =
        "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition";

    if (authLoading) {
        return (
            <div className="p-6 text-slate-500 text-sm">Loading profile…</div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 text-slate-500 text-sm">Sign in to view your profile.</div>
        );
    }

    return (
        <div className="p-6 max-w-xl">
            <h1 className="text-2xl font-bold text-white mb-2">Profile</h1>
            <p className="text-slate-500 text-sm mb-6">Your account details stay in sync with Firebase.</p>

            <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-6 space-y-4">
                <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                        <Hash className="w-3.5 h-3.5" /> User ID
                    </label>
                    <input type="text" readOnly value={user.uid} className={`${inputCls} text-slate-500 cursor-not-allowed`} />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                        <Cpu className="w-3.5 h-3.5" /> Device ID
                    </label>
                    <input
                        type="text"
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                        placeholder="esp32-001"
                        className={inputCls}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                        <User className="w-3.5 h-3.5" /> Full name
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputCls}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                        <Mail className="w-3.5 h-3.5" /> Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm text-slate-400 mb-1.5">
                            <MapPin className="w-3.5 h-3.5" /> City
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">State</label>
                        <select
                            value={stateVal}
                            onChange={(e) => setStateVal(e.target.value)}
                            className={`${inputCls} cursor-pointer`}
                        >
                            <option value="">Select state…</option>
                            {INDIAN_STATES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {message && (
                    <div
                        className={`rounded-xl px-4 py-3 text-sm ${
                            message.type === "ok"
                                ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-200"
                                : "bg-red-500/10 border border-red-500/30 text-red-400"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 transition-all"
                >
                    {saving ? "Saving…" : "Save changes"}
                </button>
            </form>
        </div>
    );
}
