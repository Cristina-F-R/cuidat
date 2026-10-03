import type { RequestHandler } from 'express'
import { UnauthorizedError } from '../errors/AppError.js'
import { deleteAccount } from '../services/account.service.js'

export const deleteAccountController: RequestHandler = async (request, response) => {
  if (!request.authUserId) throw new UnauthorizedError()
  await deleteAccount(request.authUserId)
  response.status(200).json({
    success: true,
    message: 'Cuenta y datos asociados eliminados permanentemente.',
  })
}