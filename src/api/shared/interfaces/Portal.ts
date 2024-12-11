export type FiltersPortal = 'venda' | 'aluguel'

export interface Portal {
  portal_id: number
  nome: string
  url: string
  filtros: {
    tipoNegocio: FiltersPortal
  }
}
