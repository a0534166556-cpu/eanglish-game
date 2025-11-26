// Rate Limiter for API endpoints
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const key = identifier;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return false;
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  return true;
}

export function getRateLimitInfo(identifier: string): { remaining: number; resetTime: number } | null {
  const entry = rateLimitStore.get(identifier);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  if (now > entry.resetTime) {
    return null;
  }
  
  return {
    remaining: Math.max(0, 10 - entry.count), // Assuming max 10 requests
    resetTime: entry.resetTime
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 300000); // Clean up every 5 minutes