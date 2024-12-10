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

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async autoScroll(page: Page, maxHeight = 50000): Promise<void> {
    await page.evaluate(async (maxHeight) => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0
        const distance = 500
        const timer = setInterval(() => {
          window.scrollBy(0, distance)
          totalHeight += distance

          if (totalHeight >= document.body.scrollHeight || totalHeight >= maxHeight) {
            clearInterval(timer)
            resolve()
          }
        }, 300)
      })
    }, maxHeight)
  }

  public async fetchProperties(): Promise<Property[]> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36')

      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' })

      await this.autoScroll(page, 50000)

      const properties = await page.evaluate(() => {
        const items = document.querySelectorAll('[data-testid="card"]')
        const data: Property[] = []

        items.forEach((item) => {
          const titulo = item.querySelector('[data-cy="rp-cardProperty-location-txt"]')?.textContent?.trim() || 'N/A'
          const descricao = item.querySelector('[data-cy="rp-cardProperty-description-txt"]')?.textContent?.trim() || ''
          const tipoNegocio = 'Aluguel'
          const endereco = item.querySelector('[data-cy="rp-cardProperty-street-txt"]')?.textContent?.trim() || 'N/A'

          const precoRaw = item.querySelector('[data-cy="rp-cardProperty-price-txt"]')?.textContent || '0'
          const precoMatch = precoRaw.match(/R\$\s?([\d.,]+)/)
          const preco = precoMatch ? parseFloat(precoMatch[1].replace(/\./g, '').replace(',', '.')) : 0

          const quartosRaw = item.querySelector('[data-cy="rp-cardProperty-bedroomQuantity-txt"]')?.textContent || '0'
          const quartos = parseInt(quartosRaw.replace(/[^\d]/g, '')) || 0

          const banheirosRaw = item.querySelector('[data-cy="rp-cardProperty-bathroomQuantity-txt"]')?.textContent || '0'
          const banheiros = parseInt(banheirosRaw.replace(/[^\d]/g, '')) || 0

          const vagasRaw = item.querySelector('[data-cy="rp-cardProperty-parkingSpacesQuantity-txt"]')?.textContent || '0'
          const vagas_garagem = parseInt(vagasRaw.replace(/[^\d]/g, '')) || 0

          const areaRaw = item.querySelector('[data-cy="rp-cardProperty-propertyArea-txt"]')?.textContent || '0'
          const area_util = parseFloat(areaRaw.replace(/[^\d]/g, '')) || 0

          const url = item.querySelector('a')?.getAttribute('href') || ''
          const fullUrl = url.startsWith('http') ? url : `https://www.zapimoveis.com.br${url}`

          data.push({
            id: crypto.randomUUID(),
            titulo,
            descricao,
            portal: 'Zap Imóveis',
            url: fullUrl,
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
      })

      return properties
    } catch (error) {
      console.error('Erro ao buscar propriedades:', error)
      throw error
    } finally {
      await browser.close()
    }
  }
}

export { WebCrawler }
