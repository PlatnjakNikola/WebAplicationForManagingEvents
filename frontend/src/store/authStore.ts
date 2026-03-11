import { create } from 'zustand'
import type { User } from '../types'

// Mock users for development (mutable array so register() can add new users)
const MOCK_USERS: { id: string; email: string; password: string; firstName: string; lastName: string; role: 'user' | 'admin' }[] = [
  {
    id: '1',
    email: 'user@theatrum.hr',
    password: 'User1234',
    firstName: 'Marko',
    lastName: 'Horvat',
    role: 'user' as const,
  },
  {
    id: '2',
    email: 'admin@theatrum.hr',
    password: 'Admin1234',
    firstName: 'Ana',
    lastName: 'Kovačević',
    role: 'admin' as const,
  },
]

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isHydrated: false,

  hydrate: () => {
    const token = localStorage.getItem('token')
    const userJson = localStorage.getItem('user')
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User
        set({ user, token, isAuthenticated: true, isHydrated: true })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ isHydrated: true })
      }
    } else {
      set({ isHydrated: true })
    }
  },

  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 800))

    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    )

    if (!found) {
      return { success: false, error: 'Pogrešan email ili lozinka' }
    }

    const { password: _, ...user } = found
    const token = `mock-jwt-${user.id}-${Date.now()}`

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })

    return { success: true }
  },

  register: async (data) => {
    await new Promise((r) => setTimeout(r, 800))

    const exists = MOCK_USERS.find((u) => u.email === data.email)
    if (exists) {
      return { success: false, error: 'Korisnik s tim emailom već postoji' }
    }

    MOCK_USERS.push({
      id: String(MOCK_USERS.length + 1),
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
    })

    return { success: true }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
