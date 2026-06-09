import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

type ApiError = { message?: string };

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const body = response.status === 204 ? (undefined as unknown as T & ApiError) : await parseBody<T & ApiError>(response);
  if (!response.ok) {
    throw new Error(body?.message ?? '發生錯誤，請稍後再試');
  }
  return body;
}

async function parseBody<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}
