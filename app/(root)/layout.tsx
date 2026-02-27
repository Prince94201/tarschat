"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { isLoaded, userId } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const syncUser = useMutation(api.users.syncUser);

    useOnlineStatus();

    useEffect(() => {
        if (isLoaded && !userId) {
            router.push("/sign-in");
        }
    }, [isLoaded, userId, router]);

    useEffect(() => {
        if (user) {
            syncUser({
                name: user.fullName || "Unknown",
                email: user.primaryEmailAddress?.emailAddress || "",
                imageUrl: user.imageUrl,
                clerkId: user.id
            }).catch(console.error);
        }
    }, [user, syncUser]);

    if (!isLoaded || !userId) {
        return null;
    }

    const isConversationPage = pathname.startsWith("/conversation/");

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <div
                className={`${isConversationPage ? "hidden md:flex" : "flex"
                    } w-full md:w-[320px] lg:w-[380px] shrink-0 border-r h-full`}
            >
                <Sidebar />
            </div>

            <div
                className={`${!isConversationPage ? "hidden md:flex" : "flex"
                    } flex-1 overflow-hidden h-full`}
            >
                {children}
            </div>
        </div>
    );
}
