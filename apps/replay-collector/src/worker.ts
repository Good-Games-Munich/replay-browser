import {
  ConnectionEvent,
  ConsoleConnection,
  Ports,
  SlippiGame,
  SlpFileWriter,
  SlpFileWriterEvent,
} from "@slippi/slippi-js";
import type { Wii } from "@ggm-replays/core/schemas";
import type { WorkerResponseEvent } from "./wii-manager";

declare const self: Worker;

type ConnectionStartEvent = {
  type: "start";
  data: {
    wii: Wii;
  };
};

type ConnectionStopEvent = {
  type: "stop";
};

type WorkerConnectionEvent = ConnectionStartEvent | ConnectionStopEvent;

self.onmessage = (event: MessageEvent<WorkerConnectionEvent>) => {
  console.log("[Worker] Received message", event);
  switch (event.data.type) {
    case "start":
      startConnection(event.data.data.wii);
      break;
    case "stop":
      stopConnection();
      break;
  }
};

let connection: ConsoleConnection | undefined;
let fileWriter: SlpFileWriter | undefined;

const stopConnection = () => {
  connection?.disconnect();
  fileWriter?.destroy();
};

export const startConnection = async (wii: Wii): Promise<void> => {
  connection = new ConsoleConnection();

  connection.on(ConnectionEvent.CONNECT, () => {
    self.postMessage({
      type: "console-connected",
    } satisfies WorkerResponseEvent);
  });

  connection.on(ConnectionEvent.ERROR, (error) => {
    self.postMessage({
      type: "error",
      data: {
        error,
      },
    } satisfies WorkerResponseEvent);
  });

  connection.on(ConnectionEvent.STATUS_CHANGE, (status) => {
    self.postMessage({
      type: "status-change",
      data: {
        status,
      },
    } satisfies WorkerResponseEvent);
  });

  fileWriter = new SlpFileWriter({
    folderPath: "./slp",
    consoleNickname: wii.nickname,
  });

  fileWriter.on(SlpFileWriterEvent.NEW_FILE, (file: string) => {
    self.postMessage({
      type: "replay-started",
      data: {
        file,
      },
    } satisfies WorkerResponseEvent);
  });

  fileWriter.on(SlpFileWriterEvent.FILE_COMPLETE, (file: string) => {
    self.postMessage({
      type: "replay-complete",
      data: {
        file,
      },
    } satisfies WorkerResponseEvent);
  });

  connection.on(ConnectionEvent.DATA, (data) => {
    fileWriter?.write(data);
  });

  connection.connect(wii.ip, Ports.DEFAULT, false, 10000);
};
