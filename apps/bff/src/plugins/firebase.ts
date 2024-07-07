import type { FastifyInstance } from "fastify";
import { cert, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";

declare module "fastify" {
  interface FastifyInstance {
    [FASTIFY_PLUGINS_NAME_KEY.firebase]: App;
  }
}

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

export default async (fastify: FastifyInstance) => {
  const firebaseApp = initializeApp({ credential: cert(serviceAccount) });
  fastify.decorate(FASTIFY_PLUGINS_NAME_KEY.firebase, firebaseApp);
};
