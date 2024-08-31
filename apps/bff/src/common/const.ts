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

export const ERROR_CODE = {
  FST_JWT_AUTHORIZATION_TOKEN_EXPIRED: "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED",
  RT_INVALID_ACCESS_TOKEN: "RT_INVALID_ACCESS_TOKEN",
} as const;
