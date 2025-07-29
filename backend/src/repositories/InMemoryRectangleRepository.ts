// src/repositories/InMemoryRectangleRepository.ts
import { CreateRectangleDTO, IRectangleRepository, Rectangle } from '../types';

export class InMemoryRectangleRepository implements IRectangleRepository {
  private rectangles: Map<string, Rectangle> = new Map();

  async create(rectangleData: CreateRectangleDTO): Promise<Rectangle> {
    const now = new Date();
    const rectangle: Rectangle = {
      ...rectangleData,
      createdAt: now,
      updatedAt: now
    };

    this.rectangles.set(rectangle.id, rectangle);
    return rectangle;
  }

  async findById(id: string): Promise<Rectangle | null> {
    const rectangle = this.rectangles.get(id) || null;
    return rectangle;
  }

  async findAll(): Promise<Rectangle[]> {
    const rectangles = Array.from(this.rectangles.values());
    return rectangles;
  }

  async update(id: string, updates: Partial<Rectangle>): Promise<Rectangle | null> {
    const existing = this.rectangles.get(id);
    if (!existing) {
      return null;
    }

    const updated: Rectangle = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    this.rectangles.set(id, updated);
    return updated;
  }

  async updatePosition(id: string, position: { x: number; y: number }): Promise<Rectangle | null> {
    const existing = this.rectangles.get(id);
    if (!existing) {
      return null;
    }

    const updated: Rectangle = {
      ...existing,
      x: position.x,
      y: position.y,
      updatedAt: new Date()
    };

    this.rectangles.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.rectangles.has(id);
    this.rectangles.delete(id);
    return existed;
  }

  // Additional utility methods for debugging/monitoring
  getSize(): number {
    return this.rectangles.size;
  }

  clear(): void {
    this.rectangles.clear();
  }
}
