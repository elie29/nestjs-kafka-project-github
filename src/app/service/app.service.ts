import { Injectable } from '@nestjs/common';
import { bufferToggle, filter, merge, mergeAll, tap, windowToggle } from 'rxjs';
import { BasicStore } from '../store/store';
import { AppKafkaConsumer } from './kafka-consumer';
import { AppKafkaProducer } from './kafka-producer';

const KAFKA_SERVER = process.env.KAFKA_SERVER || 'localhost';

@Injectable()
export class AppService {
  // Ignore undefined data
  private source$ = this.store.select('data').pipe(filter(Boolean));
  private producerOn$ = this.store.select('connected').pipe(filter(Boolean));
  private producerOff$ = this.store.select('connected').pipe(filter((v) => !v));

  constructor(
    private appConsumer: AppKafkaConsumer,
    private appProducer: AppKafkaProducer,
    private store: BasicStore,
  ) {
    this.initProducer();
  }

  disconnect() {
    this.appConsumer.disconnect();
    this.appConsumer.disconnect();
  }

  waitForMessage(topic: string, group: string): void {
    console.log(`WaitForMessage called with topic: ${topic}, group: ${group}`);
    this.initConsumer(topic, group);
    this.sendDataToAnotherTopic();
  }

  private initProducer() {
    this.appProducer.init({
      'metadata.broker.list': `${KAFKA_SERVER}:9092`,
      'client.id': 'nest.kafka',
    });
  }

  private initConsumer(topic: string, group: string) {
    this.appConsumer.init(
      {
        'group.id': group,
        'metadata.broker.list': `${KAFKA_SERVER}:9092`,
      },
      {
        'auto.offset.reset': 'earliest',
      },
    );
    this.appConsumer.connect([topic]);
  }

  /**
   * We could filter data content by group or other stuff...
   */
  private sendDataToAnotherTopic(): void {
    // filter source data here if needed
    const source = this.source$;

    // subscribe to consume data
    merge(
      // Emit when producer is ON
      source.pipe(windowToggle(this.producerOn$, () => this.producerOff$)),
      // Buffer when producer is OFF
      source.pipe(bufferToggle(this.producerOff$, () => this.producerOn$)),
    )
      .pipe(
        // then flatten buffer arrays and window Observables
        mergeAll(),
        // Send data to second topic
        tap((data) => this.appProducer.send('second-topic', data)),
      )
      .subscribe();
  }
}
