<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

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

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

