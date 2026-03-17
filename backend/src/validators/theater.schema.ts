import { z } from "zod";

export const theaterSchema = z.object({
  name: z.string().min(1, "Name is required").transform((v) => v.trim()),
  address: z.string().min(1, "Address is required").transform((v) => v.trim()),
  description: z.string().min(1, "Description is required").transform((v) => v.trim()),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  contact: z.string().min(1, "Contact is required").transform((v) => v.trim()),
  workingHours: z.string().min(1, "Working hours is required").transform((v) => v.trim()),
});

export type TheaterInput = z.infer<typeof theaterSchema>;
