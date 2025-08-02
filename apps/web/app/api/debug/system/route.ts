import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import os from 'os';

export async function GET() {
    try {
        const headersList = headers();
        
        // System information
        const systemInfo = {
            platform: process.platform,
            arch: process.arch,
            version: process.version,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            env: process.env.NODE_ENV,
            cwd: process.cwd(),
            pid: process.pid,
            versions: process.versions,
            features: process.features,
        };

        // OS information
        const osInfo = {
            hostname: os.hostname(),
            type: os.type(),
            platform: os.platform(),
            release: os.release(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpus: os.cpus().length,
            loadAverage: os.loadavg(),
            uptime: os.uptime(),
            networkInterfaces: Object.keys(os.networkInterfaces()),
        };

        // Request information
        const requestInfo = {
            headers: Object.fromEntries(headersList.entries()),
            url: headersList.get('x-url') || 'unknown',
            method: 'GET',
            timestamp: new Date().toISOString(),
        };

        // Application health checks
        const healthChecks = {
            database: await checkDatabase(),
            auth: await checkAuth(),
            storage: await checkStorage(),
            api: true, // If we got here, API is working
        };

        return NextResponse.json({
            success: true,
            system: systemInfo,
            os: osInfo,
            request: requestInfo,
            health: healthChecks,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Debug system error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

async function checkDatabase(): Promise<{ status: string; message?: string }> {
    try {
        // Import database module dynamically to avoid initialization issues
        const { getDatabase } = await import('../../../../lib/database');
        const db = await getDatabase();
        
        // Simple query to check connection
        const result = await db.query('SELECT 1 as test');
        
        return {
            status: 'connected',
            message: 'Database connection successful',
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Database check failed',
        };
    }
}

async function checkAuth(): Promise<{ status: string; providers?: string[] }> {
    try {
        // Check if NextAuth is configured
        const { authOptions } = await import('../../../../lib/auth/options');
        const providers = authOptions.providers?.map((p: any) => p.id || p.name) || [];
        
        return {
            status: 'configured',
            providers,
        };
    } catch (error) {
        return {
            status: 'error',
        };
    }
}

async function checkStorage(): Promise<{ status: string; type?: string }> {
    try {
        // Check storage configuration
        const storageType = process.env.STORAGE_TYPE || 'local';
        
        return {
            status: 'configured',
            type: storageType,
        };
    } catch (error) {
        return {
            status: 'error',
        };
    }
}