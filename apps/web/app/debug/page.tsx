'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useSession } from 'next-auth/react';

interface SystemInfo {
    environment: string;
    nodeVersion: string;
    platform: string;
    userAgent: string;
    screenResolution: string;
    timestamp: string;
}

interface DatabaseInfo {
    status: 'checking' | 'connected' | 'error';
    message?: string;
    error?: string;
}

export default function DebugPage() {
    const { data: session, status: sessionStatus } = useSession();
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo>({ status: 'checking' });
    const [apiTestResult, setApiTestResult] = useState<any>(null);
    const [showEnvVars, setShowEnvVars] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Capture console logs
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            setLogs(prev => [...prev, `[LOG] ${new Date().toISOString()}: ${args.join(' ')}`]);
            originalLog(...args);
        };
        console.error = (...args) => {
            setLogs(prev => [...prev, `[ERROR] ${new Date().toISOString()}: ${args.join(' ')}`]);
            originalError(...args);
        };
        console.warn = (...args) => {
            setLogs(prev => [...prev, `[WARN] ${new Date().toISOString()}: ${args.join(' ')}`]);
            originalWarn(...args);
        };

        // Get system information
        setSystemInfo({
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version || 'unknown',
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timestamp: new Date().toISOString()
        });

        // Get localStorage data
        const userData = localStorage.getItem('pulse_user');
        const sessionActive = localStorage.getItem('pulse_session_active');
        const allLocalStorage: Record<string, any> = {};
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const value = localStorage.getItem(key);
                allLocalStorage[key] = value;
            }
        }

        setDebugInfo({
            userData: userData ? JSON.parse(userData) : null,
            sessionActive,
            userDataRaw: userData,
            localStorageKeys: Object.keys(localStorage),
            allLocalStorage,
            sessionStorage: Object.keys(sessionStorage),
            cookies: document.cookie,
            timestamp: new Date().toISOString()
        });

        // Test database connection
        testDatabaseConnection();

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    const testDatabaseConnection = async () => {
        try {
            const response = await fetch('/api/test-db');
            const data = await response.json();
            
            if (response.ok) {
                setDatabaseInfo({
                    status: 'connected',
                    message: data.message || 'Database connected successfully',
                    ...data
                });
            } else {
                setDatabaseInfo({
                    status: 'error',
                    error: data.error || 'Database connection failed'
                });
            }
        } catch (error) {
            setDatabaseInfo({
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    const testApiEndpoint = async (endpoint: string) => {
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            setApiTestResult({
                endpoint,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            setApiTestResult({
                endpoint,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    };

    const clearStorage = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const exportDebugData = () => {
        const debugData = {
            systemInfo,
            debugInfo,
            databaseInfo,
            session,
            sessionStatus,
            apiTestResult,
            logs,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pulse-debug-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Debug Dashboard</h1>
                    <Button onClick={exportDebugData} variant="outline">
                        Export Debug Data
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* System Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-64">
                                {JSON.stringify(systemInfo, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>

                    {/* Authentication State */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Authentication State</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <strong>Status:</strong> {sessionStatus}
                                </p>
                                <p className="text-sm">
                                    <strong>Session:</strong> {session ? 'Active' : 'None'}
                                </p>
                                {session && (
                                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-64">
                                        {JSON.stringify(session, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Database Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Database Connection</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <strong>Status:</strong>{' '}
                                    <span className={
                                        databaseInfo.status === 'connected' ? 'text-green-600' :
                                        databaseInfo.status === 'error' ? 'text-red-600' :
                                        'text-yellow-600'
                                    }>
                                        {databaseInfo.status}
                                    </span>
                                </p>
                                {databaseInfo.message && (
                                    <p className="text-sm text-gray-600">{databaseInfo.message}</p>
                                )}
                                {databaseInfo.error && (
                                    <p className="text-sm text-red-600">{databaseInfo.error}</p>
                                )}
                                <Button 
                                    onClick={testDatabaseConnection} 
                                    variant="outline" 
                                    size="sm"
                                    className="mt-2"
                                >
                                    Retest Connection
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* API Testing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>API Endpoint Testing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Button 
                                    onClick={() => testApiEndpoint('/api/auth/session')} 
                                    variant="outline"
                                    size="sm"
                                >
                                    Test Auth Session
                                </Button>
                                <Button 
                                    onClick={() => testApiEndpoint('/api/test-db')} 
                                    variant="outline"
                                    size="sm"
                                >
                                    Test Database
                                </Button>
                                <Button 
                                    onClick={() => testApiEndpoint('/api/trpc/auth.getCurrentUser')} 
                                    variant="outline"
                                    size="sm"
                                >
                                    Test tRPC
                                </Button>
                            </div>
                            {apiTestResult && (
                                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-48 mt-2">
                                    {JSON.stringify(apiTestResult, null, 2)}
                                </pre>
                            )}
                        </CardContent>
                    </Card>

                    {/* Local Storage */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Storage Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto max-h-64">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>

                    {/* Console Logs */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Console Logs</CardTitle>
                                <Button onClick={clearLogs} variant="outline" size="sm">
                                    Clear Logs
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-auto max-h-64">
                                {logs.length === 0 ? (
                                    <p className="text-gray-500">No logs captured yet...</p>
                                ) : (
                                    logs.map((log, index) => (
                                        <div key={index} className={
                                            log.includes('[ERROR]') ? 'text-red-400' :
                                            log.includes('[WARN]') ? 'text-yellow-400' :
                                            'text-gray-100'
                                        }>
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Debug Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button onClick={clearStorage} variant="outline">
                                    Clear All Storage
                                </Button>
                                <Button 
                                    onClick={() => localStorage.removeItem('pulse_user')} 
                                    variant="outline"
                                >
                                    Clear User Data
                                </Button>
                                <Button onClick={() => window.location.href = '/auth'} variant="outline">
                                    Go to Login
                                </Button>
                                <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
                                    Go to Dashboard
                                </Button>
                                <Button 
                                    onClick={() => setShowEnvVars(!showEnvVars)} 
                                    variant="outline"
                                >
                                    {showEnvVars ? 'Hide' : 'Show'} Env Vars
                                </Button>
                                <Button 
                                    onClick={() => window.location.reload()} 
                                    variant="outline"
                                >
                                    Reload Page
                                </Button>
                                <Button 
                                    onClick={() => {
                                        if ('caches' in window) {
                                            caches.keys().then(names => {
                                                names.forEach(name => caches.delete(name));
                                                alert('Caches cleared!');
                                            });
                                        }
                                    }} 
                                    variant="outline"
                                >
                                    Clear Caches
                                </Button>
                                <Button 
                                    onClick={() => {
                                        console.log('Test log message');
                                        console.warn('Test warning message');
                                        console.error('Test error message');
                                    }} 
                                    variant="outline"
                                >
                                    Test Logging
                                </Button>
                            </div>

                            {showEnvVars && (
                                <Card className="mt-4">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Environment Variables (Public Only)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
                                            {JSON.stringify({
                                                NODE_ENV: process.env.NODE_ENV,
                                                NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
                                                // Add other public env vars as needed
                                            }, null, 2)}
                                        </pre>
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}