import { z } from "zod";

export const createProcessValidator = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
});

export const updateProcessValidator = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
}); 