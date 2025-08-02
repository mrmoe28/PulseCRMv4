import { NextRequest } from 'next/server';

// Simple in-memory rate limiter for production
// For scalable production, use Redis or Upstash
const rateLimit = new Map();

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Skip rate limiting in development
  if (process.env.NODE_ENV !== 'production') {
    return { success: true, limit: config.uniqueTokenPerInterval, remaining: config.uniqueTokenPerInterval, reset: 0 };
  }

  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  const token = `${ip}:${request.nextUrl.pathname}`;
  
  const now = Date.now();
  const windowStart = Math.floor(now / config.interval) * config.interval;
  const windowEnd = windowStart + config.interval;
  
  const key = `${token}:${windowStart}`;
  const current = rateLimit.get(key) || 0;
  
  // Clean old entries
  for (const [k, _] of rateLimit) {
    const timestamp = parseInt(k.split(':').pop() || '0');
    if (timestamp < windowStart - config.interval) {
      rateLimit.delete(k);
    }
  }
  
  if (current >= config.uniqueTokenPerInterval) {
    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset: windowEnd,
    };
  }
  
  rateLimit.set(key, current + 1);
  
  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - current - 1,
    reset: windowEnd,
  };
}

// Middleware helper
export async function rateLimitMiddleware(
  request: NextRequest,
  config?: RateLimitConfig
) {
  const { success, limit, remaining, reset } = await checkRateLimit(request, config);
  
  const response = new Response(
    success ? null : JSON.stringify({ error: 'Too many requests' }),
    { status: success ? 200 : 429 }
  );
  
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  
  return { success, response };
}
