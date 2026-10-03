import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pool } from './pool.js'

async function migrate(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('CREATE TABLE IF NOT EXISTS applied_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())')
    const directory = resolve(process.cwd(), 'src/db/migrations')
    const files = (await readdir(directory)).filter((file) => /^\d{3}_.+\.sql$/.test(file)).sort()
    for (const file of files) {
      const exists = await client.query('SELECT 1 FROM applied_migrations WHERE name = $1', [file])
      if (exists.rowCount) continue
      const sql = await readFile(resolve(directory, file), 'utf8')
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO applied_migrations (name) VALUES ($1)', [file])
        await client.query('COMMIT')
        process.stdout.write(`Applied ${file}\n`)
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      }
    }
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((error: unknown) => {
  process.stderr.write(`Migration failed: ${error instanceof Error ? error.message : 'unknown error'}\n`)
  process.exitCode = 1
})