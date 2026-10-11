import { useAuthStore } from '@/store/auth';
import { mockRequest } from './mock';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.paydorm.app/v1';
const USE_MOCK = true; // backend not yet live — all calls use local mock data

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { idempotencyKey?: string } = {}
): Promise<T> {
  if (USE_MOCK) {
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    return mockRequest<T>(path, body);
  }

  const { accessToken } = useAuthStore.getState();
  const { idempotencyKey, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    ...fetchOptions.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ code: 'unknown', message: res.statusText }));
    throw new ApiError(body.code ?? 'unknown', body.message ?? res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown, opts?: { idempotencyKey?: string }) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'DELETE',
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
};

export { ApiError };
