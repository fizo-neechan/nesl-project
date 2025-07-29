// src/services/RectangleService.ts
import {
    CreateRectangleDTO,
    IRectangleRepository,
    Rectangle,
    ServiceResponse,
    UpdateRectanglePositionDTO
} from '../types';

export class RectangleService {
  constructor(private rectangleRepository: IRectangleRepository) {}

  async createRectangle(rectangleData: CreateRectangleDTO): Promise<ServiceResponse<Rectangle>> {
    try {
      // Validation
      const validationError = this.validateRectangleData(rectangleData);
      if (validationError) {
        console.log(`🔧 Service: Validation failed for rectangle creation: ${validationError}`);
        return { success: false, error: validationError };
      }

      // Check if rectangle with this ID already exists
      const existing = await this.rectangleRepository.findById(rectangleData.id);
      if (existing) {
        console.log(`🔧 Service: Rectangle with ID ${rectangleData.id} already exists`);
        return { success: false, error: `Rectangle with ID ${rectangleData.id} already exists` };
      }

      const rectangle = await this.rectangleRepository.create(rectangleData);
      console.log(`🔧 Service: Successfully created rectangle ${rectangle.id}`);

      return { success: true, data: rectangle };
    } catch (error) {
      console.error('🔧 Service: Error creating rectangle:', error);
      return { success: false, error: 'Failed to create rectangle' };
    }
  }

  async getAllRectangles(): Promise<ServiceResponse<Rectangle[]>> {
    try {
      const rectangles = await this.rectangleRepository.findAll();
      console.log(`🔧 Service: Retrieved ${rectangles.length} rectangles`);

      return { success: true, data: rectangles };
    } catch (error) {
      console.error('🔧 Service: Error retrieving rectangles:', error);
      return { success: false, error: 'Failed to retrieve rectangles' };
    }
  }

  async updateRectanglePosition(positionData: UpdateRectanglePositionDTO): Promise<ServiceResponse<Rectangle>> {
    try {
      // Validation
      if (!this.isValidPosition(positionData.x, positionData.y)) {
        console.log(`🔧 Service: Invalid position data for rectangle ${positionData.id}`);
        return { success: false, error: 'Invalid position coordinates' };
      }

      const updatedRectangle = await this.rectangleRepository.updatePosition(
        positionData.id,
        { x: positionData.x, y: positionData.y }
      );

      if (!updatedRectangle) {
        console.log(`🔧 Service: Rectangle ${positionData.id} not found for position update`);
        return { success: false, error: `Rectangle with ID ${positionData.id} not found` };
      }

      console.log(`🔧 Service: Successfully updated position for rectangle ${positionData.id}`);
      return { success: true, data: updatedRectangle };
    } catch (error) {
      console.error('🔧 Service: Error updating rectangle position:', error);
      return { success: false, error: 'Failed to update rectangle position' };
    }
  }

  async deleteRectangle(rectangleId: string): Promise<ServiceResponse<boolean>> {
    try {
      if (!rectangleId || typeof rectangleId !== 'string') {
        console.log('🔧 Service: Invalid rectangle ID for deletion');
        return { success: false, error: 'Invalid rectangle ID' };
      }

      const deleted = await this.rectangleRepository.delete(rectangleId);

      if (!deleted) {
        console.log(`🔧 Service: Rectangle ${rectangleId} not found for deletion`);
        return { success: false, error: `Rectangle with ID ${rectangleId} not found` };
      }

      console.log(`🔧 Service: Successfully deleted rectangle ${rectangleId}`);
      return { success: true, data: true };
    } catch (error) {
      console.error('🔧 Service: Error deleting rectangle:', error);
      return { success: false, error: 'Failed to delete rectangle' };
    }
  }

  async getRectangleById(rectangleId: string): Promise<ServiceResponse<Rectangle>> {
    try {
      if (!rectangleId || typeof rectangleId !== 'string') {
        return { success: false, error: 'Invalid rectangle ID' };
      }

      const rectangle = await this.rectangleRepository.findById(rectangleId);

      if (!rectangle) {
        return { success: false, error: `Rectangle with ID ${rectangleId} not found` };
      }

      return { success: true, data: rectangle };
    } catch (error) {
      console.error('🔧 Service: Error retrieving rectangle:', error);
      return { success: false, error: 'Failed to retrieve rectangle' };
    }
  }

  // Private validation methods
  private validateRectangleData(data: CreateRectangleDTO): string | null {
    if (!data.id || typeof data.id !== 'string') {
      return 'Rectangle ID is required and must be a string';
    }

    if (!this.isValidPosition(data.x, data.y)) {
      return 'Invalid position coordinates';
    }

    if (!this.isValidDimensions(data.width, data.height)) {
      return 'Invalid rectangle dimensions';
    }

    if (!data.fill || typeof data.fill !== 'string') {
      return 'Rectangle fill color is required';
    }

    if (typeof data.draggable !== 'boolean') {
      return 'Draggable property must be a boolean';
    }

    return null;
  }

  private isValidPosition(x: number, y: number): boolean {
    return (
      typeof x === 'number' &&
      typeof y === 'number' &&
      !isNaN(x) &&
      !isNaN(y) &&
      isFinite(x) &&
      isFinite(y) &&
      x >= 0 &&
      y >= 0
    );
  }

  private isValidDimensions(width: number, height: number): boolean {
    return (
      typeof width === 'number' &&
      typeof height === 'number' &&
      !isNaN(width) &&
      !isNaN(height) &&
      isFinite(width) &&
      isFinite(height) &&
      width > 0 &&
      height > 0
    );
  }
}
