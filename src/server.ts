import environments from './environments'
import app from '.'
import { Database } from './Database/Database'

process.on('uncaughtException', (error: Error) => {
  console.log(`Error: ${error}\nShutting down...`)
  process.exit(1)
})

const database = Database.getInstance()

const startServer = async () => {
  try {
    await database.testConnection()

    app.listen(environments.PORT, () => {
      console.log(`Server is running on port ${environments.PORT}`)
    })
  } catch (error) {
    console.error('Error connecting to the database:', error)
    console.log(`\nShutting down...`)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  await database.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...')
  await database.close()
  process.exit(0)
})

startServer()

export { startServer }
