import { AUTH_TOKEN_KEY } from '../stores/guestStorage'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface ApiSuccess<T> {
  success: true
  data: T
}

interface ApiFailure {
  success: false
  error: { code: string; message: string }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const result: unknown = await response.json()
  if (!isRecord(result) || typeof result.success !== 'boolean') {
    throw new Error('La respuesta del servidor no es válida.')
  }
  if (result.success === false) {
    const failure = result as unknown as ApiFailure
    throw new Error(failure.error.message)
  }
  return (result as unknown as ApiSuccess<T>).data
}

export function loginRequest(credentials: { email: string; password: string }): Promise<{ token: string; email: string }> {
  return post('/auth/login', credentials)
}

export function upgradeRequest(payload: unknown): Promise<{ token: string; email: string }> {
  return post('/auth/upgrade', payload)
}

export async function authenticatedGet<T>(path: string): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) throw new Error('Se requiere iniciar sesión para continuar.')
  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const result: unknown = await response.json()
  if (!isRecord(result) || typeof result.success !== 'boolean') {
    throw new Error('La respuesta del servidor no es válida.')
  }
  if (result.success === false) {
    const failure = result as unknown as ApiFailure
    throw new Error(failure.error.message)
  }
  return (result as unknown as ApiSuccess<T>).data
}

export async function authenticatedDelete(path: string): Promise<void> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) throw new Error('Se requiere iniciar sesión para continuar.')
  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const result: unknown = await response.json()
  if (!isRecord(result) || typeof result.success !== 'boolean') {
    throw new Error('La respuesta del servidor no es válida.')
  }
  if (result.success === false) {
    const failure = result as unknown as ApiFailure
    throw new Error(failure.error.message)
  }
}