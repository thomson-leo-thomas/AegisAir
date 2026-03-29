"use client";

import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { User, Phone, MapPin, Cpu } from "lucide-react";
import AppLogo from "@/components/brand/AppLogo";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Puducherry", "Chandigarh",
];

export default function CreateProfilePage() {
    const router = useRouter();
    const [uid, setUid] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        city: "",
        state: "",
        deviceId: "",
    });

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/sign-in");
                return;
            }
            setUid(user.uid);
            setEmail(user.email || "");
        });
        return () => unsub();
    }, [router]);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const validateStep1 = () => {
        if (!form.fullName.trim()) return "Full name is required.";
        if (!form.phone.trim() || !/^[+\d\s\-()]{7,15}$/.test(form.phone))
            return "Enter a valid phone number.";
        return null;
    };

    const validateStep2 = () => {
        if (!form.city.trim()) return "City is required.";
        if (!form.state) return "State is required.";
        return null;
    };

    const handleNextStep = () => {
        const err = validateStep1();
        if (err) { setError(err); return; }
        setError("");
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const err = validateStep2();
        if (err) { setError(err); return; }
        if (!uid) return;

        setLoading(true);
        setError("");

        try {
            await setDoc(doc(firestore, "users", uid), {
                uid,
                email,
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                city: form.city.trim(),
                state: form.state,
                role: "user", // All new accounts default to 'user'
                deviceId: form.deviceId.trim() || "esp32-001",
                createdAt: Date.now(),
                profileComplete: true,
            });
            // Sign out immediately — user must sign in to access the dashboard
            await signOut(auth);
            router.replace("/sign-in");
        } catch (err) {
            console.error(err);
            setError("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputCls =
        "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition";

    return (
        <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4 rounded-2xl overflow-hidden ring-1 ring-cyan-500/20 shadow-lg shadow-cyan-500/10 bg-[#0a0f1e]">
                        <AppLogo size={56} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Your Profile</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Complete setup to access the dashboard
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6 justify-center">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s < step
                                        ? "bg-green-500 text-white"
                                        : s === step
                                            ? "bg-cyan-500 text-white"
                                            : "bg-slate-700 text-slate-400"
                                    }`}
                            >
                                {s < step ? "✓" : s}
                            </div>
                            {s < 2 && (
                                <div
                                    className={`w-16 h-0.5 ${s < step ? "bg-cyan-500" : "bg-slate-700"
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1 — Personal Info */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="pb-3 border-b border-slate-700/60 mb-1">
                                    <h2 className="text-white font-semibold flex items-center gap-2">
                                        <User className="w-4 h-4 text-cyan-400" /> Personal Information
                                    </h2>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Used for emergency contact and identification
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.fullName}
                                        onChange={(e) => handleChange("fullName", e.target.value)}
                                        placeholder="John Doe"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">
                                        Phone Number *{" "}
                                        <span className="text-slate-600 text-xs">(emergency contact)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2 — Location & Device */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="pb-3 border-b border-slate-700/60 mb-1">
                                    <h2 className="text-white font-semibold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-cyan-400" /> Location & Device
                                    </h2>
                                    <p className="text-slate-500 text-xs mt-1">
                                        For regional monitoring and device association
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">City *</label>
                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={(e) => handleChange("city", e.target.value)}
                                        placeholder="Mumbai"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">State *</label>
                                    <select
                                        value={form.state}
                                        onChange={(e) => handleChange("state", e.target.value)}
                                        className={`${inputCls} cursor-pointer`}
                                    >
                                        <option value="" disabled>
                                            Select state…
                                        </option>
                                        {INDIAN_STATES.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">
                                        <span className="flex items-center gap-1.5">
                                            <Cpu className="w-3.5 h-3.5 inline" /> Device ID{" "}
                                            <span className="text-slate-600 text-xs">(optional)</span>
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.deviceId}
                                        onChange={(e) => handleChange("deviceId", e.target.value)}
                                        placeholder="esp32-001 (default)"
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            {step === 2 && (
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setError(""); }}
                                    className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition"
                                >
                                    ← Back
                                </button>
                            )}
                            {step === 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 transition-all shadow-lg shadow-cyan-500/20"
                                >
                                    {loading ? "Saving Profile…" : "Complete Setup →"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
