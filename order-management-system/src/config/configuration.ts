import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'user',
    password: process.env.POSTGRES_PASSWORD || '<placeholder>',
    database: process.env.POSTGRES_DB || 'order_management',
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
  },
  elasticsearch: {
    host: process.env.ELASTICSEARCH_HOST || 'localhost',
    elasticsearchPort: parseInt(process.env.ELASTICSEARCH_PORT || '9200', 10),
  },
}));
