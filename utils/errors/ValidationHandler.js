import { validationResult } from 'express-validator';
import { ErrorTypes } from './ErrorHandler.js';

export class ValidationHandler {
    static validate(data, schema) {
        const errors = [];
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            
            for (const rule of rules) {
                const result = this._validateRule(value, rule);
                if (!result.valid) {
                    errors.push({
                        field,
                        value,
                        rule: rule.name,
                        message: result.message
                    });
                }
            }
        }

        if (errors.length > 0) {
            throw {
                name: ErrorTypes.VALIDATION,
                message: 'Validation failed',
                details: errors
            };
        }

        return true;
    }

    static _validateRule(value, rule) {
        const validators = {
            required: (v) => ({
                valid: v !== undefined && v !== null && v !== '',
                message: 'Field is required'
            }),
            minLength: (v, min) => ({
                valid: String(v).length >= min,
                message: `Minimum length is ${min}`
            }),
            maxLength: (v, max) => ({
                valid: String(v).length <= max,
                message: `Maximum length is ${max}`
            }),
            min: (v, min) => ({
                valid: Number(v) >= min,
                message: `Minimum value is ${min}`
            }),
            max: (v, max) => ({
                valid: Number(v) <= max,
                message: `Maximum value is ${max}`
            }),
            pattern: (v, pattern) => ({
                valid: pattern.test(String(v)),
                message: 'Invalid format'
            }),
            custom: (v, fn) => ({
                valid: fn(v),
                message: 'Invalid value'
            })
        };

        return validators[rule.name](value, rule.param);
    }
}
