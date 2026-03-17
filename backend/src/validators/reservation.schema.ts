import { z } from "zod";

export const createReservationSchema = z.object({
  eventId: z.number().int().min(1),
  numberOfTickets: z.number().int().min(1).max(10),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
