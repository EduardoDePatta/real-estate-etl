# Real Estate ETL

Este projeto realiza a extração de dados de imóveis (via Web Crawler), armazena parâmetros de captura em um banco PostgreSQL, indexa os dados coletados em um índice Elasticsearch e disponibiliza um endpoint para executar todo o processo.

## Requisitos
- **Node.js** versão **20.17.0**
- **npm** ou outro gerenciador de pacotes
- **Docker** e **Docker Compose**

## Passos para Configuração

1. **Clonar o repositório**
2. **Instalar dependências**
3. **Configurar variáveis de ambiente** baseada em .env-example
4. **Subir serviços Docker**
5. **Verificar o Elasticsearch**
6. **Iniciar o servidor**
7. **Executar a captura ETL**
8. **Verificar os dados no Elasticsearch**

## Observações

* Caso tenha outro serviço rodando na porta 5432, use a porta 5433 conforme o docker-compose.yml (ou outra de preferência, mas atualize os arquivos necessários)
* Caso o índice imoveis já exista, ao iniciar a aplicação será mostrado **Indice 'imoveis' já existe.**
* Para inicializar os containers, execute o comando abaixo

  ```bash
  docker-compose up -d
  ```

* Caso não deseje utilizar algum serviço como Postman ou Insomnia, execute o comando abaixo

  ```bash
  curl -X GET 'http://localhost:5000/api/v1/zapimoveis'
  ````

* Para verificar os dados no Elasticsearch, execute o comando abaixo

  ```bash
  curl -X GET 'http://localhost:9200/imoveis/_search?pretty'
  ```
  


