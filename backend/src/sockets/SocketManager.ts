// src/sockets/SocketManager.ts
import { Server } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';
import { ISocketManager, ISocketMiddleware, ISocketNamespace, SocketConfig } from './types';

export class SocketManager implements ISocketManager {
  private io: Server;
  private namespaces: Map<string, ISocketNamespace> = new Map();
  private middlewares: ISocketMiddleware[] = [];
  private isStarted: boolean = false;

  constructor(
    server: any,
    private config: SocketConfig
  ) {
    this.io = new Server(server, {
      cors: this.config.cors,
      transports: this.config.transports as any,
      pingTimeout: this.config.pingTimeout || 60000,
      pingInterval: this.config.pingInterval || 25000
    });

    console.log('🔧 Socket Manager initialized');
  }

  public registerNamespace<
    TClientToServer extends EventsMap = EventsMap,
    TServerToClient extends EventsMap = EventsMap
  >(
    namespace: ISocketNamespace<TClientToServer, TServerToClient>
  ): void {
    if (this.isStarted) {
      throw new Error('Cannot register namespaces after SocketManager has started');
    }

    if (this.namespaces.has(namespace.namespace)) {
      throw new Error(`Namespace '${namespace.namespace}' is already registered`);
    }

    this.namespaces.set(namespace.namespace, namespace);
    console.log(`🏠 Registered namespace: ${namespace.namespace}`);
  }

  public registerMiddleware<
    TClientToServer extends EventsMap = EventsMap,
    TServerToClient extends EventsMap = EventsMap
  >(
    middleware: ISocketMiddleware<TClientToServer, TServerToClient>
  ): void {
    if (this.isStarted) {
      throw new Error('Cannot register middleware after SocketManager has started');
    }

    this.middlewares.push(middleware as any);
  }

  public start(): void {
    if (this.isStarted) {
      throw new Error('SocketManager has already been started');
    }

    this.setupMiddlewares();
    this.setupNamespaces();
    this.isStarted = true;

    this.logRegisteredNamespaces();
  }

  private setupMiddlewares(): void {
    // Apply global middlewares
    for (const middleware of this.middlewares) {
      this.io.use((socket, next) => {
        middleware.execute(socket as any, next);
      });
    }
  }

  private setupNamespaces(): void {
    for (const [namespacePath, namespaceHandler] of this.namespaces.entries()) {
      const ioNamespace = namespacePath === '/' ? this.io : this.io.of(namespacePath);

      ioNamespace.on('connection', async (socket) => {
        await namespaceHandler.onConnection(socket as any);

        // Set up disconnect handler
        socket.on('disconnect', async (reason: string) => {
          await namespaceHandler.onDisconnection(socket as any, reason);
        });
      });

    }
  }

  public async shutdown(): Promise<void> {
    console.log('🔌 Socket Manager: Initiating graceful shutdown...');

    // Notify all clients about server shutdown
    this.io.emit('server:shutdown', {
      message: 'Server is shutting down',
      timestamp: new Date().toISOString()
    });

    // Give clients time to receive the message
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Close all connections
    this.io.close();
    this.isStarted = false;

    console.log('🔌 Socket Manager: Shutdown complete');
  }

  public getConnectedClientsCount(namespace?: string): number {
    if (namespace) {
      const namespaceHandler = this.namespaces.get(namespace);
      return namespaceHandler ? namespaceHandler.eventHandlers.size : 0;
    }

    // Return total across all namespaces
    return Array.from(this.namespaces.values())
      .reduce((total, ns) => total + (ns as any).getConnectedClientsCount(), 0);
  }

  public getNamespaces(): string[] {
    return Array.from(this.namespaces.keys());
  }

  public getNamespaceHandler(namespace: string): ISocketNamespace | undefined {
    return this.namespaces.get(namespace);
  }

  public getIO(): Server {
    return this.io;
  }

  // Broadcasting utilities
  public async broadcastToNamespace(
    namespace: string,
    event: string,
    data: any,
    excludeSocketId?: string
  ): Promise<void> {
    const ioNamespace = namespace === '/' ? this.io : this.io.of(namespace);

    if (excludeSocketId) {
      ioNamespace.except(excludeSocketId).emit(event, data);
    } else {
      ioNamespace.emit(event, data);
    }
  }

  public async broadcastToAll(event: string, data: any): Promise<void> {
    this.io.emit(event, data);
  }

  private logRegisteredNamespaces(): void {
    for (const [namespacePath, namespaceHandler] of this.namespaces.entries()) {
      const eventCount = namespaceHandler.eventHandlers.size;
    }
  }

  // Health check methods
  public getHealthStatus(): {
    isRunning: boolean;
    namespaces: number;
    totalConnections: number;
    uptime: number;
  } {
    return {
      isRunning: this.isStarted,
      namespaces: this.namespaces.size,
      totalConnections: this.getConnectedClientsCount(),
      uptime: Math.floor(process.uptime())
    };
  }
}
