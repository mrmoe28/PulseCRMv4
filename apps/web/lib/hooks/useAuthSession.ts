"use client";

import { useSession } from "next-auth/react";

export function useAuthSession() {
    const { data: session, status } = useSession();

    return {
        user: session?.user,
        isAuthenticated: !!session?.user,
        isLoading: status === "loading",
        organizationId: session?.user?.organizationId,
    };
} 