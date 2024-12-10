import { NextFunction, Request, Response } from 'express'
import { Usuario } from './api/auth'
import { ApiResponse } from './BaseService/responseFormatter'

declare global {
  namespace Express {
    interface Request {}
  }
}
