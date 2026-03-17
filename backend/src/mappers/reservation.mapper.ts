interface ReservationWithRelations {
  id: number;
  userId: number;
  eventId: number;
  numberOfTickets: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
  event: {
    title: string;
    dateTime: Date;
    hall: {
      theater: {
        name: string;
      };
    };
  };
}

export function toReservationResponse(r: ReservationWithRelations) {
  const dt = r.event.dateTime;
  return {
    id: String(r.id),
    userId: String(r.userId),
    eventId: String(r.eventId),
    eventTitle: r.event.title,
    theaterName: r.event.hall.theater.name,
    date: dt.toISOString().split("T")[0],
    time: dt.toTimeString().slice(0, 5),
    numberOfTickets: r.numberOfTickets,
    totalPrice: r.totalPrice,
    status: r.status as "confirmed" | "cancelled",
    createdAt: r.createdAt.toISOString(),
  };
}
