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
    console.log(`📦 Repository: Created rectangle ${rectangle.id}`);
    return rectangle;
  }

  async findById(id: string): Promise<Rectangle | null> {
    const rectangle = this.rectangles.get(id) || null;
    console.log(`📦 Repository: ${rectangle ? 'Found' : 'Not found'} rectangle ${id}`);
    return rectangle;
  }

  async findAll(): Promise<Rectangle[]> {
    const rectangles = Array.from(this.rectangles.values());
    console.log(`📦 Repository: Retrieved ${rectangles.length} rectangles`);
    return rectangles;
  }

  async update(id: string, updates: Partial<Rectangle>): Promise<Rectangle | null> {
    const existing = this.rectangles.get(id);
    if (!existing) {
      console.log(`📦 Repository: Rectangle ${id} not found for update`);
      return null;
    }

    const updated: Rectangle = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    this.rectangles.set(id, updated);
    console.log(`📦 Repository: Updated rectangle ${id}`);
    return updated;
  }

  async updatePosition(id: string, position: { x: number; y: number }): Promise<Rectangle | null> {
    const existing = this.rectangles.get(id);
    if (!existing) {
      console.log(`📦 Repository: Rectangle ${id} not found for position update`);
      return null;
    }

    const updated: Rectangle = {
      ...existing,
      x: position.x,
      y: position.y,
      updatedAt: new Date()
    };

    this.rectangles.set(id, updated);
    console.log(`📦 Repository: Updated position for rectangle ${id} to (${position.x}, ${position.y})`);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.rectangles.has(id);
    this.rectangles.delete(id);
    console.log(`📦 Repository: ${existed ? 'Deleted' : 'Could not delete'} rectangle ${id}`);
    return existed;
  }

  // Additional utility methods for debugging/monitoring
  getSize(): number {
    return this.rectangles.size;
  }

  clear(): void {
    this.rectangles.clear();
    console.log('📦 Repository: Cleared all rectangles');
  }
}
