// src/sockets/middleware/LoggingMiddleware.ts
import { Socket } from "socket.io";
import { ISocketMiddleware } from "../types";

export class LoggingMiddleware implements ISocketMiddleware {
  async execute(socket: Socket, next: (err?: Error) => void): Promise<void> {
    const startTime = Date.now();

    console.log(`📝 Socket connection attempt: ${socket.id} from ${socket.handshake.address}`);
    console.log(`📝 Headers:`, {
      userAgent: socket.handshake.headers['user-agent'],
      origin: socket.handshake.headers.origin,
      referer: socket.handshake.headers.referer
    });
    console.log(`📝 Query params:`, socket.handshake.query);

    // Log connection result
    const originalNext = next;
    next = (err?: Error) => {
      const duration = Date.now() - startTime;

      if (err) {
        console.log(`❌ Connection rejected for ${socket.id} after ${duration}ms: ${err.message}`);
      } else {
        console.log(`✅ Connection accepted for ${socket.id} after ${duration}ms`);
      }

      originalNext(err);
    };

    next();
  }
}
