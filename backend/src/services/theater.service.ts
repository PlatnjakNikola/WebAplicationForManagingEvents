import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { toTheaterResponse } from "../mappers/theater.mapper";

export async function getAll() {
  const theaters = await prisma.theater.findMany({
    orderBy: { name: "asc" },
  });
  return theaters.map(toTheaterResponse);
}

export async function getById(id: number) {
  const theater = await prisma.theater.findUnique({
    where: { id },
  });
  if (!theater) {
    throw new AppError(404, "NOT_FOUND", "Theater not found");
  }
  return toTheaterResponse(theater);
}

export async function create(data: {
  name: string;
  address: string;
  description: string;
  capacity: number;
  contact: string;
  workingHours: string;
}) {
  const theater = await prisma.theater.create({
    data: {
      ...data,
      latitude: 0,
      longitude: 0,
      halls: {
        create: { name: "Glavna dvorana", seats: data.capacity },
      },
    },
  });
  return toTheaterResponse(theater);
}

export async function update(
  id: number,
  data: {
    name: string;
    address: string;
    description: string;
    capacity: number;
    contact: string;
    workingHours: string;
  }
) {
  const theater = await prisma.theater.update({
    where: { id },
    data,
  });

  // Update default hall seats if capacity changed
  await prisma.hall.updateMany({
    where: { theaterId: id },
    data: { seats: data.capacity },
  });

  return toTheaterResponse(theater);
}

export async function remove(id: number) {
  // Check if theater has events via halls
  const eventsCount = await prisma.event.count({
    where: { hall: { theaterId: id } },
  });
  if (eventsCount > 0) {
    throw new AppError(409, "CONFLICT", "Cannot delete theater with existing events");
  }

  await prisma.hall.deleteMany({ where: { theaterId: id } });
  await prisma.theater.delete({ where: { id } });
}
