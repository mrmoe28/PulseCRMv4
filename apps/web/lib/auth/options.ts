import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Import mock data (in production, this would be database calls)
const mockUsers: any[] = [];
const mockOrganizations: any[] = [];

// Function to get updated mock data from registration API
async function getMockData() {
    try {
        // In a real app, this would be database queries
        // For now, we'll use the in-memory storage
        return { users: mockUsers, organizations: mockOrganizations };
    } catch (error) {
        console.error("Error fetching mock data:", error);
        return { users: [], organizations: [] };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Get current mock data
                    const { users } = await getMockData();

                    // Look for user by email
                    const user = users.find(u => u.email === credentials.email);

                    if (!user) {
                        // Check for test user (backwards compatibility)
                        if (credentials.email === "test@example.com" && credentials.password === "password") {
                            return {
                                id: "test-user-1",
                                email: credentials.email,
                                name: "Test User",
                                organizationId: "test-org-1",
                            };
                        }
                        return null;
                    }

                    // Check password
                    const isValid = await compare(credentials.password, user.passwordHash);

                    if (!isValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: `${user.firstName} ${user.lastName}`,
                        organizationId: user.organizationId,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/auth",
        error: "/auth/error",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Persist the organizationId to the token right after signin
            if (user) {
                token.organizationId = user.organizationId;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            if (token && session.user) {
                session.user.id = token.sub!;
                session.user.organizationId = token.organizationId;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url;
            return `${baseUrl}/dashboard`;
        },
    },
    events: {
        async signIn(message) {
            // Update last login timestamp
            console.log("User signed in:", message.user.email);
            // TODO: Update database with last login timestamp
        },
    },
};

// Export functions to sync mock data
export function addMockUser(user: any) {
    mockUsers.push(user);
}

export function addMockOrganization(org: any) {
    mockOrganizations.push(org);
} 