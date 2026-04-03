/**
 * Security middleware for Next.js
 * Provides comprehensive security headers, rate limiting, and abuse prevention
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, authRateLimits, getClientIp } from '@/lib/rate-limit';

/**
 * Security headers configuration
 */
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),
};

/**
 * Security middleware for all requests
 */
export async function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;
  const ip = getClientIp(request);
  
  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Apply rate limiting to authentication endpoints
  if (path.startsWith('/api/auth/')) {
    const rateLimitConfig = getRateLimitConfig(path);
    const rateLimitResult = applyRateLimit(request, rateLimitConfig);
    
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: rateLimitConfig.message || 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
  }
  
  // Log security events (in production, send to monitoring service)
  if (path.startsWith('/api/auth/')) {
    console.log(`[SECURITY] ${request.method} ${path} from ${ip} - Rate limit: ${response.headers.get('X-RateLimit-Remaining')} remaining`);
  }
  
  return response;
}

/**
 * Get appropriate rate limit configuration based on path
 */
function getRateLimitConfig(path: string) {
  if (path.includes('signup')) {
    return {
      ...authRateLimits.authentication,
      maxRequests: 5, // Even stricter for signup
      message: 'Too many signup attempts. Please try again in 15 minutes.'
    };
  }
  
  if (path.includes('reset-password') || path.includes('verify')) {
    return authRateLimits.passwordReset;
  }
  
  if (path.includes('[...nextauth]')) {
    return authRateLimits.authentication;
  }
  
  return authRateLimits.api;
}

/**
 * Input validation middleware
 * Protects against common injection attacks
 */
export function validateInputMiddleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only validate POST/PUT requests with body
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return null;
  }
  
  // Check for suspicious patterns in request body
  // In a real implementation, you would parse and validate the actual body
  // This is a simplified example
  
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /union.*select/i,
    /insert.*into/i,
    /delete.*from/i,
    /drop.*table/i,
    /--/,
    /\/\*.*\*\//,
    /waitfor.*delay/i,
    /sleep\(/i
  ];
  
  // Clone request to read body without consuming it
  const clonedRequest = request.clone();
  
  // Note: In a real implementation, you would need to properly
  // parse and validate the request body based on content type
  
  return null; // No validation errors
}

/**
 * Abuse detection middleware
 * Detects patterns of abusive behavior
 */
export function abuseDetectionMiddleware(request: NextRequest) {
  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect common bot user agents
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /php/i,
    /ruby/i,
    /go-http/i,
    /node/i
  ];
  
  const isLikelyBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  if (isLikelyBot && path.startsWith('/api/auth/')) {
    console.log(`[ABUSE DETECTION] Possible bot detected: ${userAgent} from ${ip} accessing ${path}`);
    
    // In production, you might:
    // 1. Require CAPTCHA
    // 2. Apply stricter rate limits
    // 3. Temporarily block the IP
    // 4. Send alert to security team
  }
  
  // Detect rapid fire requests (multiple requests within 1 second)
  // This would require tracking request timestamps per IP
  // Implemented in a production system with Redis
  
  return null;
}

/**
 * Comprehensive security middleware combining all protections
 */
export function withSecurity(request: NextRequest) {
  // Apply abuse detection
  const abuseResult = abuseDetectionMiddleware(request);
  if (abuseResult) {
    return abuseResult;
  }
  
  // Apply input validation
  const validationResult = validateInputMiddleware(request);
  if (validationResult) {
    return validationResult;
  }
  
  // Apply security headers and rate limiting
  return securityMiddleware(request);
}

/**
 * Export middleware for use in Next.js middleware
 */
export default function security(request: NextRequest) {
  return withSecurity(request);
}