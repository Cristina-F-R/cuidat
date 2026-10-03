import { pool } from '../db/pool.js'

export async function deleteAccountForUser(userId: string): Promise<boolean> {
  const client = await pool.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const deleted = await client.query<{ id: string }>(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId],
    )
    if (!deleted.rowCount) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return false
    }
    await client.query('COMMIT')
    transactionStarted = false
    return true
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}