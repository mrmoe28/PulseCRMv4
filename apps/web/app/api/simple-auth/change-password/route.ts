import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateUserPassword, updateUserPassword } from "@/lib/database-postgres";
import { sendPasswordChangedEmail } from "@/lib/email";

const changePasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters")
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('Password change attempt for:', body.email);

        // Validate input
        const validationResult = changePasswordSchema.safeParse(body);
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

        const { email, currentPassword, newPassword } = validationResult.data;

        // Validate current password
        const user = await validateUserPassword(email, currentPassword);
        if (!user) {
            console.log('Current password validation failed for:', email);
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 401 }
            );
        }

        // Update password
        const updated = await updateUserPassword(email, newPassword);
        if (!updated) {
            console.log('Failed to update password for:', email);
            return NextResponse.json(
                { error: "Failed to update password" },
                { status: 500 }
            );
        }

        console.log('Password changed successfully for:', email);

        // Send notification email
        await sendPasswordChangedEmail(email);

        return NextResponse.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Password change error:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

        return NextResponse.json(
            {
                error: "Internal server error",
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            },
            { status: 500 }
        );
    }
}
