import { publicProcedure } from "../trpc";
import eventEmitter from "@/server/rabbit/event-emitter";
import { createTRPCRouter } from "../trpc";
import { on } from "node:events";
import {
  type ReplayCompleteMessageBody,
  replayCompleteMessageBodySchema,
} from "@ggm-replays/core/schemas";
import { zAsyncIterable } from "@/server/utils/zAsyncIterator";
import { z } from "zod";

export const replayRouter = createTRPCRouter({
  onReplayComplete: publicProcedure
    .output(
      zAsyncIterable({
        yield: replayCompleteMessageBodySchema,
        tracked: false,
      }),
    )
    .subscription(async function* (opts) {
      // listen for new events
      for await (const [data] of on(eventEmitter, "replay_complete", {
        // Passing the AbortSignal from the request automatically cancels the event emitter when the request is aborted
        signal: opts.signal,
      })) {
        const replay = data as ReplayCompleteMessageBody;
        yield replay;
      }
    }),
});
