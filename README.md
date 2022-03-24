# Nest with Kafka

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

- Provide KAFKA_SERVER or gcp.kafka.com host configuration
- Create a first-topic : `kafka-topics --bootstrap-server localhost:9092 --create --topic first-topic --partitions 1 --replication-factor 1`
- Verify topic content size: `kafka-run-class kafka.tools.GetOffsetShell --broker-list localhost:9092 --topic second-topic --time -1`

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
