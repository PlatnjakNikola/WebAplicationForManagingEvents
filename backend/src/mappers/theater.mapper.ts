interface TheaterFromDB {
  id: number;
  name: string;
  address: string;
  description: string;
  capacity: number;
  contact: string;
  workingHours: string;
  latitude: number;
  longitude: number;
}

export function toTheaterResponse(theater: TheaterFromDB) {
  return {
    id: String(theater.id),
    name: theater.name,
    address: theater.address,
    description: theater.description,
    capacity: theater.capacity,
    contact: theater.contact,
    workingHours: theater.workingHours,
    latitude: theater.latitude,
    longitude: theater.longitude,
  };
}
