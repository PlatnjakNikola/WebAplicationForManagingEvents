import { Request, Response, NextFunction } from "express";
import * as theaterService from "../services/theater.service";
import type { TheaterInput } from "../validators/theater.schema";

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const theaters = await theaterService.getAll();
    res.json(theaters);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const theater = await theaterService.getById(Number(req.params.id));
    res.json(theater);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const theater = await theaterService.create(req.body as TheaterInput);
    res.status(201).json(theater);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const theater = await theaterService.update(Number(req.params.id), req.body as TheaterInput);
    res.json(theater);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await theaterService.remove(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
