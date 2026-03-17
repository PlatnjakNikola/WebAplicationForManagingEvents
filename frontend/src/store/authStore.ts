import { create } from 'zustand'
import type { User } from '../types'
import api from '../lib/axios'

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
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { token, refreshToken, user } = data as { token: string; refreshToken: string; user: User }

      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, token, isAuthenticated: true })

      return { success: true }
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Pogrešan email ili lozinka'
      return { success: false, error: message }
    }
  },

  register: async (data) => {
    try {
      await api.post('/auth/register', data)
      return { success: true }
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Registracija nije uspjela'
      return { success: false, error: message }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
