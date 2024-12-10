import { ApiResponse, BaseService } from '../../../BaseService/BaseService'
import { HTTP } from '../../../helpers'

interface Bla {
  column1: number
  column2: string
}

interface TesteData {
  id: number
  name: string
}

class TesteService extends BaseService<Bla, void, void, TesteData> {
  public async exec(req: HTTP.Req<Bla, void, void>): Promise<ApiResponse<TesteData>> {
    const transaction = await this.database.startManualTransaction()
    try {
      const { column1, column2 } = req.body

      const insertedData = await transaction.one<TesteData>(
        `INSERT INTO real_estate.example_table (column1, column2) 
         VALUES ($1, $2) 
         RETURNING id, column1 AS name`,
        [column1, column2]
      )

      await transaction.one('SELECT errooooo FROM real_estate.example_table WHERE id = $1', [insertedData.id])

      const fetchedData = await transaction.oneOrNone<TesteData>(`SELECT id, column1 AS name FROM real_estate.example_table WHERE id = $1`, [insertedData.id])

      await transaction.commit()

      return {
        status: 200,
        message: '',
        data: fetchedData!
      }
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}

export { TesteService }
