import { z } from "zod";

export const createModelValidator = z.object({
  name: z.string().min(1, "Name is required"),
  created: z.string().min(1, "Created date is required"),
  processDetails: z.array(
    z.object({
      modelName: z.string().min(1, "Model Name is required"),
      partName: z.string().min(1, "Part Name is required"),
      operatorNumber: z.string().min(1, "Operator Number is required"),
      bom: z.coerce.number().min(1, "BOM is required"),
    })
  ).min(1, "At least one process detail is required"),
});

export const updateModelValidator = createModelValidator;
