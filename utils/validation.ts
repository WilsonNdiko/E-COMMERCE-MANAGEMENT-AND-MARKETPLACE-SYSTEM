import { z } from "zod";

// Common validation patterns
export const commonValidations = {
  // Email validation with clean normalization
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .max(254, "Email must be no more than 254 characters")
    .email("Please provide a valid email address")
    .refine(
      (email) => {
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+\s*=/i,
          /data:/i,
        ];
        return !suspiciousPatterns.some((pattern) => pattern.test(email));
      },
      "Email contains invalid characters"
    ),

  // Shopper-friendly password validation (6+ chars, supports all characters)
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password must be no more than 128 characters"),

  // Request size validation
  validateRequestSize: (contentLength: number | null) => {
    const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB limit
    if (contentLength && contentLength > MAX_REQUEST_SIZE) {
      throw new Error("Request payload too large");
    }
  },

  // Rate limiting helper (basic implementation)
  rateLimit: new Map<string, { count: number; resetTime: number }>(),
  
  checkRateLimit: (identifier: string, maxRequests: number = 5, windowMs: number = 15 * 60 * 1000) => {
    const now = Date.now();
    const userLimit = commonValidations.rateLimit.get(identifier);
    
    if (!userLimit || now > userLimit.resetTime) {
      commonValidations.rateLimit.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (userLimit.count >= maxRequests) {
      return false;
    }
    
    userLimit.count++;
    return true;
  }
};

// Sanitization helpers
export const sanitizeInput = {
  // Remove potentially dangerous characters
  sanitizeString: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  },

  // Validate and sanitize JSON input
  validateJsonInput: async (request: Request) => {
    const contentLength = request.headers.get("content-length");
    commonValidations.validateRequestSize(contentLength ? parseInt(contentLength) : null);

    try {
      return await request.json();
    } catch (error) {
      throw new Error("Invalid JSON format");
    }
  }
};
