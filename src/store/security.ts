import { create } from 'zustand';

interface SecurityState {
  biometricsEnabled: boolean;
  pinEnabled: boolean;
  pinCode: string | null;
  setBiometricsEnabled: (enabled: boolean) => void;
  setPin: (pin: string) => void;
  removePin: () => void;
}

export const useSecurityStore = create<SecurityState>((set) => ({
  biometricsEnabled: false,
  pinEnabled: false,
  pinCode: null,

  setBiometricsEnabled: (enabled) => set({ biometricsEnabled: enabled }),
  setPin: (pin) => set({ pinCode: pin, pinEnabled: true }),
  removePin: () => set({ pinCode: null, pinEnabled: false }),
}));
