# Order Management System

Este projeto é um sistema de gerenciamento de pedidos para um e-commerce, desenvolvido com Nest.js. O sistema permite que os clientes criem, visualizem, atualizem e cancelem pedidos, além de comunicar eventos de criação e atualização via Kafka e indexar pedidos utilizando Elasticsearch.

## Funcionalidades

- **Gerenciamento de Pedidos**: Criação, visualização, atualização e cancelamento de pedidos.
- **Comunicação via Kafka**: Publicação de eventos ao criar ou atualizar pedidos.
- **Busca Avançada com Elasticsearch**: Indexação de pedidos e busca por identificador, status, intervalo de datas e itens contidos no pedido.
- **Documentação da API**: Documentação acessível via Swagger em `/api-docs`.
- **Logs Estruturados**: Implementação de logs para monitoramento de requisições e eventos.

## Tecnologias Utilizadas

- **Nest.js**: Framework para construção de aplicações Node.js.
- **PostgreSQL**: Banco de dados relacional para armazenamento de pedidos.
- **Kafka**: Sistema de mensageria para comunicação entre serviços.
- **Elasticsearch**: Motor de busca e análise para indexação de pedidos.
- **Docker**: Containerização da aplicação e serviços.

## Configuração do Ambiente

1. Clone o repositório:

   ```
   git clone <URL_DO_REPOSITORIO>
   cd order-management-system
   ```

2. Crie um arquivo `.env` baseado no `.env.example` e configure as variáveis de ambiente necessárias.

3. Inicie a aplicação com Docker:
   ```
   docker-compose up
   ```

## Estrutura do Projeto

```
order-management-system
├── src
│   ├── app.module.ts
│   ├── main.ts
│   ├── orders
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── orders.module.ts
│   │   ├── orders.entity.ts
│   │   ├── dto
│   │   │   ├── create-order.dto.ts
│   │   │   └── update-order.dto.ts
│   │   └── orders.repository.ts
│   ├── kafka
│   │   ├── kafka.module.ts
│   │   └── kafka.service.ts
│   ├── elasticsearch
│   │   ├── elasticsearch.module.ts
│   │   └── elasticsearch.service.ts
│   ├── common
│   │   ├── interceptors
│   │   │   └── logging.interceptor.ts
│   │   └── filters
│   │       └── http-exception.filter.ts
│   ├── config
│   │   └── configuration.ts
│   └── logger
│       └── logger.service.ts
├── test
│   ├── orders.controller.spec.ts
│   └── orders.service.spec.ts
├── docker
│   ├── kafka
│   └── elasticsearch
├── .env
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Testes

Os testes unitários estão implementados para os principais componentes da aplicação. Para executá-los, utilize o comando:

```
npm run test
```

## Limitações e Melhorias Futuras

- Implementar autenticação e autorização para acesso à API.
- Adicionar suporte a múltiplos idiomas.
- Melhorar a interface de busca com filtros mais avançados.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
