"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    BarChart2,
    Settings,
    AlertTriangle,
    FileText,
    User,
    LogOut,
} from "lucide-react";
import AppLogo from "@/components/brand/AppLogo";
import { clsx } from "clsx";

const navItems = [
    { label: "Overview", href: "/", icon: LayoutGrid },
    { label: "Analytics", href: "/analytics", icon: BarChart2 },
    { label: "Control Panel", href: "/control-panel", icon: Settings },
    { label: "Incidents", href: "/incidents", icon: AlertTriangle },
    { label: "Reports", href: "/reports", icon: FileText },
    { label: "Profile", href: "/profile", icon: User },
];

interface SidebarProps {
    onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-[168px] bg-[#0d1117] border-r border-slate-800 flex flex-col z-40">
            {/* Branding */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#0a0f1e] ring-1 ring-slate-700/80 flex items-center justify-center flex-shrink-0">
                    <AppLogo size={36} className="scale-110" />
                </div>
                <div>
                    <div className="text-white font-bold text-sm leading-tight">AegisAir</div>
                    <div className="text-slate-500 text-[10px] leading-tight">Fire Risk Monitor</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 space-y-0.5 px-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive =
                        href === "/" ? pathname === "/" : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                            )}
                        >
                            <Icon
                                className={clsx(
                                    "w-4 h-4 flex-shrink-0",
                                    isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                                )}
                            />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-2 pb-5 border-t border-slate-800 pt-3">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 w-full transition-all"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
