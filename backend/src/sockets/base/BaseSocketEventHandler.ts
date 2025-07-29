// src/sockets/base/BaseSocketEventHandler.ts
import { Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';
import { ISocketEventHandler } from '../types';

export abstract class BaseSocketEventHandler<
  TClientToServer extends EventsMap = EventsMap,
  TServerToClient extends EventsMap = EventsMap
> implements ISocketEventHandler<TClientToServer, TServerToClient> {

  abstract readonly namespace: string;
  abstract readonly eventName: string;

  constructor() {
    this.logEventRegistration();
  }

  abstract handle(socket: Socket<TClientToServer, TServerToClient>, data: any): Promise<void> | void;

  protected logEventRegistration(): void {
    console.log(`🎯 Registered event handler: ${this.namespace}/${this.eventName}`);
  }

  protected logEventReceived(socketId: string, data?: any): void {
    console.log(`📥 Event received [${this.namespace}/${this.eventName}] from ${socketId}`,
      data ? { preview: this.truncateData(data) } : '');
  }

  protected logEventBroadcast(socketId: string, data?: any): void {
    console.log(`📤 Broadcasting [${this.namespace}/${this.eventName}] from ${socketId}`,
      data ? { preview: this.truncateData(data) } : '');
  }

  protected logError(socketId: string, error: Error): void {
    console.error(`❌ Error in [${this.namespace}/${this.eventName}] for ${socketId}:`, error.message);
  }

  protected validateData<T>(data: any, validator: (data: any) => data is T): data is T {
    return validator(data);
  }

  protected async safeExecute(
    socket: Socket<TClientToServer, TServerToClient>,
    data: any,
    operation: () => Promise<void> | void
  ): Promise<void> {
    try {
      this.logEventReceived(socket.id, data);
      await operation();
    } catch (error) {
      this.logError(socket.id, error as Error);
      // Optionally emit error back to client
      // socket.emit('error', { event: this.eventName, message: error.message });
    }
  }

  private truncateData(data: any): any {
    const str = JSON.stringify(data);
    return str.length > 100 ? `${str.substring(0, 100)}...` : data;
  }
}
