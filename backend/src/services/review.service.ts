import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { toReviewResponse } from "../mappers/review.mapper";
import type { CreateReviewInput } from "../validators/review.schema";

const reviewInclude = {
  user: { select: { firstName: true, lastName: true, email: true } },
  event: {
    include: {
      hall: { include: { theater: { select: { name: true } } } },
    },
  },
} satisfies Prisma.ReviewInclude;

export async function getByUser(userId: number) {
  const reviews = await prisma.review.findMany({
    where: { userId },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
  });
  return reviews.map(toReviewResponse);
}

export async function getAllAdmin(query?: { eventTitle?: string; sort?: string }) {
  const where: Prisma.ReviewWhereInput = {};

  if (query?.eventTitle) {
    where.event = { title: { contains: query.eventTitle } };
  }

  const orderBy: Prisma.ReviewOrderByWithRelationInput =
    query?.sort === "date_asc" ? { createdAt: "asc" } : { createdAt: "desc" };

  const reviews = await prisma.review.findMany({
    where,
    include: reviewInclude,
    orderBy,
  });
  return reviews.map(toReviewResponse);
}

export async function create(userId: number, input: CreateReviewInput) {
  const existing = await prisma.review.findFirst({
    where: { userId, eventId: input.eventId },
  });
  if (existing) {
    throw new AppError(409, "CONFLICT", "You already reviewed this event");
  }

  const review = await prisma.review.create({
    data: {
      userId,
      eventId: input.eventId,
      rating: input.rating,
      comment: input.comment,
    },
    include: reviewInclude,
  });

  return toReviewResponse(review);
}

export async function remove(id: number, userId: number) {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    throw new AppError(404, "NOT_FOUND", "Review not found");
  }
  if (review.userId !== userId) {
    throw new AppError(403, "FORBIDDEN", "Not your review");
  }

  await prisma.review.delete({ where: { id } });
}
