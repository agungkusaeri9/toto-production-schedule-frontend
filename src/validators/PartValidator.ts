import { z } from "zod";

export const createPartValidator = z.object({
  name: z.string().min(1, "Name is required"),
});

export const updatePartValidator = createPartValidator;