import { NextRequest, NextResponse } from "next/server";
import { createUser, getAllUsers } from "../../../lib/database-postgres";

export async function GET(request: NextRequest) {
    try {
        const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
        const hasPostgres = !!process.env.POSTGRES_URL;

        console.log('Database test endpoint called');
        console.log('Environment:', {
            isVercel,
            hasPostgres,
            nodeEnv: process.env.NODE_ENV,
            platform: process.platform
        });

        // Get all users to test read functionality
        const users = await getAllUsers();

        return NextResponse.json({
            success: true,
            environment: isVercel ? 'Vercel' : 'Local',
            databaseType: hasPostgres ? 'Postgres' : (isVercel ? 'Memory' : 'File'),
            userCount: users.length,
            users: users.map(u => ({ id: u.id, email: u.email, name: `${u.firstName} ${u.lastName}` })),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Database test error:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

        return NextResponse.json(
            {
                error: "Database test failed",
                details: error instanceof Error ? error.message : String(error),
                environment: process.env.VERCEL === '1' ? 'Vercel' : 'Local'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { testUser } = await request.json();

        if (testUser) {
            // Create a test user
            const result = await createUser({
                email: `test-${Date.now()}@vercel.com`,
                password: 'testpassword123',
                firstName: 'Test',
                lastName: 'User',
                organizationName: 'Test Org'
            });

            return NextResponse.json({
                success: true,
                message: 'Test user created successfully',
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: `${result.user.firstName} ${result.user.lastName}`
                }
            });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    } catch (error) {
        console.error("Database test POST error:", error);

        return NextResponse.json(
            {
                error: "Database test POST failed",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
} 