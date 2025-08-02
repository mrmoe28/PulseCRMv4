import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateUserPassword } from "@/lib/database-postgres";
import { sendPasswordChangedEmail } from "@/lib/email";
import fs from 'fs/promises';
import path from 'path';

const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    email: z.string().email("Invalid email address"),
    newPassword: z.string().min(8, "Password must be at least 8 characters")
});

const TOKENS_FILE = path.join(process.cwd(), 'data', 'reset-tokens.json');

async function validateResetToken(email: string, token: string): Promise<boolean> {
    try {
        const data = JSON.parse(await fs.readFile(TOKENS_FILE, 'utf8'));
        const tokenEntry = data.tokens.find((t: any) => 
            t.email === email && 
            t.token === token && 
            new Date(t.expiresAt) > new Date()
        );
        
        if (tokenEntry) {
            // Remove used token
            data.tokens = data.tokens.filter((t: any) => t.token !== token);
            await fs.writeFile(TOKENS_FILE, JSON.stringify(data, null, 2));
            return true;
        }
        
        return false;
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('Password reset attempt for:', body.email);

        // Validate input
        const validationResult = resetPasswordSchema.safeParse(body);
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

        const { token, email, newPassword } = validationResult.data;

        // Validate token
        const isValidToken = await validateResetToken(email, token);
        if (!isValidToken) {
            console.log('Invalid or expired token for:', email);
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
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

        console.log('Password reset successfully for:', email);

        // Send notification email
        await sendPasswordChangedEmail(email);

        return NextResponse.json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            },
            { status: 500 }
        );
    }
}
