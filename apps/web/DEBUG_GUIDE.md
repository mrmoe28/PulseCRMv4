# PulseCRM Debug Guide

This guide covers the debugging features available in PulseCRM for development and troubleshooting.

## Debug Dashboard

### Accessing the Debug Dashboard

1. **Direct URL**: Navigate to `/debug` in your browser
2. **Development Panel**: Press `Ctrl+Shift+D` to toggle the debug panel (development only)

### Debug Dashboard Features

#### 1. System Information
- Environment details (development/production)
- Node.js version
- Platform information
- Browser details
- Screen resolution

#### 2. Authentication State
- Current session status
- User information
- Session details
- OAuth provider status

#### 3. Database Connection
- Connection status (connected/error)
- Database type (in-memory/PostgreSQL)
- Connection testing
- Query performance

#### 4. API Testing
- Test authentication endpoints
- Test database connectivity
- Test tRPC endpoints
- View request/response details

#### 5. Storage Information
- LocalStorage contents
- SessionStorage contents
- Cookie information
- Storage keys and values

#### 6. Console Logs
- Real-time log capture
- Log level filtering (info/warn/error/debug)
- Export logs for analysis
- Clear log history

#### 7. Debug Actions
- Clear all storage
- Clear specific storage items
- Navigation shortcuts
- Cache clearing
- Environment variable viewer

## Debug Utilities

### Using the Debug Logger

```typescript
import { logger, logEvent, logError } from '@/lib/utils/logger';

// Basic logging
logger.info('User logged in', { userId: user.id });
logger.warn('API rate limit approaching');
logger.error('Database connection failed', error);

// Structured logging
logEvent('user_action', { action: 'create_job', jobId: job.id });
logError('Failed to save document', error);

// Performance logging
logger.time('api_call');
// ... perform operation
logger.timeEnd('api_call');
```

### Debug Manager

```typescript
import { debug, perf } from '@/lib/utils/debug';

// Log debug information
debug.info('Processing request', { endpoint: '/api/users' });
debug.error('Request failed', { error: error.message });

// Performance monitoring
const duration = await perf.measureAsync('database_query', async () => {
    return await db.query('SELECT * FROM users');
});

// Export debug data
const debugData = exportDebugData();
```

### API Debugging

```typescript
import { debugApiRequest } from '@/lib/utils/debug';

// Log API requests
debugApiRequest('POST', '/api/users', {
    body: { email: 'user@example.com' },
    response: response,
});
```

## Debug API Endpoints

### Health Check
```bash
GET /api/health
```
Returns system health status including:
- Overall status (healthy/degraded/unhealthy)
- Database connectivity
- Memory usage
- Configuration status
- Missing environment variables

### System Information
```bash
GET /api/debug/system
```
Returns detailed system information:
- Process information
- OS details
- Request headers
- Application health checks

## Debug Configuration

### Environment Variables

```env
# Enable debug mode in production
NEXT_PUBLIC_DEBUG=true

# Enable remote logging
REMOTE_LOGGING_ENABLED=true

# Debug feature flags
DEBUG_SHOW_PERFORMANCE=true
DEBUG_LOG_REQUESTS=true
```

### Debug Config

Configure debugging in `lib/config/debug.ts`:
- Logging levels and limits
- Performance thresholds
- Network debugging options
- Storage tracking settings

## Debug Panel (Development Only)

The debug panel appears as a floating button in development mode:
- Press `Ctrl+Shift+D` to toggle
- View real-time logs
- Monitor network requests
- Inspect storage
- Export debug data

## Best Practices

1. **Use Structured Logging**: Use `logEvent()` for consistent log formatting
2. **Include Context**: Always include relevant data with logs
3. **Performance Monitoring**: Use `perf.measure()` for critical operations
4. **Error Details**: Include stack traces and error context
5. **Clean Up**: Use debug actions to clear storage during testing

## Troubleshooting Common Issues

### Authentication Issues
1. Open `/debug`
2. Check "Authentication State" section
3. Verify session status and user data
4. Use "Clear User Data" if needed

### Database Connection Issues
1. Check `/api/health` endpoint
2. Use "Test Database" button in debug dashboard
3. Verify DATABASE_URL in environment variables

### API Request Failures
1. Enable console log capture
2. Make the failing request
3. Check captured logs for errors
4. Use API testing section to test endpoints

### Performance Issues
1. Enable performance monitoring
2. Check slow operation logs
3. Use browser DevTools Performance tab
4. Export debug data for analysis

## Security Notes

- Debug features are disabled in production by default
- Sensitive data is filtered from logs
- Debug endpoints require authentication in production
- Export feature sanitizes sensitive information