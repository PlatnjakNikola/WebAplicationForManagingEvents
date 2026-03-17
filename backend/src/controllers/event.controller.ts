import { Request, Response, NextFunction } from "express";
import * as eventService from "../services/event.service";
import type { EventInput } from "../validators/event.schema";
import type { EventQuery } from "../validators/query.schema";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await eventService.getAll(req.query as unknown as EventQuery);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventService.getById(Number(req.params.id));
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventService.create(req.body as EventInput);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventService.update(Number(req.params.id), req.body as EventInput);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await eventService.remove(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
