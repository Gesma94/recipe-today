export const FASTIFY_PLUGINS_NAME_KEY = {
  firebase: "firebase",
  openai: "openai",
  prisma: "prisma",
  cookie: "cookie",
  repositories: "repositories",
  passwordHasher: "passwordHasher",
  tokens: "tokens",
} as const;

export const COOKIES_NAME = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};
