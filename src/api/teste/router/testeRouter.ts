import { Router } from 'express'
import { ServiceFactory } from '../../../BaseService/ServiceFactory'
import { ExampleService } from '../services/TesteService'

const testeRouter = Router()

testeRouter.post('/', ServiceFactory.getHandler(ExampleService))

export { testeRouter }
