import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useOnlineStatus() {
    const setOnlineStatus = useMutation(api.users.setOnlineStatus);

    useEffect(() => {
        // Set online on mount
        setOnlineStatus({ isOnline: true }).catch(console.error);

        const handleUnload = () => {
            setOnlineStatus({ isOnline: false }).catch(console.error);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                setOnlineStatus({ isOnline: false }).catch(console.error);
            } else {
                setOnlineStatus({ isOnline: true }).catch(console.error);
            }
        };

        window.addEventListener("beforeunload", handleUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            setOnlineStatus({ isOnline: false }).catch(console.error);
        };
    }, [setOnlineStatus]);
}
