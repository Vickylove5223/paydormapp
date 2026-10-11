import { create } from 'zustand';
import { UserRole } from '@/types';

interface AppState {
  activePropertyId: string | null;
  activeHouseholdId: string | null;
  role: UserRole | null;
  privateMode: boolean; // true when user has no memberships

  setActiveContext: (propertyId: string, householdId: string, role: UserRole) => void;
  setPrivateMode: (val: boolean) => void;
  clearContext: () => void;

  // Notification badge count
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  clearUnread: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePropertyId: null,
  activeHouseholdId: null,
  role: null,
  privateMode: true,

  unreadCount: 0,

  setActiveContext: (propertyId, householdId, role) =>
    set({
      activePropertyId: propertyId,
      activeHouseholdId: householdId,
      role,
      privateMode: false,
    }),

  setPrivateMode: (val) => set({ privateMode: val }),

  clearContext: () =>
    set({
      activePropertyId: null,
      activeHouseholdId: null,
      role: null,
      privateMode: true,
    }),

  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnread: () =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  clearUnread: () => set({ unreadCount: 0 }),
}));
