import type { App } from "./server/app";
import { createFileManager } from "./file-manager";
import { publisher } from "./rabbit";
import type { Wii } from "@ggm-replays/core/schemas";
import { queueNames } from "@ggm-replays/core/queues";
interface WiiManager {
  startConnection: (wii: Wii) => Promise<void>;
}

type WorkerResponseConnectionEvent = {
  type: "console-connected";
};

type WorkerResponseErrorEvent = {
  type: "error";
  data: {
    error: unknown;
  };
};

type WorkerResponseStatusChangeEvent = {
  type: "status-change";
  data: {
    status: string;
  };
};

type WorkerResponseNewReplayEvent = {
  type: "replay-started";
  data: {
    file: string;
  };
};

type WorkerResponseReplayCompleteEvent = {
  type: "replay-complete";
  data: {
    file: string;
  };
};

export type WorkerResponseEvent =
  | WorkerResponseConnectionEvent
  | WorkerResponseErrorEvent
  | WorkerResponseStatusChangeEvent
  | WorkerResponseNewReplayEvent
  | WorkerResponseReplayCompleteEvent;

export const createWiiManager = (app: App): WiiManager => {
  const fileManager = createFileManager();

  return {
    startConnection: async (wii) => {
      const worker = new Worker("./src/worker.ts");

      worker.addEventListener("message", async (event) => {
        const message = event.data as WorkerResponseEvent;
        switch (message.type) {
          case "console-connected": {
            publisher.send(queueNames.CONSOLE_CONNECTED, { console: wii });
            break;
          }
          case "error": {
            publisher.send(queueNames.CONSOLE_ERROR, {
              console: wii,
              error: message.data.error,
            });
            break;
          }
          case "status-change": {
            publisher.send(queueNames.CONSOLE_STATUS_CHANGE, {
              console: wii,
              status: message.data.status,
            });
            break;
          }
          case "replay-started": {
            publisher.send(queueNames.REPLAY_START, {
              console: wii,
            });
            app.log.info(
              `[WiiManager] Replay started for wii '${wii.nickname}'`,
            );
            break;
          }
          case "replay-complete": {
            // upload file to blob storage
            app.log.info(
              `[WiiManager] Replay completed for wii '${wii.nickname}'`,
            );
            const url = await fileManager.put(message.data.file);
            publisher.send(queueNames.REPLAY_COMPLETE, {
              console: wii,
              fileURL: url,
            });
            break;
          }
          default: {
            console.warn("[WiiManager] Unknown message type", message);
          }
        }
      });

      worker.postMessage({
        type: "start",
        data: {
          wii,
        },
      });
    },
  };
};
