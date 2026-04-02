import { z } from "zod";

// Project validation schemas
export const projectSchema = z.object({
  title: z.string()
    .min(3, "Project title must be at least 3 characters")
    .max(100, "Project title must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_.,!?()]+$/, "Title contains invalid characters"),
  
  propertyType: z.enum(["hdb", "condo", "landed", "commercial", "other"], {
    errorMap: () => ({ message: "Please select a valid property type" })
  }),
  
  roomCount: z.coerce.number()
    .int("Room count must be a whole number")
    .min(0, "Room count cannot be negative")
    .max(50, "That's too many rooms!")
    .optional()
    .or(z.literal("")),
  
  budget: z.coerce.number()
    .min(0, "Budget cannot be negative")
    .max(10000000, "Budget seems too high")
    .optional()
    .or(z.literal("")),
  
  stylePreference: z.enum(["modern", "minimalist", "scandinavian", "industrial", "traditional", "eclectic", "coastal", "bohemian", "mid-century", "contemporary", "other"], {
    errorMap: () => ({ message: "Please select a valid style preference" })
  }).optional()
  .or(z.literal("")),
  
  notes: z.string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be less than 2000 characters")
    .trim(),
});

// File upload validation
export const fileUploadSchema = z.object({
  fileName: z.string()
    .min(1, "File name is required")
    .max(255, "File name too long"),
  
  fileSize: z.number()
    .min(1, "File cannot be empty")
    .max(50 * 1024 * 1024, "File size must be less than 50MB"),
  
  fileType: z.string()
    .regex(/^(image\/|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.|text\/)/, 
      "File type not supported. Please upload images, PDFs, or documents"),
});

// Quote validation
export const quoteSchema = z.object({
  contractorName: z.string()
    .min(1, "Contractor name is required")
    .max(200, "Contractor name too long"),
  
  totalAmount: z.coerce.number()
    .min(0, "Amount cannot be negative")
    .max(10000000, "Amount seems too high")
    .optional()
    .or(z.literal("")),
  
  notes: z.string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  
  status: z.enum(["pending", "accepted", "rejected", "negotiating"], {
    errorMap: () => ({ message: "Invalid status" })
  }).default("pending"),
});

// Estimate validation
export const estimateRequestSchema = z.object({
  rooms: z.array(z.object({
    type: z.enum(["kitchen", "bathroom", "bedroom", "living", "dining", "study", "other"]),
    size: z.coerce.number().min(1, "Size must be at least 1 sqft").max(10000, "Size seems too large"),
    condition: z.enum(["good", "average", "poor", "complete-overhaul"]),
  })).min(1, "At least one room is required"),
  
  propertyType: z.enum(["hdb", "condo", "landed", "commercial", "other"]),
  styleTier: z.enum(["basic", "standard", "premium"]),
  timeline: z.enum(["urgent", "normal", "flexible"]),
});

// Form validation utilities
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  validatedData: T | null;
} {
  try {
    const validatedData = schema.parse(data);
    return {
      isValid: true,
      errors: {},
      validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        isValid: false,
        errors,
        validatedData: null,
      };
    }
    return {
      isValid: false,
      errors: { _form: "Validation failed" },
      validatedData: null,
    };
  }
}

export function validateField<T>(
  schema: z.ZodSchema<T>,
  fieldName: string,
  value: unknown
): string {
  try {
    // Create a partial schema for just this field
    const fieldSchema = schema.shape?.[fieldName as keyof z.infer<typeof schema>];
    if (!fieldSchema) {
      return "";
    }
    
    // Validate the field
    fieldSchema.parse(value);
    return "";
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || "Invalid value";
    }
    return "Validation error";
  }
}

// Real-time validation helpers
export function createValidationHelpers<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData: T
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateAll = () => {
    const result = validateForm(schema, data);
    setErrors(result.errors);
    return result.isValid;
  };

  const validateField = (fieldName: keyof T) => {
    const error = validateField(schema, fieldName as string, data[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    return !error;
  };

  const handleChange = (fieldName: keyof T, value: any) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
    
    // Validate field if it's been touched
    if (touched[fieldName]) {
      validateField(fieldName);
    }
  };

  const handleBlur = (fieldName: keyof T) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  const reset = () => {
    setData(initialData);
    setErrors({});
    setTouched({});
  };

  return {
    data,
    errors,
    touched,
    setData,
    setErrors,
    setTouched,
    validateAll,
    validateField,
    handleChange,
    handleBlur,
    reset,
  };
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  price: /^\$?\d+(\.\d{2})?$/,
  percentage: /^100(\.0{1,2})?$|^\d{1,2}(\.\d{1,2})?$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
};

// Validation messages
export const validationMessages = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be less than ${max} characters`,
  minValue: (field: string, min: number) => `${field} must be at least ${min}`,
  maxValue: (field: string, max: number) => `${field} must be less than ${max}`,
  invalidFormat: (field: string) => `${field} format is invalid`,
  invalidType: (field: string, type: string) => `${field} must be a ${type}`,
};

// Form field configuration
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'email' | 'password' | 'date';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  validation?: (value: any) => string | null;
}

// Create form configuration from schema
export function createFormConfig<T>(schema: z.ZodSchema<T>): FormFieldConfig[] {
  // This is a simplified implementation
  // In a real app, you'd extract more metadata from the schema
  return [];
}

// Debounced validation
export function createDebouncedValidator(
  validator: (value: string) => string,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (value: string, callback: (error: string) => void) => {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      const error = validator(value);
      callback(error);
    }, delay);
  };
}

// Import useState for the helper function
import { useState } from "react";
