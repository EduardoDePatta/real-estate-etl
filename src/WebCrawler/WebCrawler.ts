import puppeteer, { Page } from 'puppeteer'
import { HttpException } from '../exceptions'

export interface Property {
  id: string
  titulo: string
  descricao: string
  portal: string
  url: string
  tipoNegocio: string
  endereco: string
  preco: number
  quartos: number
  banheiros: number
  vagas_garagem: number
  area_util: number
  capturado_em: string
  atualizado_em: string
}

export interface Listing {
  id?: string
  title?: string
  description?: string
  portal?: string
  pricingInfos?: Array<{
    price?: string | number
    businessType?: string
  }>
  address?: {
    street?: string
    streetNumber?: string
    neighborhood?: string
    city?: string
    stateAcronym?: string
  }
  bedrooms?: (number | string)[]
  bathrooms?: (number | string)[]
  parkingSpaces?: (number | string)[]
  usableAreas?: (number | string)[]
  updatedAt?: string
}

class WebCrawler {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  static async createCrawlers(url: string): Promise<WebCrawler> {
    return new WebCrawler(url)
  }

  private parsePropertyData(listing: Listing): Property {
    const address = listing.address || {}

    const formattedAddress = [
      address.street || 'N/A',
      address.streetNumber ? `, ${address.streetNumber}` : '',
      address.neighborhood ? `, ${address.neighborhood}` : '',
      address.city || 'N/A',
      address.stateAcronym || ''
    ]
      .filter(Boolean)
      .join(' ')

    return {
      id: listing.id || 'N/A',
      titulo: listing.title || 'N/A',
      descricao: listing.description || '',
      portal: listing.portal || 'N/A',
      url: `https://www.zapimoveis.com.br/imovel/${listing.id || ''}`,
      tipoNegocio: listing.pricingInfos?.[0]?.businessType || 'N/A',
      endereco: formattedAddress,
      preco: parseFloat(String(listing.pricingInfos?.[0]?.price ?? '0')),
      quartos: Number(listing.bedrooms?.[0] ?? 0),
      banheiros: Number(listing.bathrooms?.[0] ?? 0),
      vagas_garagem: Number(listing.parkingSpaces?.[0] ?? 0),
      area_util: parseFloat(String(listing.usableAreas?.[0] ?? '0')),
      capturado_em: new Date().toISOString(),
      atualizado_em: listing.updatedAt || new Date().toISOString()
    }
  }

  private async extractJSONFromPage(page: Page): Promise<any> {
    return page.evaluate(() => {
      const preTag = document.querySelector('pre')
      if (!preTag) {
        throw new HttpException(400, 'Elemento <pre> com JSON não encontrado;')
      }
      return JSON.parse(preTag.textContent || '{}')
    })
  }

  public async fetchProperties(header?: Record<string, string>): Promise<Property[]> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36')

      if (header) {
        await page.setExtraHTTPHeaders(header)
      }

      await page.setRequestInterception(true)
      page.on('request', (req) => {
        const blockedResources = ['image', 'stylesheet', 'font']
        if (blockedResources.includes(req.resourceType())) {
          req.abort()
        } else {
          req.continue()
        }
      })

      await page.goto(this.baseUrl, { waitUntil: 'domcontentloaded' })

      const jsonData = await this.extractJSONFromPage(page)

      const listings = jsonData?.search?.result?.listings || []
      const properties = listings.map((item: any) => this.parsePropertyData(item.listing))

      await browser.close()
      return properties
    } catch (error) {
      await browser.close()
      console.error('Erro ao capturar os dados:', error)
      throw error
    }
  }
}

export { WebCrawler }
