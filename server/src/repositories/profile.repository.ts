import { pool } from '../db/pool.js'

export interface ProfileRow {
  id: string
  name: string
  profile_type: string
  avatar_icon: string
}

export async function listProfilesForUser(userId: string): Promise<ProfileRow[]> {
  const result = await pool.query<ProfileRow>(
    'SELECT id, name, profile_type, avatar_icon FROM calendar_profiles WHERE user_id = $1 ORDER BY created_at, id',
    [userId],
  )
  return result.rows
}