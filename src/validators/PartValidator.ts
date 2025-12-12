import { z } from "zod";


const selectOptionSchema = z.object({
    value: z.number(),
    label: z.string()
}).nullable();


export const createPartValidator = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  customerId: selectOptionSchema,

});

export const updatePartValidator = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  customerId: selectOptionSchema,
}); 