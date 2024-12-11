import dotenv from 'dotenv'
dotenv.config()

export default {
  NODE_ENV: process.env.NODE_ENV || 'dev',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_DATABASE: process.env.DB_DATABASE || 'real_estate',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_PORT: Number(process.env.DB_PORT) ?? 5433,
  PORT: Number(process.env.PORT) ?? 5000,
  ELASTIC_URL: process.env.ELASTIC_URL || 'http://localhost:9200'
}
