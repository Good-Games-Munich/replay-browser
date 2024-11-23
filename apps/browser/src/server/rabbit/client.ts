import { env } from "@/env";
import { Connection } from "rabbitmq-client";
import eventEmitter from "./event-emitter";
import { queueNames } from "@ggm-replays/core/queues";
import { replayCompleteMessageBodySchema } from "@ggm-replays/core/schemas";
const connection = new Connection({
  url: env.RABBITMQ_URL,
});

connection.on("connection", () => {
  console.log("Connected to RabbitMQ");
});

connection.createConsumer(
  {
    queue: queueNames.REPLAY_COMPLETE,
    queueOptions: {
      durable: true,
    },
  },
  (message) => {
    console.log("Received message", message);
    eventEmitter.emit("replay_complete", message.body);
  },
);

export default connection;
