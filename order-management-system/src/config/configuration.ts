import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  const pgHost =
    process.env.POSTGRES_HOST ||
    process.env.ORDER_MANAGEMENT_HOST ||
    'localhost';
  const pgPort = parseInt(
    process.env.POSTGRES_PORT || process.env.ORDER_MANAGEMENT_PORT || '5432',
    10,
  );
  const pgUser =
    process.env.POSTGRES_USER || process.env.ORDER_MANAGEMENT_USER || 'user';
  const pgPassword =
    process.env.POSTGRES_PASSWORD ||
    process.env.ORDER_MANAGEMENT_PASSWORD ||
    undefined;
  const pgDatabase =
    process.env.POSTGRES_DB ||
    process.env.ORDER_MANAGEMENT_DB ||
    'order_management';

  const kafkaBrokersEnv = process.env.KAFKA_BROKERS || 'localhost:9092';
  const kafkaBrokers = kafkaBrokersEnv
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);

  const esHost = process.env.ELASTICSEARCH_HOST || 'localhost';
  const esPort = parseInt(process.env.ELASTICSEARCH_PORT || '9200', 10);
  const elasticsearchUrl =
    process.env.ELASTICSEARCH_URL || `http://${esHost}:${esPort}`;

  return {
    postgres: {
      host: pgHost,
      port: pgPort,
      username: pgUser,
      password: pgPassword,
      database: pgDatabase,
    },
    kafka: {
      brokers: kafkaBrokers,
    },
    elasticsearch: {
      url: elasticsearchUrl,
      host: esHost,
      port: esPort,
    },
  };
});
