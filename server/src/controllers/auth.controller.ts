import type { RequestHandler } from 'express'
import { AuthError, login, upgradeAccount } from '../services/auth.service.js'

function sendKnownAuthError(error: unknown, response: Parameters<RequestHandler>[1]): boolean {
  if (error instanceof AuthError && error.code === 'INVALID_CREDENTIALS') {
    response.status(401).json({ success: false, error: { code: error.code, message: 'Correo o contraseña incorrectos.' } })
    return true
  }
  if (error instanceof AuthError && error.code === 'EMAIL_EXISTS') {
    response.status(409).json({ success: false, error: { code: error.code, message: 'Ya existe una cuenta con ese correo.' } })
    return true
  }
  return false
}

export const loginController: RequestHandler = async (request, response) => {
  try {
    const result = await login(request.body)
    response.json({ success: true, data: result })
  } catch (error) {
    if (!sendKnownAuthError(error, response)) throw error
  }
}

export const upgradeController: RequestHandler = async (request, response) => {
  try {
    const result = await upgradeAccount(request.body)
    response.status(201).json({ success: true, data: result })
  } catch (error) {
    if (!sendKnownAuthError(error, response)) throw error
  }
}