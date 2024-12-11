import { ApiResponse, BaseService } from '../../../BaseService/BaseService'
import constants from '../../../constants'
import { client } from '../../../elasticSearch/elasticSearch'
import { HttpException } from '../../../exceptions'
import { Property, WebCrawler } from '../../../WebCrawler/WebCrawler'
import { Portal } from '../../shared/interfaces/Portal'
import { getPortalsAndFiltersQuery, setPortalStatusErrorQuery, setPortalStatusFinishedQuery, setPortalStatusRunningQuery } from '../../shared/sql'

interface GetZapImoveisResponse {
  quantidade: number
  imoveis: Property[]
}
class GetZapImoveisService extends BaseService<void, void, void, GetZapImoveisResponse> {
  public async exec(): Promise<ApiResponse<GetZapImoveisResponse>> {
    {
      const statusTx = await this.database.startManualTransaction()
      await statusTx.none(setPortalStatusRunningQuery, [constants.PORTAL_ID.ZAP])
      await statusTx.commit()
    }
    const transaction = await this.database.startManualTransaction()
    try {
      const numberOfPromises = 5
      const portals = await transaction.manyOrNone<Portal>(getPortalsAndFiltersQuery, [constants.PORTAL_ID.ZAP])

      if (!portals.length) {
        throw new HttpException(400, 'Não existe nenhum portal cadastrado.')
      }

      const crawlerPromises = portals.map((portal) =>
        WebCrawler.createCrawlers(`${portal.url}/${portal.filtros.tipoNegocio}`, numberOfPromises).then((crawlers) => Promise.all(crawlers.map((crawler) => crawler.fetchProperties())))
      )

      await transaction.none(setPortalStatusRunningQuery, [constants.PORTAL_ID.ZAP])

      const crawlerResultsArray = await Promise.all(crawlerPromises)

      const combinedResults = crawlerResultsArray.flat().flat()

      const seen = new Set<string>()
      const uniqueResults: Property[] = []
      const removedItems: Property[] = []

      for (const property of combinedResults) {
        if (seen.has(property.id)) {
          removedItems.push(property)
        } else {
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
        throw new HttpException(400, `Ocorreram erros durante a indexação no Elasticsearch: ${bulkResponse}`)
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
}

export { GetZapImoveisService }
