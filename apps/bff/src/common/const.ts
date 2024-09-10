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

export enum UserProvider {
  Native,
  Google,
}

export enum ErrorCode {
  FST_JWT_AUTHORIZATION_TOKEN_EXPIRED = "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED",
  RT_INVALID_ACCESS_TOKEN = "RT_INVALID_ACCESS_TOKEN",
  RT_INVALID_REFRESH_TOKEN = "RT_INVALID_REFRESH_TOKEN",
  RT_EmailAlreadyUsed = "RT_EMAIL_ALREADY_USED",
  RT_DisplayNameAlreadyUsed = "RT_DISPLAY_NAME_ALREADY_USED",
  RT_UserRegistrationFailed = "RT_USER_REGISTRATION_FAILED",
  RT_MockError = "RT_MOCK_ERROR",
}
