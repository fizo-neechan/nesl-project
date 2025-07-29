// src/controllers/RectangleController.ts
import { Socket } from 'socket.io';
import { RectangleService } from '../services/RectangleService';
import {
    ClientToServerEvents,
    CreateRectangleDTO,
    MoveData,
    ServerToClientEvents
} from '../types';

export class RectangleController {
  constructor(private rectangleService: RectangleService) {}

  async handleGetAllRectangles(socket: Socket<ClientToServerEvents, ServerToClientEvents>): Promise<void> {
    try {
      console.log(`🎮 Controller: Client ${socket.id} requesting all rectangles`);

      const result = await this.rectangleService.getAllRectangles();

      if (result.success && result.data) {
        socket.emit('rectangles:init', result.data);
        console.log(`🎮 Controller: Sent ${result.data.length} rectangles to client ${socket.id}`);
      } else {
        console.error(`🎮 Controller: Failed to get rectangles: ${result.error}`);
        // Could emit an error event to the client here if needed
      }
    } catch (error) {
      console.error('🎮 Controller: Error in handleGetAllRectangles:', error);
    }
  }

  async handleCreateRectangle(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    rectangleData: CreateRectangleDTO
  ): Promise<void> {
    try {
      console.log(`🎮 Controller: Client ${socket.id} creating rectangle ${rectangleData.id}`);

      const result = await this.rectangleService.createRectangle(rectangleData);

      if (result.success && result.data) {
        // Broadcast to all other clients (not the sender)
        socket.broadcast.emit('rectangle:added', result.data);
        console.log(`🎮 Controller: Broadcasted new rectangle ${result.data.id} to other clients`);
      } else {
        console.error(`🎮 Controller: Failed to create rectangle: ${result.error}`);
        // Optionally, emit an error back to the sender
        // socket.emit('rectangle:error', { message: result.error });
      }
    } catch (error) {
      console.error('🎮 Controller: Error in handleCreateRectangle:', error);
    }
  }

  async handleMoveRectangle(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    moveData: MoveData
  ): Promise<void> {
    try {
      console.log(`🎮 Controller: Client ${socket.id} moving rectangle ${moveData.id} to (${moveData.x}, ${moveData.y})`);

      const result = await this.rectangleService.updateRectanglePosition(moveData);

      if (result.success && result.data) {
        // Broadcast position update to all other clients
        socket.broadcast.emit('rectangle:moved', moveData);
        console.log(`🎮 Controller: Broadcasted rectangle ${moveData.id} movement to other clients`);
      } else {
        console.error(`🎮 Controller: Failed to move rectangle: ${result.error}`);
        // Optionally, emit an error or correction back to the sender
        // socket.emit('rectangle:move:error', { rectangleId: moveData.id, message: result.error });
      }
    } catch (error) {
      console.error('🎮 Controller: Error in handleMoveRectangle:', error);
    }
  }

  async handleDeleteRectangle(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    rectangleId: string
  ): Promise<void> {
    try {
      console.log(`🎮 Controller: Client ${socket.id} deleting rectangle ${rectangleId}`);

      const result = await this.rectangleService.deleteRectangle(rectangleId);

      if (result.success) {
        // Broadcast deletion to all other clients
        socket.broadcast.emit('rectangle:deleted', rectangleId);
        console.log(`🎮 Controller: Broadcasted rectangle ${rectangleId} deletion to other clients`);
      } else {
        console.error(`🎮 Controller: Failed to delete rectangle: ${result.error}`);
        // Optionally, emit an error back to the sender
        // socket.emit('rectangle:delete:error', { rectangleId, message: result.error });
      }
    } catch (error) {
      console.error('🎮 Controller: Error in handleDeleteRectangle:', error);
    }
  }

  // Additional utility methods for controller
  async handleClientDisconnect(socketId: string): Promise<void> {
    try {
      console.log(`🎮 Controller: Handling disconnect for client ${socketId}`);
      // Could implement cleanup logic here if needed
      // For example, removing rectangles created by this specific client
    } catch (error) {
      console.error('🎮 Controller: Error in handleClientDisconnect:', error);
    }
  }

  async getStatistics(): Promise<{ totalRectangles: number }> {
    try {
      const result = await this.rectangleService.getAllRectangles();
      return {
        totalRectangles: result.success && result.data ? result.data.length : 0
      };
    } catch (error) {
      console.error('🎮 Controller: Error getting statistics:', error);
      return { totalRectangles: 0 };
    }
  }
}
