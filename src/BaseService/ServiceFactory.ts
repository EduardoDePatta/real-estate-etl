import { RequestHandler } from 'express'
import { Database, IDatabase } from '../Database/Database'
import { IBaseService } from './BaseService'
import { logger } from '../logger'

class ServiceFactory {
  private static database = Database.getInstance()

  public static getHandler<T extends IBaseService>(Service: new (database: IDatabase) => T): RequestHandler {
    return async (req, res, next) => {
      try {
        const serviceInstance = new Service(this.database)
        const result = await serviceInstance.exec(req, res, next)

        if (result) {
          res.status(result.status).json({
            message: result.message,
            data: result.data
          })
        }
      } catch (error) {
        logger.error(error)
        next(error)
      }
    }
  }
}

export { ServiceFactory }
