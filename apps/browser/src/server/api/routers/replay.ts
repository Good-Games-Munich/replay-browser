import { zAsyncIterable } from "@/server/utils/zAsyncIterator";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import Redis from "ioredis";
import { on } from "node:events";
import { env } from "@/env";
import { z } from "zod";

const redisSub = new Redis(env.REDIS_KV_URL);

export const replayRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.replays.findMany();
  }),
  onReplayComplete: publicProcedure
    .output(
      zAsyncIterable({
        yield: z.any(),
        tracked: false,
      }),
    )
    .subscription(async function* (opts) {
      redisSub.subscribe("replay_complete", (err) => {
        if (err) {
          console.error(err);
        }
      });

      // listen for new events
      for await (const [_channel, data] of on(redisSub, "message", {
        signal: opts.signal,
      })) {
        const replay = data;
        yield replay;
      }
    }),
});
