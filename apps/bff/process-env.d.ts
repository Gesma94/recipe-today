declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CORS_ORIGIN: string;
      SERVER_COMMON_ENV: string;
      OPEN_AI_API_KEY: string;
      COOKIE_SECRET_KEY: string;
      JWT_SECRET_KEY: string;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_CLIENT_EMAIL: string;
      FIREBASE_PRIVATE_KEY: string;
    }
  }
}

export {};
