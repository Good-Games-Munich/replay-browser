import fastify, { type FastifyServerOptions } from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import routes from "./routes";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

function buildApp(opts: FastifyServerOptions = {}) {
  const app = fastify(opts);

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Slippi Replay Collector API",
        version: "0.0.1",
      },
      servers: [{ url: "http://localhost:3001", description: "Local server" }],
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(routes);

  return app.withTypeProvider<ZodTypeProvider>();
}

const app = buildApp({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
});

export type App = typeof app;

export default app;
