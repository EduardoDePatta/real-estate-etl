import { Router } from 'express'
import { testeRouter } from './teste/router'

const routeV1 = Router()

routeV1.use('/teste', testeRouter)

export { routeV1 }
