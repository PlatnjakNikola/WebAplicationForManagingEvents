interface EventWithRelations {
  id: number;
  title: string;
  description: string | null;
  dateTime: Date;
  duration: number;
  price: number;
  totalSeats: number;
  imageUrl: string | null;
  hall: {
    theater: {
      id: number;
      name: string;
    };
  };
  reservations: {
    status: string;
    numberOfTickets: number;
  }[];
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

export function toEventResponse(event: EventWithRelations) {
  const confirmedTickets = event.reservations
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.numberOfTickets, 0);

  const dt = event.dateTime;

  return {
    id: String(event.id),
    title: event.title,
    description: event.description ?? "",
    date: dt.toISOString().split("T")[0],
    time: dt.toTimeString().slice(0, 5),
    theaterId: String(event.hall.theater.id),
    theaterName: event.hall.theater.name,
    pricePerTicket: event.price,
    totalSeats: event.totalSeats,
    availableSeats: event.totalSeats - confirmedTickets,
    imageUrl: event.imageUrl ?? "",
    duration: formatDuration(event.duration),
  };
}
