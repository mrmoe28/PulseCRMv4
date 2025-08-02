// Error filter to suppress known non-critical errors in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const originalError = console.error;
  
  console.error = (...args) => {
    // Filter out known non-critical errors
    const errorString = args.join(' ');
    
    // List of errors to suppress
    const suppressedErrors = [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      'Hydration failed because the initial UI does not match',
    ];
    
    const shouldSuppress = suppressedErrors.some(error => 
      errorString.includes(error)
    );
    
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };
}

export {};