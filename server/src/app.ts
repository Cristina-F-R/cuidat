import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import { AppError } from './errors/AppError.js'
import { apiRouter } from './routes/api.routes.js'

export const app = express()

const allowedOrigins = new Set(env.clientOrigin.split(',').map((origin) => origin.trim()).filter(Boolean))
const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    const isLocalDevelopmentOrigin = origin !== undefined
      && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    callback(null, !origin || allowedOrigins.has(origin) || isLocalDevelopmentOrigin)
  },
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
app.use(helmet())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
  response.json({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() },
  })
})

app.use('/api', apiRouter)
app.use((_request, response) => {
  response.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'La ruta solicitada no existe.' } })
})

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  console.error(error)
  if (response.headersSent) return

  const status = error instanceof AppError ? error.statusCode : error instanceof SyntaxError ? 400 : 500
  const code = error instanceof AppError ? error.code : status === 400 ? 'INVALID_JSON' : 'INTERNAL_ERROR'
  const message = error instanceof AppError
    ? error.message
    : status === 400 ? 'El JSON enviado no es válido.' : 'Se produjo un error interno.'
  response.status(status).json({ success: false, error: { code, message } })
}

app.use(errorHandler)