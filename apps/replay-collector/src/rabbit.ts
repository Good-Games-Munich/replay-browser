import { Connection } from "rabbitmq-client";

export const rabbit = new Connection({
  url: "amqp://guest:guest@localhost:5672",
});

export const publisher = rabbit.createPublisher({
  confirm: true,
  maxAttempts: 3,
  exchanges: [
    {
      exchange: "consoles",
      type: "topic",
    },
  ],
  queues: [
    {
      queue: "prod.console.discovered",
    },
    {
      queue: "prod.console.timeout",
    },
    {
      queue: "prod.console.heartbeat",
    },
    {
      queue: "prod.console.status-change",
    },
    {
      queue: "prod.replay.started",
      durable: true,
    },
    {
      queue: "prod.replay.complete",
      durable: true,
    },
  ],
  queueBindings: [
    {
      queue: "prod.console.discovered",
      exchange: "consoles",
      routingKey: "prod.console.discovered",
    },
    {
      queue: "prod.console.timeout",
      exchange: "consoles",
      routingKey: "prod.console.timeout",
    },
    {
      queue: "prod.console.heartbeat",
      exchange: "consoles",
      routingKey: "prod.console.heartbeat",
    },
    {
      queue: "prod.console.status-change",
      exchange: "consoles",
      routingKey: "prod.console.status-change",
    },
    {
      queue: "prod.replay.started",
      exchange: "consoles",
      routingKey: "prod.replay.started",
    },
    {
      queue: "prod.replay.complete",
      exchange: "consoles",
      routingKey: "prod.replay.complete",
    },
  ],
});
