// ── User ──────────────────────────────────────────────────────────────────────
export type UserRole = 'tenant' | 'master_tenant' | 'landlord' | 'agent';
export type MembershipStatus = 'invited' | 'active' | 'removed';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  whatsappNumber: string;
  avatarUrl?: string;
  residentId: string;
  createdAt: string;
}

// ── Property / Household ──────────────────────────────────────────────────────
export type PropertyType = 'estate' | 'compound' | 'block' | 'building';

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: PropertyType;
  verified: boolean;
  createdBy: string;
}

export interface Household {
  id: string;
  propertyId: string;
  name: string;
  floorOrBlock?: string;
  inviteCode: string;
}

export interface Membership {
  id: string;
  userId: string;
  propertyId: string;
  householdId: string;
  role: UserRole;
  sharesBills: boolean;
  status: MembershipStatus;
}

// ── Bills ─────────────────────────────────────────────────────────────────────
export type BillType = 'shared' | 'one_time' | 'private' | 'copartner' | 'electricity' | 'water' | 'service_charge' | 'security' | 'waste' | 'internet' | 'other';
export type BillState = 'upcoming' | 'due' | 'overdue' | 'partially_paid' | 'paid';

export interface BillLineItem {
  id: string;
  billId: string;
  label: string;
  description: string;
  category: string;
  amount: number; // kobo
}

export interface Bill {
  id: string;
  propertyId?: string;
  householdId?: string;
  ownerId?: string;
  type: BillType;
  period?: string; // YYYY-MM
  title: string;
  totalAmount: number; // kobo
  dueDate: string; // ISO
  state: BillState;
  lineItems?: BillLineItem[];
}

export interface BillAllocation {
  id: string;
  billId: string;
  payerType: 'household' | 'user';
  payerId: string;
  amountDue: number;
  amountPaid: number;
  state: BillState;
  // denormalised display fields returned by the API
  amount: number;
  paid: boolean;
  memberName?: string;
  householdName?: string;
}

// ── Payments ──────────────────────────────────────────────────────────────────
export type PaymentMethod = 'wallet' | 'card' | 'transfer';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Payment {
  id: string;
  allocationId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  createdAt: string;
  billTitle?: string;
}

export interface Receipt {
  id: string;
  paymentId: string;
  number: string;
  issuedAt: string;
  shareUrl?: string;
}

// ── Wallet ────────────────────────────────────────────────────────────────────
export type WalletTransactionType = 'top_up' | 'payment' | 'refund' | 'withdrawal';
export type DirectDebitStatus = 'pending' | 'active' | 'cancelled';
export type WithdrawalStatus = 'pending' | 'success' | 'failed';

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // kobo
}

export interface VirtualAccount {
  id: string;
  userId: string;
  provider: 'paystack';
  bankName: string;
  accountNumber: string;
  accountName: string;
  providerRef: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  reference: string;
  createdAt: string;
}

export interface DirectDebitMandate {
  id: string;
  userId: string;
  bankAccountId: string;
  providerRef: string;
  status: DirectDebitStatus;
}

export interface BankAccount {
  id: string;
  userId: string;
  purpose: 'withdrawal' | 'payout';
  bankName: string;
  accountNumber: string; // masked
  accountName: string;
  verified: boolean;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export type NotificationType =
  | 'bill_due_soon'
  | 'bill_due_today'
  | 'payment_received'
  | 'payment_success'
  | 'payment_failed'
  | 'new_bill_added'
  | 'copartner_invited'
  | 'copartner_removed'
  | 'removal_needs_decision'
  | 'wallet_topup'
  | 'wallet_withdrawal'
  | 'direct_debit_result';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt?: string;
  data: Record<string, string>;
  createdAt: string;
}

// ── Co-partner split ──────────────────────────────────────────────────────────
export type SplitMode = 'equal' | 'percent' | 'fixed';

export interface CoPartnerSplit {
  id: string;
  householdId: string;
  billId?: string;
  membershipId: string;
  mode: SplitMode;
  value: number;
}

// ── Tenant removal ────────────────────────────────────────────────────────────
export type RemovalTreatment = 'split' | 'no_split';

export interface TenantRemoval {
  id: string;
  householdId: string;
  removedMembershipId: string;
  treatment: RemovalTreatment;
  appliesFrom: string;
  decidedBy: string;
  createdAt: string;
}

// ── Levies row ────────────────────────────────────────────────────────────────
export interface LevyRow {
  paymentId: string;
  tenantId: string;
  tenantName: string;
  avatarUrl?: string;
  billTitle: string;
  billType: BillType;
  amount: number;
  createdAt: string;
}

// ── Home recent payment ───────────────────────────────────────────────────────
export interface RecentPayment {
  paymentId: string;
  tenantName: string;
  avatarUrl?: string;
  billTitle: string;
  amount: number;
  createdAt: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
