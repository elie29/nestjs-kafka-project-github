import { Module } from '@nestjs/common';
import { AppController } from './controller/app.controller';
import { AppService } from './service/app.service';
import { AppKafkaConsumer } from './service/kafka-consumer';
import { AppKafkaProducer } from './service/kafka-producer';
import { BasicStore } from './store/store';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AppKafkaConsumer, AppKafkaProducer, BasicStore],
})
export class AppModule {}
