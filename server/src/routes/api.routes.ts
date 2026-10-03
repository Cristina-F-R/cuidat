import { Router } from 'express'
import { loginController, upgradeController } from '../controllers/auth.controller.js'
import { profilesController } from '../controllers/profile.controller.js'
import { deleteAccountController } from '../controllers/account.controller.js'
import { authenticate } from '../middlewares/authenticate.js'
import { validateBody } from '../middlewares/validate-body.js'
import { loginSchema, upgradeSchema } from '../schemas/auth.schemas.js'

export const apiRouter = Router()

apiRouter.post('/auth/login', validateBody(loginSchema), loginController)
apiRouter.post('/auth/upgrade', validateBody(upgradeSchema), upgradeController)
apiRouter.delete('/auth/account', authenticate, deleteAccountController)
apiRouter.get('/profiles', authenticate, profilesController)