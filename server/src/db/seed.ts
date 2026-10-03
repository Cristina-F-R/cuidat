import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pool } from './pool.js'

async function seed(): Promise<void> {
  try {
    await pool.query(await readFile(resolve(process.cwd(), 'src/db/seeds.sql'), 'utf8'))
    process.stdout.write('Evaluator seed applied.\n')
  } finally {
    await pool.end()
  }
}

seed().catch((error: unknown) => {
  process.stderr.write(`Seed failed: ${error instanceof Error ? error.message : 'unknown error'}\n`)
  process.exitCode = 1
})