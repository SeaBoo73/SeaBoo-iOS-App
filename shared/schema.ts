export interface User {
  id: number
  email: string
  name?: string
  firstName?: string
  username?: string
  createdAt: Date
  updatedAt: Date
  role?: 'user' | 'owner' | 'admin'
}

export interface Boat {
  id: number
  name: string
  type: 'yacht' | 'catamarano' | 'gommone' | 'barca-vela' | 'motoscafo' | 'barche-senza-patente' | 'charter'
  description: string
  capacity: number
  maxPersons?: number
  pricePerDay: number
  location: string
  port?: string
  length?: number
  images: string[]
  ownerId: number
  rating?: number
  reviewCount?: number
  amenities: string[]
  isAvailable: boolean
  pickupTime?: string
  returnTime?: string
  dailyReturnRequired?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: number
  userId: number
  boatId: number
  startDate: Date
  endDate: Date
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  guestCount: number
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: number
  userId: number
  boatId: number
  bookingId: number
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

export interface Analytics {
  id: number
  boatId: number
  views: number
  bookings: number
  revenue: string
  conversionRate: string
  date: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface HealthResponse {
  status: string
  message: string
  timestamp?: string
}