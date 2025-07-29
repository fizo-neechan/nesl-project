// src/sockets/base/BaseSocketNamespace.ts
import { Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';
import { ConnectedClient, ISocketEventHandler, ISocketNamespace } from '../types';

export abstract class BaseSocketNamespace<
  TClientToServer extends EventsMap = EventsMap,
  TServerToClient extends EventsMap = EventsMap
> implements ISocketNamespace<TClientToServer, TServerToClient> {

  abstract readonly namespace: string;
  public readonly eventHandlers: Map<string, ISocketEventHandler<TClientToServer, TServerToClient>> = new Map();
  protected connectedClients: Map<string, ConnectedClient> = new Map();

  // Public method to initialize after construction
  public initialize(): void {
    this.registerEventHandlers();
    console.log(`🏠 Initialized namespace: ${this.namespace} with ${this.eventHandlers.size} handlers`);
  }

  protected abstract registerEventHandlers(): void;

  protected registerEventHandler(handler: ISocketEventHandler<TClientToServer, TServerToClient>): void {
    if (!this.namespace) {
      throw new Error('Namespace not initialized. Make sure to define the namespace property in your subclass.');
    }

    if (handler.namespace !== this.namespace) {
      throw new Error(
        `Event handler namespace mismatch: expected '${this.namespace}', got '${handler.namespace}'`
      );
    }

    this.eventHandlers.set(handler.eventName, handler);
  }

  public async onConnection(socket: Socket<TClientToServer, TServerToClient>): Promise<void> {
    console.log(`🔌 Client connected to ${this.namespace}: ${socket.id}`);

    // Track connected client
    this.connectedClients.set(socket.id, {
      socketId: socket.id,
      namespace: this.namespace,
      connectedAt: new Date(),
      metadata: this.getClientMetadata(socket)
    });

    // Set up event listeners
    this.setupEventListeners(socket);

    // Handle connection-specific logic
    await this.handleConnection(socket);

    // Log connection stats
    this.logConnectionStats();
  }

  public async onDisconnection(socket: Socket<TClientToServer, TServerToClient>, reason: string): Promise<void> {
    console.log(`🔌 Client disconnected from ${this.namespace}: ${socket.id} (${reason})`);

    // Handle disconnection-specific logic
    await this.handleDisconnection(socket, reason);

    // Remove from tracking
    this.connectedClients.delete(socket.id);

    // Log updated stats
    this.logConnectionStats();
  }

  protected setupEventListeners(socket: Socket<TClientToServer, TServerToClient>): void {
    // Register all event handlers
    for (const [eventName, handler] of this.eventHandlers.entries()) {
      socket.on(eventName as any, (data: any) => {
        handler.handle(socket, data);
      });
    }

    // Handle generic errors
    socket.on('error', (error: Error) => {
      console.error(`🔌 Socket error in ${this.namespace} for ${socket.id}:`, error);
    });
  }

  // Override these methods in subclasses for custom behavior
  protected async handleConnection(socket: Socket<TClientToServer, TServerToClient>): Promise<void> {
    // Default implementation - can be overridden
  }

  protected async handleDisconnection(socket: Socket<TClientToServer, TServerToClient>, reason: string): Promise<void> {
    // Default implementation - can be overridden
  }

  protected getClientMetadata(socket: Socket<TClientToServer, TServerToClient>): Record<string, any> {
    return {
      userAgent: socket.handshake.headers['user-agent'],
      ip: socket.handshake.address,
      query: socket.handshake.query
    };
  }

  protected logConnectionStats(): void {
    const totalConnected = this.connectedClients.size;
    console.log(`🔌 [${this.namespace}] Connected clients: ${totalConnected}`);

    if (totalConnected > 0) {
      const oldestConnection = Math.min(
        ...Array.from(this.connectedClients.values()).map(client => client.connectedAt.getTime())
      );
      const oldestDuration = Date.now() - oldestConnection;
      console.log(`🔌 [${this.namespace}] Oldest connection: ${Math.floor(oldestDuration / 1000)}s ago`);
    }
  }

  // Public methods for external access
  public getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  public getConnectedClients(): ConnectedClient[] {
    return Array.from(this.connectedClients.values());
  }

  public getConnectedClient(socketId: string): ConnectedClient | undefined {
    return this.connectedClients.get(socketId);
  }
}
