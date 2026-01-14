import { z } from "zod";

export const createScheduleValidator = z.object({
  modelId: z.object({ value: z.number(), label: z.string() }).refine((val) => val.value > 0, {
    message: "Model is required",
  }).transform((val) => val.value), // Transform to number for submission if needed, or handle in component
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// Since we're using react-select or similar which returns object {value, label}, 
// but we submit modelId as number. 
// I'll adjust the validator to accept the object structure from the form control 
// but ensure it maps correctly. 
// Actually simpler to validate the object existence and value.

export const createScheduleSchema = z.object({
  modelId: z.object({ 
    value: z.number(), 
    label: z.string() 
  }, { required_error: "Model is required" }),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});
