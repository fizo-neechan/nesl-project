// src/sockets/middleware/RateLimitMiddleware.ts
import { Socket } from 'socket.io';
import { ISocketMiddleware } from '../types';

interface RateLimitData {
  count: number;
  resetTime: number;
}

export class RateLimitMiddleware implements ISocketMiddleware {
  private rateLimits = new Map<string, RateLimitData>();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  async execute(socket: Socket, next: (err?: Error) => void): Promise<void> {
    try {
      const clientId = this.getClientIdentifier(socket);
      const now = Date.now();

      let rateLimitData = this.rateLimits.get(clientId);

      if (!rateLimitData || now > rateLimitData.resetTime) {
        // Reset or create new rate limit data
        rateLimitData = {
          count: 1,
          resetTime: now + this.windowMs
        };
        this.rateLimits.set(clientId, rateLimitData);
      } else {
        rateLimitData.count++;
      }

      if (rateLimitData.count > this.maxRequests) {
        console.log(`🚫 Rate limit exceeded for ${clientId}: ${rateLimitData.count}/${this.maxRequests}`);
        return next(new Error('Rate limit exceeded'));
      }

      console.log(`🚦 Rate limit check passed for ${clientId}: ${rateLimitData.count}/${this.maxRequests}`);
      next();
    } catch (error) {
      console.error(`🚦 Rate limit error for ${socket.id}:`, error);
      next();
    }
  }

  private getClientIdentifier(socket: Socket): string {
    // Use IP address as identifier, or user ID if authenticated
    return (socket as any).userId || socket.handshake.address;
  }

  // Cleanup old entries periodically
  public cleanup(): void {
    const now = Date.now();
    for (const [clientId, data] of this.rateLimits.entries()) {
      if (now > data.resetTime) {
        this.rateLimits.delete(clientId);
      }
    }
  }
}
