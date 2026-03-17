import { z } from "zod";

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
  theaterId: z.coerce.number().int().optional(),
  sort: z.enum(["date_asc", "date_desc", "price_asc", "price_desc"]).default("date_asc"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type EventQuery = z.infer<typeof eventQuerySchema>;
