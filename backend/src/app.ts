
import express from 'express';
import { createServer } from 'http';
import { HealthController } from './controllers/HealthController';
import { RectangleController } from './controllers/RectangleController';
import { InMemoryRectangleRepository } from './repositories/InMemoryRectangleRepository';
import { RectangleService } from './services/RectangleService';
import { SocketManager } from './sockets/SocketManager';
import { RectangleNamespace } from './sockets/namespaces/RectangleNamespace';

// Middleware examples
import { LoggingMiddleware } from './sockets/middleware/LoggingMiddleware';
import { RateLimitMiddleware } from './sockets/middleware/RateLimitMiddleware';

class App {
  private app: express.Application;
  private server: ReturnType<typeof createServer>;
  private socketManager!: SocketManager;
  private rectangleService!: RectangleService;
  private healthController!: HealthController;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.setupMiddleware();
    this.setupDependencies();
    this.setupSocketManager();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    const cors = require('cors');
    this.app.use(cors({
      origin: "http://localhost:5173",
      credentials: true
    }));
    this.app.use(express.json());
  }

  private setupDependencies(): void {
    // Repository layer
    const rectangleRepository = new InMemoryRectangleRepository();

    // Service layer
    this.rectangleService = new RectangleService(rectangleRepository);

    // Controller layer
    const rectangleController = new RectangleController(this.rectangleService);

    // Health controller
    this.healthController = new HealthController(
      this.rectangleService,
      () => this.socketManager?.getConnectedClientsCount() || 0
    );

    // Socket namespaces
    const rectangleNamespace = new RectangleNamespace(rectangleController);

    // Initialize socket manager
    this.socketManager = new SocketManager(this.server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Register socket middlewares (optional)
    this.socketManager.registerMiddleware(new LoggingMiddleware());
    this.socketManager.registerMiddleware(new RateLimitMiddleware(1000, 60000)); // 1000 requests per minute
    // this.socketManager.registerMiddleware(new AuthenticationMiddleware()); // Enable if you need auth

    // Register namespaces
    this.socketManager.registerNamespace(rectangleNamespace);

    // Add more namespaces here as needed:
    // const chatNamespace = new ChatNamespace(chatController);
    // this.socketManager.registerNamespace(chatNamespace);

    console.log('🏗️ All dependencies configured');
  }

  private setupSocketManager(): void {
    // Start the socket manager
    this.socketManager.start();
  }

  private setupRoutes(): void {
    // Health check endpoints
    this.app.get('/health', (_, res) => this.healthController.getHealth(_, res));
    this.app.get('/ready', (_, res) => this.healthController.getReadiness(_, res));

    // Socket status endpoint
    this.app.get('/socket/status', (_, res) => {
      const status = this.socketManager.getHealthStatus();
      const namespaces = this.socketManager.getNamespaces();

      res.json({
        ...status,
        namespaces: namespaces.map(ns => ({
          namespace: ns,
          connections: this.socketManager.getConnectedClientsCount(ns)
        }))
      });
    });

    // API info endpoint
    this.app.get('/', (_, res) => {
      res.json({
        name: 'Collaborative Canvas API',
        version: '2.0.0',
        status: 'running',
        architecture: 'Generic Socket Architecture',
        endpoints: {
          health: '/health',
          readiness: '/ready',
          socketStatus: '/socket/status'
        },
        websocket: {
          namespaces: this.socketManager.getNamespaces(),
          transport: ['websocket', 'polling']
        }
      });
    });

    // Namespace-specific info endpoints
    this.app.get('/socket/namespaces', (_, res) => {
      const namespaces = this.socketManager.getNamespaces().map(ns => {
        const handler = this.socketManager.getNamespaceHandler(ns);
        return {
          namespace: ns,
          eventHandlers: handler ? Array.from(handler.eventHandlers.keys()) : [],
          connections: this.socketManager.getConnectedClientsCount(ns)
        };
      });

      res.json({ namespaces });
    });
  }

  public start(port: number = 3001): void {
    this.server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🏗️ Architecture: Generic Socket System`);
      console.log(`🔌 Namespaces: ${this.socketManager.getNamespaces().join(', ')}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔍 Socket status: http://localhost:${port}/socket/status`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('SIGINT', () => this.gracefulShutdown());
  }

  private async gracefulShutdown(): Promise<void> {
    console.log('🛑 Received shutdown signal, starting graceful shutdown...');

    try {
      await this.socketManager.shutdown();
      this.server.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): ReturnType<typeof createServer> {
    return this.server;
  }

  public getSocketManager(): SocketManager {
    return this.socketManager;
  }
}

export default App;
