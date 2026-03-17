import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").transform((v) => v.trim()),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:mm"),
  theaterId: z.number().int().min(1),
  pricePerTicket: z.number().min(0, "Price must be positive"),
  totalSeats: z.number().int().min(1, "Must have at least 1 seat"),
  duration: z.number().int().min(1, "Duration must be at least 1 minute"),
  imageUrl: z.string().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;
