import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: 'picnicutkal-auth' }
  )
)

export const useUIStore = create(
  (set) => ({
    isMobileMenuOpen: false,
    isSearchOpen: false,
    setMobileMenu: (val) => set({ isMobileMenuOpen: val }),
    setSearchOpen: (val) => set({ isSearchOpen: val }),
  })
)