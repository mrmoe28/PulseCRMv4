import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            organizationId: string;
        };
    }

    interface User {
        id: string;
        email: string;
        name?: string | null;
        image?: string | null;
        organizationId: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        organizationId: string;
    }
} 