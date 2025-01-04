import { assetMap } from '../itemsList.js';
import fs from 'fs/promises';
import path from 'path';

export class ItemValidator {
  static async validateLocalAsset(assetPath) {
    try {
      const fullPath = path.join(process.cwd(), assetPath);
      await fs.access(fullPath);
      return true;
    } catch (error) {
      console.error('Error validating local asset:', error);
      return false;
    }
  }

  static validateItemStructure(item) {
    try {
      const requiredFields = ['id', 'name', 'price', 'type'];
      const errors = [];

      // Check required fields
      requiredFields.forEach(field => {
        if (!item[field]) errors.push(`Missing required field: ${field}`);
      });

      // Validate price
      if (typeof item.price !== 'number' || item.price < 0) {
        errors.push('Invalid price value');
      }

      // Validate type
      const validTypes = ['tool', 'part', 'safety', 'modification', 'service'];
      if (!validTypes.includes(item.type)) {
        errors.push('Invalid item type');
      }

      // Validate rarity
      if (item.rarity) {
        const validRarities = ['common', 'uncommon', 'rare', 'legendary'];
        if (!validRarities.includes(item.rarity)) {
          errors.push('Invalid rarity value');
        }
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      console.error('Error validating item structure:', error);
      return { valid: false, errors: [error.message] };
    }
  }
}
