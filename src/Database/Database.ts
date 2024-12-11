import pgPromise, { IDatabase as PgPromiseDatabase, IMain, ITask } from 'pg-promise'
import environments from '../environments'

export interface IManualTransaction {
  one: <T = any>(query: string, values?: any) => Promise<T>
  oneOrNone: <T = any>(query: string, values?: any) => Promise<T | null>
  manyOrNone: <T = any>(query: string, values?: any) => Promise<T[]>
  none: (query: string, values?: any) => Promise<null>
  any: <T = any>(query: string, values?: any) => Promise<T[]>
  commit: () => Promise<void>
  rollback: () => Promise<void>
}

export interface IDatabase {
  beginTransaction<T>(callback: (transaction: ITask<any>) => Promise<T>): Promise<T>
  startManualTransaction(): Promise<IManualTransaction>
  close(): void
  testConnection(): Promise<void>
}

class Database implements IDatabase {
  private static instance: IDatabase | null = null
  private readonly pgp: IMain
  private readonly db: PgPromiseDatabase<any>

  constructor() {
    this.pgp = pgPromise()
    this.db = this.pgp({
      host: environments.DB_HOST,
      port: Number(environments.DB_PORT),
      database: environments.DB_DATABASE,
      user: environments.DB_USER,
      password: environments.DB_PASSWORD,
      application_name: 'real-estate-etl'
    })
  }

  public static getInstance(): IDatabase {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  async testConnection(): Promise<void> {
    try {
      const { now } = await this.db.one('SELECT NOW()')
      console.log(`${now} - Database connected successfully to ${environments.DB_DATABASE}`)
    } catch (error) {
      console.error('Failed to connect to the database:', error)
      throw error
    }
  }

  public async beginTransaction<T>(callback: (transaction: ITask<any>) => Promise<T>): Promise<T> {
    return this.db.tx(callback)
  }

  public async startManualTransaction(): Promise<IManualTransaction> {
    const connection = await this.db.connect()
    await connection.none('BEGIN')

    return {
      one: (query, values) => connection.one(query, values),
      oneOrNone: (query, values) => connection.oneOrNone(query, values),
      none: (query, values) => connection.none(query, values),
      any: (query, values) => connection.any(query, values),
      manyOrNone: (query, values) => connection.manyOrNone(query, values),
      commit: async () => {
        await connection.none('COMMIT')
        connection.done()
      },
      rollback: async () => {
        await connection.none('ROLLBACK')
        connection.done()
      }
    }
  }

  public close(): void {
    this.pgp.end()
  }
}

export { Database }
