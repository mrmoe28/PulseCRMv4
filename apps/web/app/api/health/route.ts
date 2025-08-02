import { NextResponse } from 'next/server';

export async function GET() {
    const healthChecks: Record<string, any> = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || 'unknown',
    };

    // Database check
    try {
        const { getDatabase } = await import('../../../lib/database');
        const db = await getDatabase();
        await db.query('SELECT 1');
        healthChecks.database = { status: 'healthy' };
    } catch (error) {
        healthChecks.database = { 
            status: 'unhealthy', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
        healthChecks.status = 'degraded';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    healthChecks.memory = {
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
    };

    // Check critical environment variables
    const requiredEnvVars = [
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
    ];

    const missingEnvVars = requiredEnvVars.filter(
        varName => !process.env[varName]
    );

    if (missingEnvVars.length > 0) {
        healthChecks.configuration = {
            status: 'unhealthy',
            missingEnvVars,
        };
        healthChecks.status = 'unhealthy';
    } else {
        healthChecks.configuration = { status: 'healthy' };
    }

    const statusCode = healthChecks.status === 'healthy' ? 200 : 
                      healthChecks.status === 'degraded' ? 206 : 503;

    return NextResponse.json(healthChecks, { status: statusCode });
}