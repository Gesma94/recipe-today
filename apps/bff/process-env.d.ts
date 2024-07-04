declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SERVER_COMMON_ENV: string;
    }
  }
}

export {};
