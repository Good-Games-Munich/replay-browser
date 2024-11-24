import app from "./server/app";
import { ConnectionScanner } from "./connection-scanner/index";
import { wiiStore } from "./store";
import { createWiiManager } from "./wii-manager";
import { publisher, rabbit } from "./rabbit";

rabbit.on("error", (err) => {
  app.log.error("RabbitMQ connection error", err);
});

rabbit.on("connection", () => {
  app.log.info("Connection to RabbitMQ successfully established");
});

const start = async () => {
  const connectionScanner = new ConnectionScanner(wiiStore);
  const wiiManager = createWiiManager(app);

  connectionScanner.on("consoleDiscovered", (console) => {
    app.log.info(
      `Discovered console: ${console.nickname} (${console.ip} - ${console.mac})`,
    );

    publisher.send("prod.console.discovered", console);
    wiiManager.startConnection(console);
  });

  connectionScanner.startScanning(() => {
    app.log.info("Scanning for Slippi connections on port 20582");
  });

  connectionScanner.on("receivedMessage", (console) => {
    app.log.info(
      `Received message from console: ${console.nickname} (${console.ip} - ${console.mac})`,
    );
    publisher.send("prod.console.heartbeat", console);
  });

  connectionScanner.addListener("timeout", (console) => {
    app.log.info(
      `Timeout: ${console.nickname} (${console.ip} - ${console.mac})`,
    );
    publisher.send("prod.console.timeout", console);
  });

  try {
    await app.listen({ port: 3001 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  app.log.info("SIGINT signal received");
  app.close();
  rabbit.close();
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  app.log.error(err);
  app.close();
  process.exit(1);
});

start();
