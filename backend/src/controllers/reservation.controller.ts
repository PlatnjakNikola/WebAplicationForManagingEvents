import { Request, Response, NextFunction } from "express";
import * as reservationService from "../services/reservation.service";
import type { CreateReservationInput } from "../validators/reservation.schema";

export async function getByUser(req: Request, res: Response, next: NextFunction) {
  try {
    const reservations = await reservationService.getByUser(req.user!.sub);
    res.json(reservations);
  } catch (err) {
    next(err);
  }
}

export async function getAllAdmin(_req: Request, res: Response, next: NextFunction) {
  try {
    const reservations = await reservationService.getAllAdmin();
    res.json(reservations);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const reservation = await reservationService.create(req.user!.sub, req.body as CreateReservationInput);
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const reservation = await reservationService.cancel(Number(req.params.id), req.user!.sub);
    res.json(reservation);
  } catch (err) {
    next(err);
  }
}

export async function cancelAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const reservation = await reservationService.cancelAdmin(Number(req.params.id));
    res.json(reservation);
  } catch (err) {
    next(err);
  }
}
