import { writeFileSync } from 'fs'
import puppeteer, { Page } from 'puppeteer'

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

class WebCrawler {
  private baseUrl: string
  private tipoNegocio: string

  constructor(baseUrl: string, tipoNegocio?: string) {
    this.baseUrl = baseUrl
    this.tipoNegocio = tipoNegocio || this.inferirTipoNegocio(baseUrl)
  }

  static async createCrawlers(url: string, count: number): Promise<WebCrawler[]> {
    return Array.from({ length: count }, () => new WebCrawler(url))
  }

  private inferirTipoNegocio(url: string): string {
    if (url.includes('/aluguel')) return 'Aluguel'
    if (url.includes('/venda')) return 'Venda'
    return 'Indefinido'
  }

  private async autoScroll(page: Page, maxHeight = 25000): Promise<void> {
    await page.evaluate(async (maxHeight: number) => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0
        let previousHeight = 0
        const distance = 1000
        const interval = setInterval(() => {
          window.scrollBy(0, distance)
          totalHeight += distance
          const currentHeight = document.body.scrollHeight

          if (totalHeight >= currentHeight || totalHeight >= maxHeight) {
            clearInterval(interval)
            resolve()
          }

          previousHeight = currentHeight
        }, 300)
      })
    }, maxHeight)
  }

  private async fetchPropertiesFromPage(page: Page): Promise<Property[]> {
    return page.evaluate((tipoNegocio: string) => {
      const items = document.querySelectorAll('[data-testid="card"]')
      const data: Property[] = []

      items.forEach((item) => {
        const titulo = item.querySelector('[data-cy="rp-cardProperty-location-txt"]')?.textContent?.trim() || 'N/A'
        const descricao = item.querySelector('[data-cy="rp-cardProperty-description-txt"]')?.textContent?.trim() || ''
        const endereco = item.querySelector('[data-cy="rp-cardProperty-street-txt"]')?.textContent?.trim() || 'N/A'

        const precoElement = item.querySelector('[data-cy="rp-cardProperty-price-txt"] > p')
        const precoRaw = precoElement?.textContent?.trim() || '0'
        const preco = parseFloat(precoRaw.replace(/[^0-9]/g, '')) || 0

        const quartosRaw = item.querySelector('[data-cy="rp-cardProperty-bedroomQuantity-txt"]')?.textContent || '0'
        const quartos = parseInt(quartosRaw.replace(/[^\d]/g, '')) || 0

        const banheirosRaw = item.querySelector('[data-cy="rp-cardProperty-bathroomQuantity-txt"]')?.textContent || '0'
        const banheiros = parseInt(banheirosRaw.replace(/[^\d]/g, '')) || 0

        const vagasRaw = item.querySelector('[data-cy="rp-cardProperty-parkingSpacesQuantity-txt"]')?.textContent || '0'
        const vagas_garagem = parseInt(vagasRaw.replace(/[^\d]/g, '')) || 0

        const areaRaw = item.querySelector('[data-cy="rp-cardProperty-propertyArea-txt"]')?.textContent || '0'
        const area_util = parseFloat(areaRaw.replace(/[^\d]/g, '')) || 0

        const urlElement = item.closest('a[itemprop="url"]') as HTMLAnchorElement | null
        const url = urlElement?.href || 'no'
        const id = urlElement?.getAttribute('data-id') || 'N/A'

        data.push({
          id,
          titulo,
          descricao,
          portal: 'Zap Imóveis',
          url,
          tipoNegocio,
          endereco,
          preco,
          quartos,
          banheiros,
          vagas_garagem,
          area_util,
          capturado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        })
      })

      return data
    }, this.tipoNegocio)
  }

  public async fetchProperties(): Promise<Property[]> {
    const browser = await puppeteer.launch({
      headless: true
    })

    const page = await browser.newPage()

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36')

      await page.setRequestInterception(true)
      page.on('request', (req) => {
        const blockedResources = ['image', 'stylesheet', 'font']
        if (blockedResources.includes(req.resourceType())) {
          req.abort()
        } else {
          req.continue()
        }
      })

      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' })

      await this.autoScroll(page)

      const properties = await this.fetchPropertiesFromPage(page)

      await browser.close()
      return properties
    } catch (error) {
      await browser.close()
      throw error
    }
  }
}

export { WebCrawler }
