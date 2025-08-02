// PDF Viewer Auto-Detection and Selection Utilities
export interface BrowserCapabilities {
    hasNativePDFSupport: boolean;
    supportsWebWorkers: boolean;
    supportsCanvas: boolean;
    supportsInlineFrames: boolean;
    isMobile: boolean;
    browserName: string;
    browserVersion: string;
    hasGoodPerformance: boolean;
}

export interface PDFViewerConfig {
    strategy: 'native' | 'react-pdf' | 'iframe' | 'download';
    settings: {
        enableZoom?: boolean;
        enableSearch?: boolean;
        enableDownload?: boolean;
        enablePrint?: boolean;
        defaultScale?: number;
        showToolbar?: boolean;
        showSidebar?: boolean;
    };
    fallbackStrategy?: string;
}

export interface FileInfo {
    size: number;
    pages?: number;
    complexity?: 'low' | 'medium' | 'high';
    hasInteractiveForms?: boolean;
    hasAnnotations?: boolean;
}

// Browser capability detection
export function detectBrowserCapabilities(): BrowserCapabilities {
    // Server-side fallback
    if (typeof window === 'undefined') {
        return {
            hasNativePDFSupport: false,
            supportsWebWorkers: false,
            supportsCanvas: false,
            supportsInlineFrames: true,
            isMobile: false,
            browserName: 'unknown',
            browserVersion: '0',
            hasGoodPerformance: true,
        };
    }

    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Detect browser
    let browserName = 'unknown';
    let browserVersion = '0';

    if (userAgent.includes('Chrome/')) {
        browserName = 'chrome';
        browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || '0';
    } else if (userAgent.includes('Firefox/')) {
        browserName = 'firefox';
        browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || '0';
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
        browserName = 'safari';
        browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || '0';
    } else if (userAgent.includes('Edge/')) {
        browserName = 'edge';
        browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || '0';
    }

    // Test native PDF support
    const hasNativePDFSupport = (() => {
        try {
            // Check for PDF MIME type support
            const mimeTypes = navigator.mimeTypes;
            for (let i = 0; i < mimeTypes.length; i++) {
                if (mimeTypes[i].type === 'application/pdf') {
                    return true;
                }
            }

            // Fallback: assume modern browsers support PDF
            const modernBrowsers = {
                chrome: 64,
                firefox: 67,
                safari: 12,
                edge: 79,
            };

            const minVersion = modernBrowsers[browserName as keyof typeof modernBrowsers];
            return minVersion ? parseInt(browserVersion) >= minVersion : false;
        } catch {
            return false;
        }
    })();

    // Test Web Workers support
    const supportsWebWorkers = typeof Worker !== 'undefined';

    // Test Canvas support
    const supportsCanvas = (() => {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch {
            return false;
        }
    })();

    // Test iframe support
    const supportsInlineFrames = typeof HTMLIFrameElement !== 'undefined';

    // Estimate performance based on device and browser
    const hasGoodPerformance = (() => {
        // Mobile devices generally have lower performance
        if (isMobile) return false;

        // Check for modern browser versions
        const performantVersions = {
            chrome: 88,
            firefox: 85,
            safari: 14,
            edge: 88,
        };

        const minVersion = performantVersions[browserName as keyof typeof performantVersions];
        if (minVersion && parseInt(browserVersion) >= minVersion) {
            return true;
        }

        // Check hardware concurrency as performance indicator
        if ('hardwareConcurrency' in navigator) {
            return navigator.hardwareConcurrency >= 4;
        }

        return true; // Default to good performance
    })();

    return {
        hasNativePDFSupport,
        supportsWebWorkers,
        supportsCanvas,
        supportsInlineFrames,
        isMobile,
        browserName,
        browserVersion,
        hasGoodPerformance,
    };
}

// Analyze file characteristics
export function analyzeFileInfo(file: File | { size: number; name: string }): FileInfo {
    const sizeInMB = file.size / (1024 * 1024);

    // Estimate complexity based on file size
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (sizeInMB > 10) {
        complexity = 'high';
    } else if (sizeInMB > 2) {
        complexity = 'medium';
    }

    return {
        size: file.size,
        complexity,
        // These would be detected through actual PDF parsing in a real implementation
        hasInteractiveForms: false,
        hasAnnotations: false,
    };
}

// Main function to determine optimal PDF viewer strategy
export function selectOptimalPDFViewer(
    capabilities: BrowserCapabilities,
    fileInfo?: FileInfo,
    userPreferences?: Partial<PDFViewerConfig>
): PDFViewerConfig {
    const {
        hasNativePDFSupport,
        supportsWebWorkers,
        supportsCanvas,
        isMobile,
        hasGoodPerformance
    } = capabilities;

    // Default settings
    const defaultSettings = {
        enableZoom: true,
        enableSearch: false,
        enableDownload: true,
        enablePrint: true,
        defaultScale: 1.0,
        showToolbar: true,
        showSidebar: false,
    };

    // Strategy selection logic
    let strategy: PDFViewerConfig['strategy'] = 'iframe';
    let settings = { ...defaultSettings };
    let fallbackStrategy: string | undefined;

    // For large files or complex PDFs, prefer download on mobile
    if (isMobile && fileInfo && fileInfo.size > 5 * 1024 * 1024) {
        return {
            strategy: 'download',
            settings: {
                enableDownload: true,
            },
            fallbackStrategy: 'iframe',
        };
    }

    // High-performance desktop with modern browser: use react-pdf for best control
    if (hasGoodPerformance && supportsWebWorkers && supportsCanvas && !isMobile) {
        strategy = 'react-pdf';
        settings = {
            ...defaultSettings,
            enableSearch: true,
            showSidebar: true,
        };
        fallbackStrategy = 'iframe';
    }
    // Native PDF support available and good performance: use iframe with native viewer
    else if (hasNativePDFSupport && hasGoodPerformance) {
        strategy = 'iframe';
        settings = {
            ...defaultSettings,
            enableSearch: false, // Native viewer handles this
        };
        fallbackStrategy = 'download';
    }
    // Mobile or limited capabilities: use native browser handling
    else if (isMobile && hasNativePDFSupport) {
        strategy = 'native';
        settings = {
            ...defaultSettings,
            enableDownload: true,
            enablePrint: false,
        };
        fallbackStrategy = 'download';
    }
    // Fallback: download for very limited browsers
    else {
        strategy = 'download';
        settings = {
            ...defaultSettings,
            enableDownload: true,
        };
    }

    // Apply user preferences
    if (userPreferences?.settings) {
        settings = { ...settings, ...userPreferences.settings };
    }

    if (userPreferences?.strategy) {
        // Validate user preference is supported
        const isSupported = validateStrategy(userPreferences.strategy, capabilities);
        if (isSupported) {
            strategy = userPreferences.strategy;
        }
    }

    return {
        strategy,
        settings,
        fallbackStrategy,
    };
}

// Validate if a strategy is supported by current browser
function validateStrategy(strategy: PDFViewerConfig['strategy'], capabilities: BrowserCapabilities): boolean {
    switch (strategy) {
        case 'react-pdf':
            return capabilities.supportsWebWorkers && capabilities.supportsCanvas;
        case 'iframe':
            return capabilities.supportsInlineFrames;
        case 'native':
            return capabilities.hasNativePDFSupport;
        case 'download':
            return true; // Always supported
        default:
            return false;
    }
}

// Performance monitoring for adaptive behavior
export class PDFViewerPerformanceMonitor {
    private metrics: Map<string, number[]> = new Map();

    recordLoadTime(strategy: string, loadTime: number) {
        if (!this.metrics.has(strategy)) {
            this.metrics.set(strategy, []);
        }
        this.metrics.get(strategy)!.push(loadTime);

        // Keep only last 10 measurements
        const times = this.metrics.get(strategy)!;
        if (times.length > 10) {
            times.shift();
        }
    }

    getAverageLoadTime(strategy: string): number {
        const times = this.metrics.get(strategy);
        if (!times || times.length === 0) return 0;

        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    shouldSwitchStrategy(currentStrategy: string, alternativeStrategy: string): boolean {
        const currentAvg = this.getAverageLoadTime(currentStrategy);
        const alternativeAvg = this.getAverageLoadTime(alternativeStrategy);

        // Switch if alternative is significantly faster (>30% improvement)
        return alternativeAvg > 0 && currentAvg > alternativeAvg * 1.3;
    }
}

// Export singleton instance
export const performanceMonitor = new PDFViewerPerformanceMonitor();

// Utility to get user-agent based device info for SSR
export function getServerSideDeviceInfo(userAgent: string): Pick<BrowserCapabilities, 'isMobile' | 'browserName'> {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    let browserName = 'unknown';
    if (userAgent.includes('Chrome/')) {
        browserName = 'chrome';
    } else if (userAgent.includes('Firefox/')) {
        browserName = 'firefox';
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
        browserName = 'safari';
    } else if (userAgent.includes('Edge/')) {
        browserName = 'edge';
    }

    return { isMobile, browserName };
} 