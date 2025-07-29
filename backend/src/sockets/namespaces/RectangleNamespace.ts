// src/sockets/namespaces/RectangleNamespace.ts
import { Socket } from 'socket.io';
import { RectangleController } from '../../controllers/RectangleController';
import {
    ClientToServerEvents,
    ServerToClientEvents
} from '../../types';
import { BaseSocketNamespace } from '../base/BaseSocketNamespace';

// Import event handlers
import { AddRectangleHandler } from '../handlers/rectangle/AddRectangleHandler';
import { DeleteRectangleHandler } from '../handlers/rectangle/DeleteRectangleHandler';
import { MoveRectangleHandler } from '../handlers/rectangle/MoveRectangleHandler';

export class RectangleNamespace extends BaseSocketNamespace<ClientToServerEvents, ServerToClientEvents> {
  public readonly namespace = '/rectangles';

  constructor(private rectangleController: RectangleController) {
    super();
    // Initialize after construction when namespace is properly set
    this.initialize();
  }

  protected registerEventHandlers(): void {
    // Register all rectangle-related event handlers
    this.registerEventHandler(new AddRectangleHandler(this.rectangleController));
    this.registerEventHandler(new MoveRectangleHandler(this.rectangleController));
    this.registerEventHandler(new DeleteRectangleHandler(this.rectangleController));
  }

  protected async handleConnection(socket: Socket<ClientToServerEvents, ServerToClientEvents>): Promise<void> {
    // Send initial rectangles to newly connected client
    await this.rectangleController.handleGetAllRectangles(socket);
  }

  protected async handleDisconnection(socket: Socket<ClientToServerEvents, ServerToClientEvents>, reason: string): Promise<void> {
    // Handle any rectangle-specific cleanup
    await this.rectangleController.handleClientDisconnect(socket.id);
  }
}
