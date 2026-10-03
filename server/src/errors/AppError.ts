export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super(401, 'AUTH_REQUIRED', 'Se requiere una sesión válida.')
  }
}

export class NotFoundError extends AppError {
  constructor(code: string, message: string) {
    super(404, code, message)
  }
}