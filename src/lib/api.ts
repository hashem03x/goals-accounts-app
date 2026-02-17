/**
 * API service layer - single place for all backend calls.
 * Uses NEXT_PUBLIC_API_URL; throws on non-OK for consistent error handling.
 */
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: { page: number; limit: number; total: number; pages: number };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `خطأ: ${res.status}`);
  }
  return json as ApiResponse<T>;
}

// Goals
export const goalsApi = {
  list: (params?: { type?: string; status?: string; sort?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.status) q.set('status', params.status);
    if (params?.sort) q.set('sort', params.sort);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return request<unknown[]>(`/goals?${q}`);
  },
  get: (id: string) => request<unknown>(`/goals/${id}`),
  create: (body: Record<string, unknown>) =>
    request<unknown>('/goals', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) =>
    request<unknown>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<unknown>(`/goals/${id}`, { method: 'DELETE' }),
};

// Accounts
export const accountsApi = {
  list: (params?: {
    type?: string;
    search?: string;
    from?: string;
    to?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.search) q.set('search', params.search);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    if (params?.sort) q.set('sort', params.sort);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return request<unknown[]>(`/accounts?${q}`);
  },
  get: (id: string) => request<unknown>(`/accounts/${id}`),
  create: (body: Record<string, unknown>) =>
    request<unknown>('/accounts', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) =>
    request<unknown>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<unknown>(`/accounts/${id}`, { method: 'DELETE' }),
};

// Dashboard
export const dashboardApi = {
  get: () =>
    request<{
      summary: {
        totalIncoming: number;
        totalOutgoing: number;
        balance: number;
        pendingGoals: number;
        completedGoals: number;
      };
      charts: {
        incomingByMonth: { label: string; value: number }[];
        outgoingByMonth: { label: string; value: number }[];
        goalsByStatus: { status: string; count: number }[];
      };
    }>('/dashboard'),
};
