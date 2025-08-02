import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail } from "@/lib/database-postgres";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address")
});

// Simple file-based storage for reset tokens
const TOKENS_FILE = path.join(process.cwd(), 'data', 'reset-tokens.json');

async function ensureTokensFile() {
    try {
        await fs.access(TOKENS_FILE);
    } catch {
        await fs.mkdir(path.dirname(TOKENS_FILE), { recursive: true });
        await fs.writeFile(TOKENS_FILE, JSON.stringify({ tokens: [] }));
    }
}

async function saveResetToken(email: string, token: string) {
    await ensureTokensFile();
    const data = JSON.parse(await fs.readFile(TOKENS_FILE, 'utf8'));
    
    // Remove any existing tokens for this email
    data.tokens = data.tokens.filter((t: any) => t.email !== email);
    
    // Add new token with 1 hour expiry
    data.tokens.push({
        email,
        token,
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    });
    
    await fs.writeFile(TOKENS_FILE, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('Forgot password request for:', body.email);

        // Validate input
        const validationResult = forgotPasswordSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Please enter a valid email address" },
                { status: 400 }
            );
        }

        const { email } = validationResult.data;

        // Check if user exists
        const user = await findUserByEmail(email);
        
        // Always return success to prevent email enumeration
        if (!user) {
            console.log('User not found, but returning success for security');
            return NextResponse.json({
                success: true,
                message: "If an account exists, reset instructions have been sent"
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Save token to file (in production, this would be in a database)
        await saveResetToken(email, resetToken);

        // Generate reset link with proper base URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                       (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3010');
        const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        
        console.log('==================================');
        console.log('PASSWORD RESET LINK GENERATED');
        console.log('Email:', email);
        console.log('Reset Link:', resetLink);
        console.log('Token expires in 1 hour');
        console.log('==================================');

        // Send email
        await sendPasswordResetEmail(email, resetLink);

        // In development, also save to a file for easy access
        const resetLinksFile = path.join(process.cwd(), 'data', 'reset-links.txt');
        const timestamp = new Date().toISOString();
        const linkEntry = `\n${timestamp} - ${email}\n${resetLink}\n`;
        await fs.appendFile(resetLinksFile, linkEntry).catch(() => {});

        return NextResponse.json({
            success: true,
            message: "Reset instructions sent successfully",
            // In development only - remove in production!
            developmentLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
