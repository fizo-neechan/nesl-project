// src/controllers/HealthController.ts
import { Request, Response } from 'express';
import { RectangleService } from '../services/RectangleService';

export class HealthController {
  constructor(
    private rectangleService: RectangleService,
    private getConnectedClientsCount: () => number
  ) {}

  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.rectangleService.getAllRectangles();
      const connectedClients = this.getConnectedClientsCount();

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: Math.floor(process.uptime()),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        statistics: {
          connectedClients,
          totalRectangles: stats.success && stats.data ? stats.data.length : 0
        }
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      console.error('❌ Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      });
    }
  }

  async getReadiness(req: Request, res: Response): Promise<void> {
    // Check if all required services are ready
    try {
      // Test rectangle service
      await this.rectangleService.getAllRectangles();

      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          rectangleService: 'ready',
          socketIO: 'ready'
        }
      });
    } catch (error) {
      console.error('❌ Readiness check failed:', error);
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'Services not ready'
      });
    }
  }
}
