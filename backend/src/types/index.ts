// src/types/index.ts

export interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  draggable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRectangleDTO {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  draggable: boolean;
}

export interface UpdateRectanglePositionDTO {
  id: string;
  x: number;
  y: number;
}

export interface MoveData {
  id: string;
  x: number;
  y: number;
}

export interface ServerToClientEvents {
  'rectangles:init': (rectangles: Rectangle[]) => void;
  'rectangle:added': (rectangle: Rectangle) => void;
  'rectangle:moved': (moveData: MoveData) => void;
  'rectangle:deleted': (rectangleId: string) => void;
}

export interface ClientToServerEvents {
  'rectangle:add': (rectangle: CreateRectangleDTO) => void;
  'rectangle:move': (moveData: MoveData) => void;
  'rectangle:delete': (rectangleId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  sessionId: string;
}

// Repository interface
export interface IRectangleRepository {
  create(rectangle: CreateRectangleDTO): Promise<Rectangle>;
  findById(id: string): Promise<Rectangle | null>;
  findAll(): Promise<Rectangle[]>;
  update(id: string, updates: Partial<Rectangle>): Promise<Rectangle | null>;
  delete(id: string): Promise<boolean>;
  updatePosition(id: string, position: { x: number; y: number }): Promise<Rectangle | null>;
}

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Error types
export class RectangleNotFoundError extends Error {
  constructor(id: string) {
    super(`Rectangle with id ${id} not found`);
    this.name = 'RectangleNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
