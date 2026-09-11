import dotenv from 'dotenv'
import { resolve } from 'node:path'
import { z } from 'zod'

dotenv.config({
  path: [resolve(process.cwd(), 'server/.env'), resolve(process.cwd(), '.env')],
})

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  GEMINI_API_KEY: z
    .string()
    .min(1)
    .refine((value) => !value.startsWith('replace_with_'), {
      message: 'Set GEMINI_API_KEY in the backend environment.',
    }),
})

const parsedEnv = envSchema.parse(process.env)

export const env = {
  port: parsedEnv.PORT,
  databaseUrl: parsedEnv.DATABASE_URL,
  jwtSecret: parsedEnv.JWT_SECRET,
  geminiApiKey: parsedEnv.GEMINI_API_KEY,
}