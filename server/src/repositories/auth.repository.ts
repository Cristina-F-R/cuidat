import type { PoolClient } from 'pg'
import { pool } from '../db/pool.js'
import type { UpgradeInput } from '../schemas/auth.schemas.js'

export interface AuthUser {
  id: string
  email: string
  password_hash: string
}

export async function findAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const result = await pool.query<AuthUser>(
    'SELECT id, email, password_hash FROM users WHERE email = $1 AND is_anonymous = FALSE AND password_hash IS NOT NULL',
    [email],
  )
  return result.rows[0] ?? null
}

async function insertGuestState(client: PoolClient, userId: string, payload: UpgradeInput['guestState']): Promise<void> {
  const profileIds = new Map<string, string>()
  const itemIds = new Map<string, string>()
  for (const profile of payload.profiles) {
    const result = await client.query<{ id: string }>(
      `INSERT INTO calendar_profiles (user_id, name, profile_type, avatar_icon)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, profile.name, profile.type, profile.avatarIcon],
    )
    profileIds.set(profile.id, result.rows[0].id)
  }

  for (const definition of payload.itemDefinitions) {
    const sourceCalendarId = definition.calendarId ?? payload.activeProfileId
    const calendarId = sourceCalendarId ? profileIds.get(sourceCalendarId) : undefined
    if (!calendarId) throw new Error('Guest definition references an unknown profile.')
    const result = await client.query<{ id: string }>(
      `INSERT INTO health_item_definitions (calendar_id, name, emoji, category, is_active)
       SELECT p.id, $3, $4, $5, $6
       FROM calendar_profiles p
       WHERE p.id = $2 AND p.user_id = $1
       RETURNING id`,
      [userId, calendarId, definition.name, definition.emoji, definition.category, definition.isActive],
    )
    if (!result.rowCount) throw new Error('Guest definition profile ownership check failed.')
    itemIds.set(definition.id, result.rows[0].id)
  }

  for (const event of payload.events) {
    const calendarId = profileIds.get(event.calendarId)
    const itemId = itemIds.get(event.itemDefinitionId)
    if (!calendarId || !itemId) throw new Error('Guest event references an unknown record.')
    const result = await client.query(
      `INSERT INTO health_event_logs (calendar_id, item_definition_id, logged_at, intensity, notes)
       SELECT p.id, i.id, $4::timestamptz, $5, $6
       FROM calendar_profiles p
       JOIN health_item_definitions i ON i.calendar_id = p.id
       WHERE p.id = $2 AND p.user_id = $1 AND i.id = $3
       RETURNING id`,
      [userId, calendarId, itemId, event.loggedAt, event.intensity, event.notes],
    )
    if (!result.rowCount) throw new Error('Guest event ownership check failed.')
  }
}

export async function createAccountWithGuestData(email: string, passwordHash: string, payload: UpgradeInput['guestState']): Promise<string> {
  const client = await pool.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const created = await client.query<{ id: string }>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, passwordHash],
    )
    const userId = created.rows[0].id
    await insertGuestState(client, userId, payload)
    await client.query('COMMIT')
    transactionStarted = false
    return userId
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}