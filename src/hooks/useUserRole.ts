import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { UserRole, UserProfile } from "@/types";

interface UseUserRoleReturn {
    user: User | null;
    profile: UserProfile | null;
    role: UserRole | null;
    loading: boolean;
    profileComplete: boolean;
    logout: () => Promise<void>;
}

export function useUserRole(): UseUserRoleReturn {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data() as UserProfile;
                        setProfile(data);
                        setRole(data.role || "user");
                        setProfileComplete(data.profileComplete ?? false);
                    } else {
                        // Signed up but hasn't created profile yet
                        setProfile(null);
                        setRole(null);
                        setProfileComplete(false);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            } else {
                setProfile(null);
                setRole(null);
                setProfileComplete(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setRole(null);
        setProfileComplete(false);
    };

    return { user, profile, role, loading, profileComplete, logout };
}
