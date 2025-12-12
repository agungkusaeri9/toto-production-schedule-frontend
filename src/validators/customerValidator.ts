import { z } from "zod";

export const createCustomerValidator = z.object({
  name: z.string().min(1, "Name is required"),
});

export const updateCustomerValidator = z.object({
  name: z.string().min(1, "Name is required"),
}); 