import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { createAccountWithGuestData, findAuthUserByEmail } from '../repositories/auth.repository.js'
import type { LoginInput, UpgradeInput } from '../schemas/auth.schemas.js'

export class AuthError extends Error {
  constructor(readonly code: 'INVALID_CREDENTIALS' | 'EMAIL_EXISTS') {
    super(code)
  }
}

function issueToken(userId: string): string {
  return jwt.sign({}, env.jwtSecret, { subject: userId, expiresIn: '7d' })
}

export async function login(input: LoginInput): Promise<{ token: string; email: string }> {
  const user = await findAuthUserByEmail(input.email)
  const passwordMatches = user ? await bcrypt.compare(input.password, user.password_hash) : false
  if (!user || !passwordMatches) throw new AuthError('INVALID_CREDENTIALS')
  return { token: issueToken(user.id), email: user.email }
}

export async function upgradeAccount(input: UpgradeInput): Promise<{ token: string; email: string }> {
  const passwordHash = await bcrypt.hash(input.password, 10)
  try {
    const userId = await createAccountWithGuestData(input.email, passwordHash, input.guestState)
    return { token: issueToken(userId), email: input.email }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      throw new AuthError('EMAIL_EXISTS')
    }
    throw error
  }
}