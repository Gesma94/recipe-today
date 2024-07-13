import type { FastifyPluginAsync } from "fastify";

const loginRoute: FastifyPluginAsync = async fastify => {
  fastify.get("/authentication", async () => {
    return { hello: "world" }; // Replace with actual logic
  });
};

export default loginRoute;
