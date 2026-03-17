import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { toReservationResponse } from "../mappers/reservation.mapper";
import type { CreateReservationInput } from "../validators/reservation.schema";

const reservationInclude = {
  event: {
    include: {
      hall: { include: { theater: { select: { name: true } } } },
    },
  },
} satisfies Prisma.ReservationInclude;

export async function getByUser(userId: number) {
  const reservations = await prisma.reservation.findMany({
    where: { userId },
    include: reservationInclude,
    orderBy: { createdAt: "desc" },
  });
  return reservations.map(toReservationResponse);
}

export async function getAllAdmin() {
  const reservations = await prisma.reservation.findMany({
    include: reservationInclude,
    orderBy: { createdAt: "desc" },
  });
  return reservations.map(toReservationResponse);
}

export async function create(userId: number, input: CreateReservationInput) {
  return await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: input.eventId },
      include: {
        reservations: { where: { status: "confirmed" }, select: { numberOfTickets: true } },
        hall: { include: { theater: { select: { name: true } } } },
      },
    });

    if (!event) {
      throw new AppError(404, "NOT_FOUND", "Event not found");
    }

    if (event.dateTime <= new Date()) {
      throw new AppError(400, "VALIDATION_ERROR", "Cannot reserve for past events");
    }

    const confirmedTickets = event.reservations.reduce((sum, r) => sum + r.numberOfTickets, 0);
    const availableSeats = event.totalSeats - confirmedTickets;

    if (availableSeats < input.numberOfTickets) {
      throw new AppError(400, "VALIDATION_ERROR", `Only ${availableSeats} seats available`);
    }

    const reservation = await tx.reservation.create({
      data: {
        userId,
        eventId: input.eventId,
        numberOfTickets: input.numberOfTickets,
        totalPrice: input.numberOfTickets * event.price,
        status: "confirmed",
      },
      include: reservationInclude,
    });

    return toReservationResponse(reservation);
  });
}

export async function cancel(id: number, userId: number) {
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation) {
    throw new AppError(404, "NOT_FOUND", "Reservation not found");
  }
  if (reservation.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "Not your reservation");
  }
  if (reservation.status !== "confirmed") {
    throw new AppError(400, "VALIDATION_ERROR", "Reservation is already cancelled");
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: "cancelled" },
    include: reservationInclude,
  });

  return toReservationResponse(updated);
}

export async function cancelAdmin(id: number) {
  const reservation = await prisma.reservation.findUnique({ where: { id } });

  if (!reservation) {
    throw new AppError(404, "NOT_FOUND", "Reservation not found");
  }
  if (reservation.status !== "confirmed") {
    throw new AppError(400, "VALIDATION_ERROR", "Reservation is already cancelled");
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: "cancelled" },
    include: reservationInclude,
  });

  return toReservationResponse(updated);
}
