import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import environments from './environments'
import { HttpException } from './exceptions'
import helmet from 'helmet'
import errorMiddleware from './middlewares/errorMiddleware'
import { routeV1 } from './api'

const app = express()

app.use(cors())
app.use(helmet())

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb ' }))

if (environments.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

app.use('/api/v1', routeV1)

app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new HttpException(500, `Can't find ${req.originalUrl} on this server!`))
})

app.use(errorMiddleware)

export default app
