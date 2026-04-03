/**
 * Simple in-memory rate limiting middleware
 * In production, use Redis or a dedicated rate limiting service
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Error message
  skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor(private cleanupMs: number = 60000) {
    // Clean up old entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), cleanupMs);
  }

  /**
   * Check if request is allowed
   */
  check(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / config.windowMs)}`;
    
    if (!this.store[windowKey]) {
      this.store[windowKey] = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }

    const entry = this.store[windowKey];
    
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const oldKeys = Object.keys(this.store).filter(key => {
      const entry = this.store[key];
      return entry.resetTime < now - this.cleanupMs;
    });
    
    oldKeys.forEach(key => delete this.store[key]);
  }

  /**
   * Destroy the rate limiter (clear interval)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store = {};
  }
}

// Create a singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware for Next.js API routes
 */
export function rateLimit(config: RateLimitConfig) {
  return function handler(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const path = new URL(req.url).pathname;
    const key = `${ip}:${path}`;

    const result = rateLimiter.check(key, {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      message: config.message,
      skipFailedRequests: config.skipFailedRequests
    });

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    return null; // No rate limit violation
  };
}

/**
 * Authentication-specific rate limits
 */
export const authRateLimits = {
  // Strict limits for signup/login
  authentication: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.'
  },
  
  // More lenient for general API access
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many API requests. Please slow down.'
  },
  
  // Very strict for password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 attempts per hour
    message: 'Too many password reset attempts. Please try again later.'
  }
};

/**
 * Get client IP from request
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Check if request should be rate limited based on path
 */
export function shouldRateLimit(path: string): boolean {
  const rateLimitedPaths = [
    '/api/auth/signup',
    '/api/auth/[...nextauth]',
    '/api/auth/reset-password',
    '/api/auth/verify'
  ];
  
  return rateLimitedPaths.some(limitedPath => path.startsWith(limitedPath));
}

/**
 * Apply rate limiting to API route
 */
export function applyRateLimit(req: Request, config: RateLimitConfig = authRateLimits.authentication) {
  const ip = getClientIp(req);
  const path = new URL(req.url).pathname;
  const key = `${ip}:${path}`;
  
  return rateLimiter.check(key, config);
}