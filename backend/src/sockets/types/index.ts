// src/sockets/types/index.ts
import { Socket } from 'socket.io';
import { EventsMap } from 'socket.io/dist/typed-events';

// Generic socket event handler interface
export interface ISocketEventHandler<
  TClientToServer extends EventsMap = EventsMap,
  TServerToClient extends EventsMap = EventsMap
> {
  readonly namespace: string;
  readonly eventName: string;
  handle(socket: Socket<TClientToServer, TServerToClient>, data: any): Promise<void> | void;
}

// Socket namespace interface
export interface ISocketNamespace<
  TClientToServer extends EventsMap = EventsMap,
  TServerToClient extends EventsMap = EventsMap
> {
  readonly namespace: string;
  readonly eventHandlers: Map<string, ISocketEventHandler<TClientToServer, TServerToClient>>;
  onConnection(socket: Socket<TClientToServer, TServerToClient>): Promise<void> | void;
  onDisconnection(socket: Socket<TClientToServer, TServerToClient>, reason: string): Promise<void> | void;
}

// Socket manager interface
export interface ISocketManager {
  registerNamespace<TClientToServer extends EventsMap = EventsMap, TServerToClient extends EventsMap = EventsMap>(
    namespace: ISocketNamespace<TClientToServer, TServerToClient>
  ): void;
  start(): void;
  shutdown(): Promise<void>;
  getConnectedClientsCount(namespace?: string): number;
}

// Generic socket event data
export interface SocketEventData<T = any> {
  event: string;
  data: T;
  namespace: string;
  socketId: string;
  timestamp: Date;
}

// Socket middleware interface
export interface ISocketMiddleware<
  TClientToServer extends EventsMap = EventsMap,
  TServerToClient extends EventsMap = EventsMap
> {
  execute(
    socket: Socket<TClientToServer, TServerToClient>,
    next: (err?: Error) => void
  ): Promise<void> | void;
}

// Connection tracking
export interface ConnectedClient {
  socketId: string;
  namespace: string;
  connectedAt: Date;
  metadata?: Record<string, any>;
}

// Socket configuration
export interface SocketConfig {
  cors: {
    origin: string | string[];
    methods: string[];
    credentials: boolean;
  };
  transports: string[];
  pingTimeout?: number;
  pingInterval?: number;
}
