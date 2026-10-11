import { NavigatorScreenParams } from '@react-navigation/native';

// ── Auth Stack ────────────────────────────────────────────────────────────────
export type AuthStackParams = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  VerifyEmail: { email: string };
  PersonalDetails: { email: string };
  RoleProperty: { email: string; firstName: string; lastName: string; whatsappNumber: string };
  PropertySetup: { email: string; firstName: string; lastName: string; whatsappNumber: string; role: string };
  JoinCompound: { code?: string };
  ForgotPassword: undefined;
};

// ── Main Tabs ─────────────────────────────────────────────────────────────────
export type MainTabParams = {
  Home: undefined;
  Bills: undefined;
  Levies: undefined;
  Me: undefined;
};

// ── Home Stack ────────────────────────────────────────────────────────────────
export type HomeStackParams = {
  HomeMain: undefined;
  Notifications: undefined;
  BillDetail: { billId: string };
  PaymentDetail: { paymentId: string };
};

// ── Bills Stack ───────────────────────────────────────────────────────────────
export type BillsStackParams = {
  BillsMain: undefined;
  AddBill: { billId?: string; isPrivate?: boolean } | undefined;
  BillDetail: { billId: string };
};

// ── Levies Stack ──────────────────────────────────────────────────────────────
export type LeviesStackParams = {
  LeviesMain: undefined;
  PaymentDetail: { paymentId: string };
};

// ── Me Stack ──────────────────────────────────────────────────────────────────
export type MeStackParams = {
  MeMain: undefined;
  Profile: undefined;
  Wallet: undefined;
  CoPartner: undefined;
  Properties: undefined;
  AddProperty: undefined;
  AddHousehold: { propertyId: string };
  Notifications: undefined;
  MyPayments: undefined;
  GatePass: undefined;
  GatePassHistory: undefined;
  HelpSupport: undefined;
  Security: undefined;
};

// ── Root ──────────────────────────────────────────────────────────────────────
export type RootStackParams = {
  Auth: NavigatorScreenParams<AuthStackParams>;
  Main: NavigatorScreenParams<MainTabParams>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParams {}
  }
}
