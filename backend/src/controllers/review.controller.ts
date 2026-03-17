import { Request, Response, NextFunction } from "express";
import * as reviewService from "../services/review.service";
import type { CreateReviewInput } from "../validators/review.schema";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await reviewService.getAll();
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function getByUser(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await reviewService.getByUser(req.user!.sub);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function getAllAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await reviewService.getAllAdmin({
      eventTitle: req.query.eventTitle as string | undefined,
      sort: req.query.sort as string | undefined,
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await reviewService.create(req.user!.sub, req.body as CreateReviewInput);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await reviewService.remove(Number(req.params.id), req.user!.sub);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
