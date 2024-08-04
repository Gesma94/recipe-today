export const FASTIFY_PLUGINS_NAME_KEY = {
  firebase: "firebase",
  openai: "openai",
  prisma: "prisma",
  repositories: "repositories",
  passwordHasher: "passwordHasher",
  refreshTokens: "refreshTokens",
} as const;

export const COOKIES_NAME = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};
