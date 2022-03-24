import { Injectable } from '@nestjs/common';
import {
  ConsumerGlobalConfig,
  ConsumerTopicConfig,
  KafkaConsumer,
} from 'node-rdkafka';
import { BasicStore } from 'src/app/store/store';

@Injectable()
export class AppKafkaConsumer {
  private consumer: KafkaConsumer;

  constructor(private store: BasicStore) {}

  public init(
    globalConfig: ConsumerGlobalConfig,
    topicConfig: ConsumerTopicConfig,
  ) {
    this.consumer = new KafkaConsumer(
      {
        debug: 'all',
        'enable.auto.commit': false,
        ...globalConfig,
      },
      topicConfig,
    );
  }

  public connect(topicList: string[]): void {
    this.consumer.on('ready', (info, metadata) => {
      console.log(`consumer ready: ${info.name}, ${metadata.orig_broker_name}`);
      this.consumer.subscribe(topicList);
      this.consumer.consume();
    });

    this.consumer.on('data', (data) => {
      console.log(`Message found! from topic ${data.topic}`);
      const value = data.value.toString();
      this.store.set('data', value);
      this.consumer.commit();
    });

    this.consumer.on('connection.failure', (err, metrics) =>
      console.error(
        `Connection failure: ${err.message}, ${JSON.stringify(metrics)}`,
      ),
    );

    this.consumer.on('event.log', (event) => {
      console.debug(`Consumer event.log, ${JSON.stringify(event)}`);
    });

    this.consumer.on('disconnected', (metrics) =>
      console.log(`Consumer disconnected: ${JSON.stringify(metrics)}`),
    );

    this.consumer.on('event.error', (err) =>
      console.error(`Connection failure: ${err.message}`),
    );

    this.consumer.connect();
  }

  disconnect() {
    this.consumer.disconnect();
  }
}
