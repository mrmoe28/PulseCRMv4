import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "../../../../lib/database-postgres";

const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().min(1, "First name is required").refine(val => val.trim().length > 0, "First name is required"),
    lastName: z.string().min(1, "Last name is required").refine(val => val.trim().length > 0, "Last name is required"),
    organizationName: z.string().min(1, "Organization name is required").refine(val => val.trim().length > 0, "Organization name is required"),
    organizationSlug: z.string().optional()
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('Signup attempt:', {
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            organizationName: body.organizationName
        });

        // Validate input
        const validationResult = signupSchema.safeParse(body);
        if (!validationResult.success) {
            console.log('Validation failed:', validationResult.error.errors);
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        const { email, password, firstName, lastName, organizationName, organizationSlug } = validationResult.data;

        // Create user and organization
        const result = await createUser({
            email,
            password,
            firstName,
            lastName,
            organizationName,
            organizationSlug
        });

        console.log('User created successfully:', {
            userId: result.user.id,
            email: result.user.email,
            organizationId: result.organization.id,
            organizationName: result.organization.name
        });

        return NextResponse.json({
            success: true,
            message: "Account created successfully",
            user: {
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                name: `${result.user.firstName} ${result.user.lastName}`,
                organizationId: result.user.organizationId,
                organizationName: result.user.organizationName,
            },
            organization: result.organization
        });

    } catch (error) {
        console.error("Signup error:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("Environment:", {
            isVercel: process.env.VERCEL === '1',
            nodeEnv: process.env.NODE_ENV,
            platform: process.platform
        });

        if (error instanceof Error) {
            if (error.message.includes('already exists')) {
                return NextResponse.json(
                    { error: "An account with this email already exists" },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            {
                error: "Internal server error",
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            },
            { status: 500 }
        );
    }
} 