import winston from 'winston'
import 'winston-daily-rotate-file'

const packageJson = require('./../package.json')

const winstonFormat = winston.format.printf(({ message, label, timestamp }) => {
  return `${timestamp} [${label}] ${message}`
})

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({
      all: true,
      colors: { info: 'blue' }
    }),
    winston.format.timestamp(),
    winston.format.label({ label: `real-estate-etl-v${packageJson.version}` }),
    winston.format.splat(),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    winstonFormat
  )
})

const fileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/real-estate-etl-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '100mb',
  maxFiles: '30d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.label({ label: `real-estate-etl-v${packageJson.version}` }),
    winston.format.splat(),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    winstonFormat
  )
})

const logger = winston.createLogger({
  level: 'info',
  transports: [consoleTransport, fileTransport]
})

export { logger }
