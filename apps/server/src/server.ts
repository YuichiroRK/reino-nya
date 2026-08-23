import Fastify from "fastify";
import { SHARED_VERSION } from "@td-nya/shared";
import { GameConstants } from "@td-nya/game-data";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", async (request, reply) => {
  return { 
    message: "Imperio del Nya Server is running",
    version: SHARED_VERSION,
    constants: GameConstants
  };
});

const start = async () => {
  try {
    // Fastify must listen on 0.0.0.0 inside Docker
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
    await fastify.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
