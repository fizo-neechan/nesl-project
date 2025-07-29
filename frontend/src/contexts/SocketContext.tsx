/** eslint-disable react-refresh/only-export-components */
// src/contexts/SocketContext.tsx
import type { ReactNode, } from 'react';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Generic socket context types
export interface SocketContextValue<TServerToClient = any, TClientToServer = any> {
  socket: Socket<TServerToClient, TClientToServer> | null;
  isConnected: boolean;
  connectionError: string | null;
  connect: () => void;
  disconnect: () => void;
  emit: <K extends keyof TClientToServer>(
    event: K,
    data: Parameters<TClientToServer[K]>[0]
  ) => void;
  on: <K extends keyof TServerToClient>(
    event: K,
    handler: TServerToClient[K]
  ) => () => void;
  off: <K extends keyof TServerToClient>(
    event: K,
    handler?: TServerToClient[K]
  ) => void;
}

export interface SocketProviderProps {
  children: ReactNode;
  namespace: string;
  serverUrl?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

// Create generic socket context
const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  namespace,
  serverUrl = 'http://localhost:3001',
  autoConnect = true,
  reconnection = true,
  reconnectionAttempts = 5,
  reconnectionDelay = 1000,
  onConnect,
  onDisconnect,
  onError
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const eventHandlersRef = useRef<Map<string, Set<Function>>>(new Map());

  const connect = () => {
    if (socketRef.current?.connected) {
      console.log(`🔌 Already connected to ${namespace}`);
      return;
    }

    console.log(`🔌 Connecting to ${serverUrl}${namespace}...`);

    socketRef.current = io(`${serverUrl}${namespace}`, {
      transports: ['websocket', 'polling'],
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      timeout: 20000
    });

    setupSocketListeners();
  };

  const disconnect = () => {
    if (socketRef.current) {
      console.log(`🔌 Disconnecting from ${namespace}...`);
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionError(null);
      eventHandlersRef.current.clear();
    }
  };

  const setupSocketListeners = () => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log(`✅ Connected to ${namespace} (${socket.id})`);
      setIsConnected(true);
      setConnectionError(null);
      onConnect?.();
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`❌ Disconnected from ${namespace}: ${reason}`);
      setIsConnected(false);
      onDisconnect?.(reason);
    });

    socket.on('connect_error', (error: Error) => {
      console.error(`🚫 Connection error for ${namespace}:`, error.message);
      setConnectionError(error.message);
      setIsConnected(false);
      onError?.(error);
    });

    socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 Reconnected to ${namespace} after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber} for ${namespace}`);
    });

    socket.on('reconnect_failed', () => {
      console.error(`💥 Failed to reconnect to ${namespace}`);
      setConnectionError('Failed to reconnect after maximum attempts');
    });
  };

  const emit = <K extends keyof any>(event: K, data: any) => {
    if (socketRef.current?.connected) {
      console.log(`📤 [${namespace}] Emitting ${String(event)}:`, data);
      socketRef.current.emit(event as string, data);
    } else {
      console.warn(`⚠️ Cannot emit ${String(event)} - not connected to ${namespace}`);
    }
  };

  const on = <K extends keyof any>(event: K, handler: any) => {
    if (!socketRef.current) {
      console.warn(`⚠️ Cannot register listener for ${String(event)} - socket not initialized`);
      return () => {};
    }

    const eventName = String(event);
    console.log(`👂 [${namespace}] Registering listener for ${eventName}`);

    socketRef.current.on(eventName, handler);

    // Track handlers for cleanup
    if (!eventHandlersRef.current.has(eventName)) {
      eventHandlersRef.current.set(eventName, new Set());
    }
    eventHandlersRef.current.get(eventName)!.add(handler);

    // Return cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(eventName, handler);
      }
      const handlers = eventHandlersRef.current.get(eventName);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(eventName);
        }
      }
    };
  };

  const off = <K extends keyof any>(event: K, handler?: any) => {
    if (!socketRef.current) return;

    const eventName = String(event);
    console.log(`🚫 [${namespace}] Removing listener for ${eventName}`);

    if (handler) {
      socketRef.current.off(eventName, handler);
      const handlers = eventHandlersRef.current.get(eventName);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(eventName);
        }
      }
    } else {
      socketRef.current.off(eventName);
      eventHandlersRef.current.delete(eventName);
    }
  };

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [namespace, serverUrl, autoConnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const contextValue: SocketContextValue = {
    socket: socketRef.current,
    isConnected,
    connectionError,
    connect,
    disconnect,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

// Generic hook to use any socket context
export const useSocket = <TServerToClient = any, TClientToServer = any>(): SocketContextValue<TServerToClient, TClientToServer> => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context as SocketContextValue<TServerToClient, TClientToServer>;
};
