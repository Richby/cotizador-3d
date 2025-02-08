interface ValidationResult {
    isValid: boolean;
    errors: { [key: string]: string };
}

export function validateCostCalculationRequest(data: any): ValidationResult{
    const errors: { [key: string]: string } = {};
    if (typeof data !== 'object' || data === null) {
      errors.general = 'Invalid request data.';
      return { isValid: false, errors };
    }

    if (typeof data.dimensions !== 'object' || data.dimensions === null) {
      errors.dimensions = 'Dimensions are required and must be an object.';
    } else {
      if (typeof data.dimensions.x !== 'number' || data.dimensions.x <= 0) {
        errors.dimensionsX = 'X dimension is required and must be a positive number.';
      }
      if (typeof data.dimensions.y !== 'number' || data.dimensions.y <= 0) {
        errors.dimensionsY = 'Y dimension is required and must be a positive number.';
      }
      if (typeof data.dimensions.z !== 'number' || data.dimensions.z <= 0) {
        errors.dimensionsZ = 'Z dimension is required and must be a positive number.';
      }
    }
    if (typeof data.filamentId !== 'number' || data.filamentId <= 0) {
        errors.filamentId = 'Filament ID is required and must be a positive integer.';
    }
    if (typeof data.infill !== 'number' || data.infill < 0 || data.infill > 1) {
        errors.infill = 'Infill is required and must be a number between 0 and 1.';
    }

    if (typeof data.layerHeight !== 'number' || data.layerHeight <= 0) {
        errors.layerHeight = 'Layer height is required and must be a positive number.';
    }
    return { isValid: Object.keys(errors).length === 0, errors }; // El problema está aquí
}