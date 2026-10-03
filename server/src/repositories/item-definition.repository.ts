import { pool } from '../db/pool.js'

export interface ItemDefinitionRow {
  id: string
  calendar_id: string
  name: string
  emoji: string
  category: string
  is_active: boolean
}

export async function listDefinitionsForUser(userId: string, calendarId: string): Promise<ItemDefinitionRow[]> {
  const result = await pool.query<ItemDefinitionRow>(
    `SELECT i.id, i.calendar_id, i.name, i.emoji, i.category, i.is_active
     FROM health_item_definitions i
     JOIN calendar_profiles p ON p.id = i.calendar_id
     WHERE p.user_id = $1 AND i.calendar_id = $2
     ORDER BY i.created_at, i.id`,
    [userId, calendarId],
  )
  return result.rows
}

export async function deleteDefinitionForUser(userId: string, definitionId: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM health_item_definitions i
     USING calendar_profiles p
     WHERE i.calendar_id = p.id AND p.user_id = $1 AND i.id = $2`,
    [userId, definitionId],
  )
  return result.rowCount === 1
}