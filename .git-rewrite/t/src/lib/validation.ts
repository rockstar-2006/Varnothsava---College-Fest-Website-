// Validation Schemas for API Routes

import { z } from 'zod';

/**
 * Validation helper to format Zod errors
 */
export function formatValidationErrors(error: z.ZodError): string {
    return error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
}

// User Registration Schema - MINIMAL
export const registerUserSchema = z.object({
    user: z.object({
        name: z.string().min(1, 'Name is required').trim(),
        usn: z.string().min(1, 'USN is required').trim(),
        collegeName: z.string().min(1, 'College name is required').trim(),
        phone: z.string().min(10, 'Phone must be at least 10 digits').trim(),
        // Optional fields - ignore if empty string
        email: z.string().optional().transform(val => val || undefined),
        age: z.string().optional().transform(val => val || undefined),
        idCardUrl: z.string().optional().transform(val => val || undefined),
    })
});

// Mission/Event Registration Schema
export const registerMissionSchema = z.object({
    eventId: z.string()
        .min(1, 'Event ID is required')
        .transform(val => val.trim()),

    teamName: z.string()
        .min(2, 'Team name must be at least 2 characters')
        .max(100, 'Team name must be less than 100 characters')
        .transform(val => val.trim()),

    members: z.array(z.string())
        .optional()
        .default([])
        .transform(arr => arr.map(m => m.trim()).filter(m => m.length > 0)),
});

// Avatar Update Schema
export const updateAvatarSchema = z.object({
    avatar: z.string()
        .url('Invalid avatar URL')
        .transform(val => val.trim()),
});

// Login Schema
export const loginSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .toLowerCase()
        .transform(val => val.trim()),

    password: z.string()
        .min(6, 'Password must be at least 6 characters'),
});

/**
 * Validate request body against a schema
 */
export async function validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: formatValidationErrors(error) };
        }
        return { success: false, error: 'Validation failed' };
    }
}
