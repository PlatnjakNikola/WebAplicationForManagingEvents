export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
}

export interface Theater {
  id: string
  name: string
  address: string
  description: string
  capacity: number
  contact: string
  workingHours: string
  latitude: number
  longitude: number
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  theaterId: string
  theaterName: string
  pricePerTicket: number
  totalSeats: number
  availableSeats: number
  imageUrl: string
  duration: string
}

export interface Reservation {
  id: string
  userId: string
  eventId: string
  eventTitle: string
  theaterName: string
  date: string
  numberOfTickets: number
  totalPrice: number
  status: 'active' | 'cancelled' | 'used'
}

export interface Review {
  id: string
  userId: string
  userName: string
  eventId: string
  eventTitle: string
  theaterName: string
  rating: number
  comment?: string
  createdAt: string
}
