import { Client } from '@elastic/elasticsearch'
import constants from '../constants'
import environments from '../environments'

const client = new Client({
  node: environments.ELASTIC_URL
})

async function setupIndex() {
  const indexName = constants.ELASTIC.INDEX

  try {
    const exists = await client.indices.exists({ index: indexName })

    if (!exists) {
      await client.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              titulo: { type: 'text' },
              descricao: { type: 'text' },
              portal: { type: 'keyword' },
              url: { type: 'text' },
              tipoNegocio: { type: 'keyword' },
              endereco: { type: 'text' },
              preco: { type: 'double' },
              quartos: { type: 'integer' },
              banheiros: { type: 'integer' },
              vagas_garagem: { type: 'integer' },
              area_util: { type: 'float' },
              capturado_em: { type: 'date' },
              atualizado_em: { type: 'date' }
            }
          }
        }
      })
      console.log(`Índice '${indexName}' criado com sucesso.`)
    } else {
      console.log(`Índice '${indexName}' já existe.`)
    }
  } catch (error) {
    console.error('Erro ao configurar o índice:', error)
  }
}

setupIndex()

export { client }
