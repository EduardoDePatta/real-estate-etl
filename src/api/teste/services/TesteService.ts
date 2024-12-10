import { ApiResponse, BaseService } from '../../../BaseService/BaseService'
import { HTTP } from '../../../helpers'
import { Property, WebCrawler } from '../../../WebCrawler/WebCrawler'

interface Bla {
  column1: number
  column2: string
}

class TesteService extends BaseService<Bla, void, void, Property[]> {
  public async exec(req: HTTP.Req<Bla, void, void>): Promise<ApiResponse<Property[]>> {
    try {
      const crawler = new WebCrawler('https://www.zapimoveis.com.br/aluguel/?itl_id=1000064&itl_name=zap_-_link-header_alugar_to_zap_resultado-pesquisa')

      const html = await crawler.fetchProperties()
      console.log('🚀 ~ TesteService ~ exec ~ html:', html)

      return {
        status: 200,
        message: '',
        data: html
      }
    } catch (error) {
      throw error
    }
  }
}

export { TesteService }
