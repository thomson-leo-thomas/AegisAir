"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import Sidebar from "@/components/layout/Sidebar";

// These routes render without sidebar and without auth checks
const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/create-profile"];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { user, loading, profileComplete, logout } = useUserRole();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    useEffect(() => {
        if (loading) return;

        if (!user) {
            // Not logged in — redirect to sign-in unless already on a public page
            if (!isPublicRoute) {
                router.push("/sign-in");
            }
            return;
        }

        // Logged in but no profile yet — redirect to create profile
        if (!profileComplete && !pathname.startsWith("/create-profile")) {
            router.push("/create-profile");
            return;
        }

        // Logged in with profile — redirect away from auth pages
        if (profileComplete && isPublicRoute) {
            router.push("/");
        }
    }, [user, loading, profileComplete, pathname, isPublicRoute, router]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-500 animate-ping" />
                    <span className="text-slate-400 text-sm">Initializing AegisAir...</span>
                </div>
            </div>
        );
    }

    // Public routes render without sidebar
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // Authenticated app layout with sidebar
    if (user && profileComplete) {
        return (
            <div className="flex min-h-screen bg-[#0a0d14]">
                <Sidebar onLogout={logout} />
                <main className="flex-1 ml-[168px] min-h-screen overflow-y-auto">
                    {children}
                </main>
            </div>
        );
    }

    // Fallback while redirect is in progress
    return (
        <div className="min-h-screen bg-[#0a0d14]" />
    );
}
