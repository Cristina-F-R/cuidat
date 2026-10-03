import type { RequestHandler } from 'express'
import { listProfilesForUser } from '../repositories/profile.repository.js'

export const profilesController: RequestHandler = async (request, response) => {
  if (!request.authUserId) {
    response.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Se requiere una sesión válida.' } })
    return
  }
  const profiles = await listProfilesForUser(request.authUserId)
  response.json({ success: true, data: profiles })
}