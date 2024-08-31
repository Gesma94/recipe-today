import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { cert, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { auth } from "firebase-admin";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";

type FirebaseDecorator = {
  app: App;
  auth: auth.Auth;
};
declare module "fastify" {
  interface FastifyInstance {
    [FASTIFY_PLUGINS_NAME_KEY.firebase]: FirebaseDecorator;
  }
}

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

export default fp(
  async (fastify: FastifyInstance) => {
    const firebaseApp = initializeApp({ credential: cert(serviceAccount) });
    fastify.decorate(FASTIFY_PLUGINS_NAME_KEY.firebase, {
      app: firebaseApp,
      auth: auth(),
    });
  },
  {
    name: FASTIFY_PLUGINS_NAME_KEY.firebase,
  },
);
