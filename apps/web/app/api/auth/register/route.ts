import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addMockOrganization, addMockUser } from "../../../../lib/auth/options";

// Validation schema for registration
const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    organizationName: z.string().min(1, "Organization name is required"),
    organizationSlug: z.string().min(1, "Organization slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

// Mock storage (in production, this would be database)
const mockUsers: any[] = [];
const mockOrganizations: any[] = [];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request data
        const validatedData = registerSchema.parse(body);
        const { email, password, firstName, lastName, organizationName, organizationSlug } = validatedData;

        // Check if user already exists
        const existingUser = mockUsers.find(user => user.email === email);
        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Check if organization slug is taken
        const existingOrg = mockOrganizations.find(org => org.slug === organizationSlug);
        if (existingOrg) {
            return NextResponse.json(
                { error: "Organization slug is already taken" },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await hash(password, 12);

        // Create organization
        const organization = {
            id: `org-${Date.now()}`,
            name: organizationName,
            slug: organizationSlug,
            plan: 'free',
            status: 'active',
            maxUsers: 5,
            maxJobs: 50,
            maxStorageGb: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockOrganizations.push(organization);
        addMockOrganization(organization); // Sync with auth options

        // Create user as organization owner
        const user = {
            id: `user-${Date.now()}`,
            email,
            passwordHash,
            firstName,
            lastName,
            organizationId: organization.id,
            role: 'owner',
            isActive: true,
            emailVerifiedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockUsers.push(user);
        addMockUser(user); // Sync with auth options

        // Return success response (don't include password hash)
        return NextResponse.json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            organization: {
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
                plan: organization.plan,
            },
        }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Export the mock data for use in auth
export { mockOrganizations, mockUsers };

