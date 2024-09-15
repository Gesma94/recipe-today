import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { cert, deleteApp, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { FASTIFY_PLUGINS_NAME_KEY } from "../common/const.js";
import { v4 as uuidv4 } from "uuid";

type FirebaseDecorator = {
  app: App;
  auth: Auth;
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
    const uniqueAppName = uuidv4();
    const firebaseApp = initializeApp({ credential: cert(serviceAccount) }, uniqueAppName);

    fastify.decorate(FASTIFY_PLUGINS_NAME_KEY.firebase, {
      app: firebaseApp,
      auth: getAuth(firebaseApp),
    });

    fastify.addHook("onClose", async innerFastify => {
      innerFastify.log.info("deleting firebase app");
      await deleteApp(firebaseApp);
    });
  },
  {
    name: FASTIFY_PLUGINS_NAME_KEY.firebase,
  },
);
