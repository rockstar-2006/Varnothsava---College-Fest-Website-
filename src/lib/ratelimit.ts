/**
 * Rate Limiting Configuration
 * Protects against brute force attacks and DDoS
 */

// For development/testing without Redis, we'll use an in-memory store
// In production, you should use Upstash Redis

class InMemoryRateLimiter {
    private requests: Map<string, { count: number; resetTime: number }> = new Map();

    async limit(identifier: string, maxRequests: number, windowMs: number): Promise<{ success: boolean; remaining: number }> {
        const now = Date.now();
        const record = this.requests.get(identifier);

        // Clean up expired entries
        if (record && now > record.resetTime) {
            this.requests.delete(identifier);
        }

        const current = this.requests.get(identifier);

        if (!current) {
            // First request in window
            this.requests.set(identifier, {
                count: 1,
                resetTime: now + windowMs,
            });
            return { success: true, remaining: maxRequests - 1 };
        }

        if (current.count >= maxRequests) {
            // Rate limit exceeded
            return { success: false, remaining: 0 };
        }

        // Increment count
        current.count++;
        this.requests.set(identifier, current);
        return { success: true, remaining: maxRequests - current.count };
    }

    // Cleanup old entries periodically
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.requests.entries()) {
            if (now > value.resetTime) {
                this.requests.delete(key);
            }
        }
    }
}

// Create singleton instance
const inMemoryLimiter = new InMemoryRateLimiter();

// Cleanup every 5 minutes
if (typeof window === 'undefined') {
    setInterval(() => inMemoryLimiter.cleanup(), 5 * 60 * 1000);
}

/**
 * Rate limit for login attempts
 * 5 attempts per 15 minutes per IP
 */
export async function checkLoginRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
    // In production with Upstash Redis, use this:
    /*
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const { Redis } = await import('@upstash/redis');
      
      const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        analytics: true,
        prefix: 'ratelimit:login',
      });
      
      const result = await ratelimit.limit(identifier);
      return { success: result.success, remaining: result.remaining };
    }
    */

    // Development: Relaxed limits for local testing/showcase
    const isDev = process.env.NODE_ENV === 'development' || !process.env.UPSTASH_REDIS_REST_URL;
    const maxRequests = isDev ? 1000 : 5;
    return inMemoryLimiter.limit(identifier, maxRequests, 15 * 60 * 1000);
}

/**
 * Rate limit for registration attempts
 * 10 attempts per hour for local, 3 for prod
 */
export async function checkRegistrationRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const isDev = process.env.NODE_ENV === 'development' || !process.env.UPSTASH_REDIS_REST_URL;
    const maxRequests = isDev ? 500 : 3;
    return inMemoryLimiter.limit(identifier, maxRequests, 60 * 60 * 1000);
}

/**
 * Rate limit for general API requests
 */
export async function checkApiRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const isDev = process.env.NODE_ENV === 'development' || !process.env.UPSTASH_REDIS_REST_URL;
    const maxRequests = isDev ? 5000 : 100;
    return inMemoryLimiter.limit(identifier, maxRequests, 60 * 1000);
}

/**
 * Rate limit for password reset
 * 3 attempts per hour per email
 */
export async function checkPasswordResetRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
    return inMemoryLimiter.limit(identifier, 3, 60 * 60 * 1000); // 3 requests per hour
}

/**
 * Get client identifier (IP address or fallback)
 */
export function getClientIdentifier(request: Request): string {
    // Try to get real IP from headers (for production behind proxy)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Fallback for development
    return 'dev-client';
}
