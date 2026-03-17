import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { buildPaginatedResponse } from "../utils/pagination";
import { toEventResponse } from "../mappers/event.mapper";
import type { EventInput } from "../validators/event.schema";
import type { EventQuery } from "../validators/query.schema";

const eventInclude = {
  hall: { include: { theater: { select: { id: true, name: true } } } },
  reservations: { select: { status: true, numberOfTickets: true } },
} satisfies Prisma.EventInclude;

export async function getAll(query: EventQuery) {
  const { page, limit, search, theaterId, sort, dateFrom, dateTo } = query;

  const where: Prisma.EventWhereInput = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (theaterId) {
    where.hall = { theaterId };
  }

  if (dateFrom || dateTo) {
    where.dateTime = {};
    if (dateFrom) where.dateTime.gte = new Date(dateFrom);
    if (dateTo) where.dateTime.lte = new Date(dateTo + "T23:59:59");
  }

  const orderBy: Prisma.EventOrderByWithRelationInput = (() => {
    switch (sort) {
      case "date_desc": return { dateTime: "desc" as const };
      case "price_asc": return { price: "asc" as const };
      case "price_desc": return { price: "desc" as const };
      default: return { dateTime: "asc" as const };
    }
  })();

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: eventInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  return buildPaginatedResponse(events.map(toEventResponse), total, page, limit);
}

export async function getById(id: number) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: eventInclude,
  });
  if (!event) {
    throw new AppError(404, "NOT_FOUND", "Event not found");
  }
  return toEventResponse(event);
}

export async function create(input: EventInput) {
  const hall = await prisma.hall.findFirst({ where: { theaterId: input.theaterId } });
  if (!hall) {
    throw new AppError(404, "NOT_FOUND", "Theater not found");
  }

  const event = await prisma.event.create({
    data: {
      title: input.title,
      description: input.description,
      dateTime: new Date(`${input.date}T${input.time}:00`),
      duration: input.duration,
      price: input.pricePerTicket,
      totalSeats: input.totalSeats,
      imageUrl: input.imageUrl,
      hallId: hall.id,
    },
    include: eventInclude,
  });

  return toEventResponse(event);
}

export async function update(id: number, input: EventInput) {
  const hall = await prisma.hall.findFirst({ where: { theaterId: input.theaterId } });
  if (!hall) {
    throw new AppError(404, "NOT_FOUND", "Theater not found");
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      dateTime: new Date(`${input.date}T${input.time}:00`),
      duration: input.duration,
      price: input.pricePerTicket,
      totalSeats: input.totalSeats,
      imageUrl: input.imageUrl,
      hallId: hall.id,
    },
    include: eventInclude,
  });

  return toEventResponse(event);
}

export async function remove(id: number) {
  await prisma.review.deleteMany({ where: { eventId: id } });
  await prisma.reservation.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });
}
