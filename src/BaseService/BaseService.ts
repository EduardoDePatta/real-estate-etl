import { IDatabase } from '../Database/Database'
import { HTTP } from '../helpers'
import { NextFunction, Response } from 'express'

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

export interface IBaseService<B = any, P = any, Q = any, T = any> {
  exec(req: HTTP.Req<B, P, Q>, res: Response, next: NextFunction): Promise<ApiResponse<T>>
}

abstract class BaseService<B = any, P = any, Q = any, T = any> implements IBaseService<B, P, Q, T> {
  protected database: IDatabase

  constructor(database: IDatabase) {
    this.database = database
  }

  public abstract exec(req: HTTP.Req<B, P, Q>, res: Response, next: NextFunction): Promise<ApiResponse<T>>
}

export { BaseService }
