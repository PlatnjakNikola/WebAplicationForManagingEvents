interface ReviewWithRelations {
  id: number;
  userId: number;
  eventId: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  event: {
    title: string;
    hall: {
      theater: {
        name: string;
      };
    };
  };
}

export function toReviewResponse(r: ReviewWithRelations) {
  return {
    id: String(r.id),
    userId: String(r.userId),
    userName: `${r.user.firstName} ${r.user.lastName}`,
    userEmail: r.user.email,
    eventId: String(r.eventId),
    eventTitle: r.event.title,
    theaterName: r.event.hall.theater.name,
    rating: r.rating,
    comment: r.comment ?? undefined,
    createdAt: r.createdAt.toISOString(),
  };
}
