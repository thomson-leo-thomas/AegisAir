"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import AppLogo from "@/components/brand/AppLogo";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // NOTE: No manual router.push here — AppShell's useEffect handles
    // the redirect automatically once useUserRole resolves the profile.

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // AppShell detects the auth state change and redirects based on profileComplete
        } catch (err: any) {
            const messages: Record<string, string> = {
                "auth/user-not-found": "No account found with this email.",
                "auth/wrong-password": "Incorrect password.",
                "auth/invalid-credential": "Invalid email or password.",
                "auth/too-many-requests": "Too many attempts. Please try again later.",
                "auth/invalid-email": "Invalid email address.",
            };
            setError(messages[err.code] || "Sign in failed. Please try again.");
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
                    <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                    <p className="text-slate-500 text-sm mt-1">Sign in to AegisAir</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleSignIn} className="space-y-4">
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
                                    placeholder="Your password"
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
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing In…
                                </span>
                            ) : "Sign In →"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Don't have an account?{" "}
                    <Link href="/sign-up" className="text-cyan-400 hover:text-cyan-300 font-medium transition">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
