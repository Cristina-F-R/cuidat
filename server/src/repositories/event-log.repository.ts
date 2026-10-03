import { pool } from '../db/pool.js'

export interface EventLogRow {
  id: string
  calendar_id: string
  item_definition_id: string
  logged_at: Date
  intensity: number
  notes: string
}

export async function listLogsForUser(userId: string, calendarId: string, from: string, to: string): Promise<EventLogRow[]> {
  const result = await pool.query<EventLogRow>(
    `SELECT l.id, l.calendar_id, l.item_definition_id, l.logged_at, l.intensity, l.notes
     FROM health_event_logs l
     JOIN calendar_profiles p ON p.id = l.calendar_id
     WHERE p.user_id = $1 AND l.calendar_id = $2 AND l.logged_at >= $3 AND l.logged_at < $4
     ORDER BY l.logged_at, l.id`,
    [userId, calendarId, from, to],
  )
  return result.rows
}

export async function deleteLogForUser(userId: string, logId: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM health_event_logs l
     USING calendar_profiles p
     WHERE l.calendar_id = p.id AND p.user_id = $1 AND l.id = $2`,
    [userId, logId],
  )
  return result.rowCount === 1
}