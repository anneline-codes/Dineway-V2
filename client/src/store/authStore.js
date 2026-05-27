import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      isLoading: false,
      error: null,

      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),

      // Set error
      setError: (error) => set({ error }),

      // Login - store user and token
      login: (user, accessToken) => set({
        user,
        isAuthenticated: true,
        accessToken,
        isLoading: false,
        error: null,
      }),

      // Logout - clear user and token
      logout: () => set({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        isLoading: false,
        error: null,
      }),

      // Update user data
      updateUser: (userData) => set({ user: userData }),

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'dineway-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useAuthStore;