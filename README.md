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

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

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

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Starsoft Backend Challenge — instruções de execução

Resumo

- Projeto de exemplo que expõe API para gerenciamento de pedidos e publica eventos em Kafka.
- Inclui mecanismo de durabilidade: quando Kafka está indisponível, mensagens são persistidas em um log local e enviadas ao reconectar.

Pré-requisitos

- Docker & Docker Compose instalados e em execução.
- Git (opcional).
- (Windows) Recomenda-se executar scripts de integração dentro do Git Bash ou WSL.

Instalação rápida (do diretório raiz do projeto)

1. Build e levantar serviços:

```bash
docker-compose up -d --build
```

2. Verificar logs (apenas para checar start):

```bash
docker-compose logs --no-color --tail 100 app
```

Acessando a API

- Endpoint principal: POST /orders (porta 3000 do container app)
- Exemplo (usando host que está rodando docker-compose):

```bash
# em Unix / WSL / Git Bash
curl -s -X POST http://localhost:3000/orders -H "Content-Type: application/json" -d '{"items":[{"productId":"prod-1","quantity":1}]}'

# em PowerShell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/orders -Body '{ "items":[{"productId":"prod-1","quantity":1}] }' -ContentType "application/json"
```

Rodando testes

- Unitários (se configurado via npm):

```bash
npm ci
npm test
```

Teste de integração — durabilidade Kafka (automatizado)

- Script: `order-management-system/test/integration/durability.sh`
- O script para o broker Kafka, envia um pedido enquanto Kafka está parado, reinicia Kafka e verifica o flush/entrega.
- Tornar executável (Unix/WSL/Git Bash) e executar:

```bash
chmod +x order-management-system/test/integration/durability.sh
bash order-management-system/test/integration/durability.sh
```

- Em Windows PowerShell com WSL:

```powershell
wsl bash order-management-system/test/integration/durability.sh
```

O que o teste valida

- Mensagem é escrita em `/app/order-management-system/data/kafka-queue.log` enquanto Kafka estiver down.
- Ao subir Kafka, a aplicação detecta reconexão e executa "Flushing X queued Kafka messages".
- Consumidor do tópico `order_created` exibe a mensagem enviada durante downtime.

Inspeção manual (útil para debug)

- Ver arquivos de fila dentro do container app:

```bash
docker-compose exec app sh -c "ls -la /app/order-management-system/data && sed -n '1,200p' /app/order-management-system/data/kafka-queue.log"
```

- Listar tópicos Kafka:

```bash
docker-compose exec kafka kafka-topics.sh --bootstrap-server kafka:9092 --list
```

- Consumir mensagens do tópico:

```bash
docker-compose exec kafka kafka-console-consumer.sh --bootstrap-server kafka:9092 --topic order_created --from-beginning --timeout-ms 10000
```

Variáveis de ambiente

- Veja `.env.example` em `order-management-system/` para variáveis necessárias.
- Não commite secrets reais em `.env`.

Melhorias recomendadas antes de envio (checklist)

- Rodar e garantir que todos os testes passem.
- Incluir teste de integração no CI.
- Validar que logs não contenham dados sensíveis.

CI (exemplo)

- Um workflow básico `.github/workflows/ci.yml` pode instalar dependências e rodar `npm test`. Ajuste conforme necessidade.
