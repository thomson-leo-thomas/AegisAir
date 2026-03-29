"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import AppLogo from "@/components/brand/AppLogo";

export default function SignUpPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Do NOT create Firestore doc here — redirect to Create Profile
            router.push("/create-profile");
        } catch (err: any) {
            const messages: Record<string, string> = {
                "auth/email-already-in-use": "An account with this email already exists.",
                "auth/invalid-email": "Invalid email address.",
                "auth/weak-password": "Password is too weak.",
            };
            setError(messages[err.code] || "Sign up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4 rounded-2xl overflow-hidden ring-1 ring-cyan-500/20 shadow-lg shadow-cyan-500/10 bg-[#0a0f1e]">
                        <AppLogo size={56} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-slate-500 text-sm mt-1">Join AegisAir Safety Network</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleSignUp} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Strength indicator */}
                            <div className="flex gap-1 mt-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-all ${password.length === 0 ? "bg-slate-700"
                                                : password.length < 6 && i === 1 ? "bg-red-500"
                                                    : password.length >= 6 && i <= 2 ? "bg-yellow-500"
                                                        : password.length >= 10 && i <= 3 ? "bg-green-500"
                                                            : "bg-slate-700"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-1.5">Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your password"
                                required
                                className={`w-full bg-slate-900 border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none transition ${confirmPassword && confirmPassword !== password
                                        ? "border-red-500 focus:border-red-500"
                                        : confirmPassword && confirmPassword === password
                                            ? "border-green-500 focus:border-green-500"
                                            : "border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                                    }`}
                            />
                            {confirmPassword && confirmPassword !== password && (
                                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 mt-2"
                        >
                            {loading ? "Creating Account…" : "Create Account →"}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-cyan-400 hover:text-cyan-300 font-medium transition">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
