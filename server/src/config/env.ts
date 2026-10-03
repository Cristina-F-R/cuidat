import dotenv from 'dotenv'
import { resolve } from 'node:path'
import { z } from 'zod'

dotenv.config({
  path: [resolve(process.cwd(), 'server/.env'), resolve(process.cwd(), '.env')],
})

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().url().refine((value) => value.startsWith('postgres://') || value.startsWith('postgresql://'), {
    message: 'DATABASE_URL must use PostgreSQL.',
  }).transform((value) => {
    const databaseUrl = new URL(value)
    databaseUrl.searchParams.delete('sslmode')
    databaseUrl.searchParams.append('sslmode', 'require')
    return databaseUrl.toString()
  }),
  JWT_SECRET: z.string().min(32),
  GEMINI_API_KEY: z.string().optional(),
})

const parsedEnv = envSchema.parse(process.env)

export const env = {
  port: parsedEnv.PORT,
  clientOrigin: parsedEnv.CLIENT_ORIGIN,
  databaseUrl: parsedEnv.DATABASE_URL,
  jwtSecret: parsedEnv.JWT_SECRET,
  geminiApiKey: parsedEnv.GEMINI_API_KEY ?? '',
}