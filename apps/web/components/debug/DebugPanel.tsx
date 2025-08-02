'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { debug, exportDebugData } from '../../lib/utils/debug';

export function DebugPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'logs' | 'network' | 'storage'>('logs');

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    useEffect(() => {
        // Check for debug keyboard shortcut (Ctrl+Shift+D)
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                setIsOpen(!isOpen);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            // Update logs periodically
            const interval = setInterval(() => {
                setLogs(debug.getLogs({ limit: 50 }));
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    onClick={() => setIsOpen(true)}
                    size="sm"
                    variant="outline"
                    className="bg-white dark:bg-gray-800 shadow-lg"
                >
                    Debug
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-white dark:bg-gray-900 border-l border-t border-gray-200 dark:border-gray-700 shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">Debug Panel</h3>
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            const data = exportDebugData();
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `debug-${new Date().toISOString()}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        size="sm"
                        variant="outline"
                    >
                        Export
                    </Button>
                    <Button
                        onClick={() => setIsOpen(false)}
                        size="sm"
                        variant="ghost"
                    >
                        ×
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'logs'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Logs
                </button>
                <button
                    onClick={() => setActiveTab('network')}
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'network'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Network
                </button>
                <button
                    onClick={() => setActiveTab('storage')}
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'storage'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Storage
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'logs' && (
                    <div className="space-y-2">
                        {logs.length === 0 ? (
                            <p className="text-gray-500 text-sm">No logs yet...</p>
                        ) : (
                            logs.map((log, index) => (
                                <div
                                    key={index}
                                    className={`text-xs font-mono p-2 rounded ${
                                        log.level === 'error'
                                            ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                            : log.level === 'warn'
                                            ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            : log.level === 'debug'
                                            ? 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    }`}
                                >
                                    <div className="flex justify-between">
                                        <span className="font-semibold">[{log.level.toUpperCase()}]</span>
                                        <span className="text-gray-500">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="mt-1">{log.message}</div>
                                    {log.data && (
                                        <pre className="mt-1 text-xs overflow-auto">
                                            {JSON.stringify(log.data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'network' && (
                    <div className="text-sm text-gray-500">
                        Network logging coming soon...
                    </div>
                )}

                {activeTab === 'storage' && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">LocalStorage</h4>
                            <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto">
                                {JSON.stringify(
                                    Object.fromEntries(
                                        Object.entries(localStorage).map(([key, value]) => {
                                            try {
                                                return [key, JSON.parse(value)];
                                            } catch {
                                                return [key, value];
                                            }
                                        })
                                    ),
                                    null,
                                    2
                                )}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}