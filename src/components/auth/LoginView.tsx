"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserRole } from "@/types";
import { User, Shield, Flame } from "lucide-react";
import AppLogo from "@/components/brand/AppLogo";

interface LoginViewProps {
    onDemoLogin: (role: UserRole) => void;
}

export default function LoginView({ onDemoLogin }: LoginViewProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError("Invalid credentials. (For demo, use the buttons below)");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-2xl overflow-hidden ring-1 ring-slate-600 bg-[#0a0f1e]">
                            <AppLogo size={64} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                        AegisAir
                    </h1>
                    <p className="text-slate-400">Industrial IoT Safety System</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                            placeholder="admin@aegisair.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-800 text-slate-500">Or simulate role (Demo)</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => onDemoLogin("admin")}
                        className="flex flex-col items-center p-3 bg-slate-900/50 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors group"
                    >
                        <Shield className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-300">Admin</span>
                    </button>
                    <button
                        onClick={() => onDemoLogin("fireforce")}
                        className="flex flex-col items-center p-3 bg-slate-900/50 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors group"
                    >
                        <Flame className="w-6 h-6 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-300">Fireforce</span>
                    </button>
                    <button
                        onClick={() => onDemoLogin("user")}
                        className="flex flex-col items-center p-3 bg-slate-900/50 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors group"
                    >
                        <User className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-300">User</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
