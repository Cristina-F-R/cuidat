import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'

export function validateBody(schema: ZodType): RequestHandler {
  return (request, response, next) => {
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) {
      response.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'El contenido enviado no es válido.' },
      })
      return
    }
    request.body = parsed.data
    next()
  }
}