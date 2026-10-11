import { create } from 'zustand';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (partial: Partial<User>) => void;
  clearAuth: () => void;
}

const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'demo@paydorm.app',
  emailVerified: true,
  firstName: 'Adewale',
  lastName: 'Okonkwo',
  whatsappNumber: '+2348000000000',
  residentId: 'PD-84729',
  avatarUrl: 'mascot:piggy',
  createdAt: '2026-01-01T00:00:00Z',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: MOCK_USER,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  isAuthenticated: true,

  setAuth: (user, accessToken, refreshToken) =>
    set({ user, accessToken, refreshToken, isAuthenticated: true }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),

  clearAuth: () =>
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
}));
