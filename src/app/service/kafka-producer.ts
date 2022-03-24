import { Injectable } from '@nestjs/common';
import { Producer, ProducerGlobalConfig } from 'node-rdkafka';
import { BasicStore } from 'src/app/store/store';

@Injectable()
export class AppKafkaProducer {
  private producer: Producer;

  constructor(private store: BasicStore) {}

  public init(producerConfig: ProducerGlobalConfig) {
    const KB = 1024;
    const MB = KB * KB;
    const MILLION = 1000 * 1000;

    this.producer = new Producer({
      debug: 'all',
      dr_msg_cb: true,
      dr_cb: true,
      // queue size
      'queue.buffering.max.messages': 10 * MILLION, // MAX allowed range
      // batch size
      'batch.num.messages': MILLION, // max is one million messages to be sent in a batch
      'batch.size': 32 * MB, // 2 * 1024 messages if one message is 16KB
      // each message contains a string so 16 KB is very large
      'message.max.bytes': 16 * KB,
      // milliseconds to wait before sending the batch
      // however, if the batch size is full before, it will be send right away
      'linger.ms': 100,
      'compression.type': 'gzip',
      ...producerConfig,
    });

    this.producer.setPollInterval(10);

    this.producer.on('ready', (info, metadata) => {
      console.log(`producer ready, ${info.name}, ${metadata.orig_broker_name}`);
      this.store.set('connected', true);
    });

    this.producer.on('event.log', (event) => {
      console.debug(`Producer event.log, ${JSON.stringify(event)}`);
    });

    this.producer.on('event.error', (error) => {
      console.error(`Producer error occurred, ${error.message}`);
    });

    this.producer.on('delivery-report', (error, report) => {
      if (error) {
        console.error(`producer delivery-report error, ${error.message}`);
      } else {
        console.log(`delivered, ${report.topic}`);
      }
    });

    this.producer.connect({}, (error, data) => {
      if (error) {
        console.error(`Connection error: ${error.message}`);
        this.store.set('connected', false);
      } else {
        console.info(`connect to "${data.orig_broker_name}"`);
      }
    });

    this.producer.on('disconnected', (metrics) => {
      console.log(`Consumer disconnected: ${JSON.stringify(metrics)}`);
      this.store.set('connected', false);
    });
  }

  public send(topic: string, message: string): void {
    this.producer.produce(
      topic,
      null,
      Buffer.from(message),
      Buffer.from(Date.now().toString(36)),
    );
    // REQUIRED to flush the queue
    // poll() is cheap to call, it will not have a performance impact
    this.producer.poll();
  }

  disconnect() {
    this.producer.disconnect();
  }
}
