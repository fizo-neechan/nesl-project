// src/sockets/handlers/rectangle/DeleteRectangleHandler.ts
import { Socket } from 'socket.io';
import { RectangleController } from '../../../controllers/RectangleController';
import {
    ClientToServerEvents,
    ServerToClientEvents
} from '../../../types';
import { BaseSocketEventHandler } from '../../base/BaseSocketEventHandler';

export class DeleteRectangleHandler extends BaseSocketEventHandler<ClientToServerEvents, ServerToClientEvents> {
  public readonly namespace = '/rectangles';
  public readonly eventName = 'rectangle:delete';

  constructor(private rectangleController: RectangleController) {
    super();
  }

  async handle(socket: Socket<ClientToServerEvents, ServerToClientEvents>, data: string): Promise<void> {
    await this.safeExecute(socket, data, async () => {
      if (!this.validateRectangleId(data)) {
        throw new Error('Invalid rectangle ID received');
      }

      await this.rectangleController.handleDeleteRectangle(socket, data);
    });
  }

  private validateRectangleId(data: any): data is string {
    return typeof data === 'string' && data.length > 0;
  }
}
