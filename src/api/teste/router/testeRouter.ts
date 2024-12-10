import { Router } from 'express'
import { ServiceFactory } from '../../../BaseService/ServiceFactory'
import { TesteService } from '../services/TesteService'

const testeRouter = Router()

testeRouter.get('/', ServiceFactory.getHandler(TesteService))

export { testeRouter }
