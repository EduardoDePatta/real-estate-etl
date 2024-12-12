import { ApiResponse, BaseService } from '../../../BaseService/BaseService'
import constants from '../../../constants'
import { client } from '../../../elasticSearch/elasticSearch'
import { HttpException } from '../../../exceptions'
import { HTTP, validateMissingParam } from '../../../helpers'
import { Property, WebCrawler } from '../../../WebCrawler/WebCrawler'
import { Portal } from '../../shared/interfaces/Portal'
import { getPortalsAndFiltersQuery, setPortalStatusErrorQuery, setPortalStatusFinishedQuery, setPortalStatusRunningQuery } from '../../shared/sql'

export namespace GetZapImoveisService {
  export interface Query {
    size: string
  }
}

interface GetZapImoveisResponse {
  quantidade: number
  imoveis: Property[]
}
class GetZapImoveisService extends BaseService<void, void, GetZapImoveisService.Query, GetZapImoveisResponse> {
  private size: string = '20'

  public async exec(req: HTTP.Req<void, void, GetZapImoveisService.Query>): Promise<ApiResponse<GetZapImoveisResponse>> {
    validateMissingParam(req.query, ['size'])
    const { size } = req.query
    this.size = size
    {
      const statusTx = await this.database.startManualTransaction()
      await statusTx.none(setPortalStatusRunningQuery, [constants.PORTAL_ID.ZAP])
      await statusTx.commit()
    }
    const transaction = await this.database.startManualTransaction()
    try {
      const portals = await transaction.manyOrNone<Portal>(getPortalsAndFiltersQuery, [constants.PORTAL_ID.ZAP])

      if (!portals.length) {
        throw new HttpException(400, 'Não existe nenhum portal cadastrado.')
      }

      const crawlerPromises = portals.map(async (portal) => {
        const queryString = this.createQueryString(portal.filtros)
        const fullUrl = `${portal.url}?${queryString}`

        return WebCrawler.createCrawlers(fullUrl).then((crawler) => crawler.fetchProperties({ 'X-Domain': constants.PORTAL_DOMAIN.ZAP }))
      })

      await transaction.none(setPortalStatusRunningQuery, [constants.PORTAL_ID.ZAP])

      const crawlerResultsArray = await Promise.all(crawlerPromises)

      const combinedResults = crawlerResultsArray.flat()

      const seen = new Set<string>()
      const uniqueResults: Property[] = []

      for (const property of combinedResults) {
        if (!seen.has(property.id)) {
          seen.add(property.id)
          uniqueResults.push(property)
        }
      }
      const uniqueCount = uniqueResults.length

      await transaction.commit()

      {
        const statusTx = await this.database.startManualTransaction()
        await statusTx.none(setPortalStatusFinishedQuery, [constants.PORTAL_ID.ZAP])
        await statusTx.commit()
      }

      if (!uniqueResults.length) {
        throw new HttpException(400, 'Não existem dados para serem salvos.')
      }

      const body = uniqueResults.flatMap((doc) => [{ index: { _index: constants.ELASTIC.INDEX, _id: doc.id } }, doc])

      const bulkResponse = await client.bulk({ operations: body })
      await client.indices.refresh({ index: constants.ELASTIC.INDEX })

      if (bulkResponse.errors) {
        const detailedError = bulkResponse.items.filter((item) => item.index && item.index.error).map((item) => ({ id: item.index?._id, error: item.index?.error }))
        throw new HttpException(400, `Ocorreram erros durante a indexação no Elasticsearch: ${JSON.stringify(detailedError)}`)
      }

      return {
        status: 200,
        message: 'Crawler do ZapImoveis executado com sucesso.',
        data: {
          quantidade: uniqueCount,
          imoveis: uniqueResults
        }
      }
    } catch (error) {
      await transaction.rollback()
      {
        const statusTx = await this.database.startManualTransaction()
        await statusTx.none(setPortalStatusErrorQuery, [constants.PORTAL_ID.ZAP])
        await statusTx.commit()
      }
      throw error
    }
  }

  private createQueryString(params: Record<string, string>): string {
    if (Number(this.size) > 80) this.size = '80'
    return new URLSearchParams({ ...params, size: this.size, listingType: 'USED' }).toString()
  }
}

export { GetZapImoveisService }
