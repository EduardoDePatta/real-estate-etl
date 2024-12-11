import { Router } from 'express'
import { zapimoveisRouter } from './zapimoveis/router/zapimoveisRouter'

const routeV1 = Router()

routeV1.use('/zapimoveis', zapimoveisRouter)

export { routeV1 }
