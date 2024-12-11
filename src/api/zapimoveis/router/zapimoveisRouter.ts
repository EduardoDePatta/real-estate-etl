import { Router } from 'express'
import { ServiceFactory } from '../../../BaseService/ServiceFactory'
import { GetZapImoveisService } from '../services/GetZapImoveisService'

const zapimoveisRouter = Router()

zapimoveisRouter.get('/', ServiceFactory.getHandler(GetZapImoveisService))

export { zapimoveisRouter }
