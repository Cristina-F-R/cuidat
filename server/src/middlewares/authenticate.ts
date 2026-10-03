import jwt from 'jsonwebtoken'
import type { RequestHandler } from 'express'
import { env } from '../config/env.js'

export const authenticate: RequestHandler = (request, response, next) => {
  const authorization = request.header('authorization')
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) {
    response.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Se requiere una sesión válida.' } })
    return
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error('Invalid token subject')
    request.authUserId = payload.sub
    next()
  } catch {
    response.status(401).json({ success: false, error: { code: 'AUTH_INVALID', message: 'La sesión no es válida o ha caducado.' } })
  }
}