// src/sockets/handlers/rectangle/MoveRectangleHandler.ts
import { Socket } from 'socket.io';
import { RectangleController } from '../../../controllers/RectangleController';
import {
    ClientToServerEvents,
    ServerToClientEvents
} from '../../../types';
import { BaseSocketEventHandler } from '../../base/BaseSocketEventHandler';

import {
    MoveData
} from '../../../types';

export class MoveRectangleHandler extends BaseSocketEventHandler<ClientToServerEvents, ServerToClientEvents> {
  public readonly namespace = '/rectangles';
  public readonly eventName = 'rectangle:move';

  constructor(private rectangleController: RectangleController) {
    super();
  }

  async handle(socket: Socket<ClientToServerEvents, ServerToClientEvents>, data: MoveData): Promise<void> {
    await this.safeExecute(socket, data, async () => {
      if (!this.validateMoveData(data)) {
        throw new Error('Invalid move data received');
      }

      await this.rectangleController.handleMoveRectangle(socket, data);
    });
  }

  private validateMoveData(data: any): data is MoveData {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.x === 'number' &&
      typeof data.y === 'number' &&
      !isNaN(data.x) &&
      !isNaN(data.y) &&
      isFinite(data.x) &&
      isFinite(data.y)
    );
  }
}
