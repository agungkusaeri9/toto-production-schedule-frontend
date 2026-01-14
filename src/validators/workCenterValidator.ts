import { z } from "zod";

export const createWorkCenterValidator = z.object({
  name: z.string().min(1, "Name is required"),
  processComponents: z.array(
    z.object({
      partName: z.string().min(1, "Part Name is required"),
      operationNumber: z.string().min(1, "Operation Number is required"),
      workCenterName: z.string().min(1, "Work Center Name is required"),
      workCenterCategory: z.string().min(1, "Work Center Category is required"),
      baseQuantity: z.coerce.number().min(1, "Base Quantity is required"),
      setup: z.coerce.number().min(0, "Setup is required"),
      cycleTime: z.coerce.number().min(0, "Cycle Time is required"),
    })
  ).optional(), // Can be optional on creation if user doesn't add any immediately
});

export const updateWorkCenterValidator = createWorkCenterValidator;
