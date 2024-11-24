import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { wiiStore } from "../store";
import type { App } from "./app";
import { z } from "zod";
import { WiiSchema } from "@ggm-replays/core/schemas";

async function routes(fastify: App) {
  fastify.route({
    method: "GET",
    url: "/connected",
    schema: {
      response: {
        200: z.array(WiiSchema),
      },
    },
    handler: async () => {
      return wiiStore.getList();
    },
  });
}

export default routes;
