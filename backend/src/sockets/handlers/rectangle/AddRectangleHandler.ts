// src/sockets/handlers/rectangle/AddRectangleHandler.ts
import { Socket } from 'socket.io';
import { RectangleController } from '../../../controllers/RectangleController';
import {
    ClientToServerEvents,
    CreateRectangleDTO,
    ServerToClientEvents
} from '../../../types';
import { BaseSocketEventHandler } from '../../base/BaseSocketEventHandler';

export class AddRectangleHandler extends BaseSocketEventHandler<ClientToServerEvents, ServerToClientEvents> {
  public readonly namespace = '/rectangles';
  public readonly eventName = 'rectangle:add';

  constructor(private rectangleController: RectangleController) {
    super();
  }

  async handle(socket: Socket<ClientToServerEvents, ServerToClientEvents>, data: CreateRectangleDTO): Promise<void> {
    await this.safeExecute(socket, data, async () => {
      if (!this.validateRectangleData(data)) {
        throw new Error('Invalid rectangle data received');
      }

      await this.rectangleController.handleCreateRectangle(socket, data);
    });
  }

  private validateRectangleData(data: any): data is CreateRectangleDTO {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.x === 'number' &&
      typeof data.y === 'number' &&
      typeof data.width === 'number' &&
      typeof data.height === 'number' &&
      typeof data.fill === 'string' &&
      typeof data.draggable === 'boolean'
    );
  }
}
