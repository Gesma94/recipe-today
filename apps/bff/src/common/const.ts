export const FASTIFY_PLUGINS_NAME_KEY = {
  firebase: "firebase",
  openai: "openai",
  prisma: "prisma",
  cookie: "cookie",
  bcrypt: "bcrypt",
  setAuthCookies: "setAuthCookies",
  getAndSetAuthCookies: "getAndSetAuthCookies",
  tokens: "tokens",
} as const;

export const COOKIES_NAME = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};

export enum UserProvider {
  Email,
  Google,
}

export enum ErrorCode {
  FST_JwyAuthorizationTokenExpired = "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED",
  RT_InvalidAccessToken = "RT_INVALID_ACCESS_TOKEN",
  RT_InvalidRefreshToken = "RT_INVALID_REFRESH_TOKEN",
  RT_InvalidGoogleIdToken = "RT_INVALID_GOOGLE_ID_TOKEN",
  RT_EmailAlreadyUsed = "RT_EMAIL_ALREADY_USED",
  RT_DisplayNameAlreadyUsed = "RT_DISPLAY_NAME_ALREADY_USED",
  RT_InvalidCredentials = "RT_INVALID_CREDENTIALS",
  RT_UserRegistrationFailed = "RT_USER_REGISTRATION_FAILED",
  RT_MockError = "RT_MOCK_ERROR",
}
