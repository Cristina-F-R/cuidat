import { NotFoundError } from '../errors/AppError.js'
import { deleteAccountForUser } from '../repositories/account.repository.js'

export async function deleteAccount(userId: string): Promise<void> {
  const wasDeleted = await deleteAccountForUser(userId)
  if (!wasDeleted) throw new NotFoundError('ACCOUNT_NOT_FOUND', 'La cuenta ya no existe.')
}