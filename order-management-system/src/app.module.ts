import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';
import { KafkaModule } from './kafka/kafka.module';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';

// Configuração do módulo principal da aplicação
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      // carrega automaticamente as entidades registradas via forFeature
      autoLoadEntities: true,
      // sincronização automática para ambiente de desenvolvimento
      synchronize: true,
    }),
    OrdersModule,
    KafkaModule,
    ElasticsearchModule,
  ],
})
export class AppModule {}
