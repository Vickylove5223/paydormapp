const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

const MOCK_USER = {
  id: 'mock-user-1',
  email: 'demo@paydorm.app',
  emailVerified: true,
  firstName: 'Adewale',
  lastName: 'Okonkwo',
  whatsappNumber: '+2348000000000',
  residentId: 'mock-resident-1',
  createdAt: '2026-01-01T00:00:00Z',
  avatarUrl: null,
};

const MOCK_TOKENS = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

type MockHandler = (body: any) => Promise<any>;

const handlers: Record<string, MockHandler> = {
  '/auth/signup': async (body) => {
    await delay();
    return {};
  },
  '/auth/verify-email': async (body) => {
    await delay();
    return {};
  },
  '/auth/resend-code': async (body) => {
    await delay();
    return {};
  },
  '/auth/login': async (body) => {
    await delay();
    return { user: { ...MOCK_USER, email: body?.email ?? MOCK_USER.email }, ...MOCK_TOKENS };
  },
  '/auth/signin': async (body) => {
    await delay();
    return { user: { ...MOCK_USER, email: body?.email ?? MOCK_USER.email }, ...MOCK_TOKENS };
  },
  '/auth/complete-onboarding': async (body) => {
    await delay();
    return {
      user: { ...MOCK_USER, ...body },
      ...MOCK_TOKENS,
    };
  },
  '/auth/forgot-password': async () => {
    await delay();
    return {};
  },
  '/auth/verify-reset-otp': async () => {
    await delay();
    return {};
  },
  '/auth/reset-password': async () => {
    await delay();
    return {};
  },
  '/properties/join/preview': async (body) => {
    await delay();
    return {
      propertyName: 'Sunshine Estate',
      householdName: 'Block A — Flat 3',
      role: 'Tenant',
      city: 'Lagos',
    };
  },
  '/properties/join': async () => {
    await delay();
    return {};
  },
};

export async function mockRequest<T>(path: string, body?: unknown): Promise<T> {
  const handler = handlers[path];
  if (handler) {
    return handler(body) as Promise<T>;
  }
  await delay(300);
  return {} as T;
}
