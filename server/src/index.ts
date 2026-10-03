import { app } from './app.js'
import { env } from './config/env.js'

app.listen(env.port, () => {
  process.stdout.write(`CuidaT API listening on port ${env.port}\n`)
})