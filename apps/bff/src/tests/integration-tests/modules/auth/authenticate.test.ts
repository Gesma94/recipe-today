import "dotenv/config";
import { it, expect, beforeAll, afterAll, describe } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildFastify } from "../../../../app.js";
import { getTokens } from "../../../../modules/auth/common/getTokens.js";
import type { UserPayload } from "../../../../plugins/jwt.js";
import { getPrintableRoutes } from "../../../../utils/printRoutes.js";

it("test", () => {
  expect(1).toBe(1);
});

let app: FastifyInstance;

beforeAll(async () => {
  app = buildFastify();
  app.listen({ port: 1301, host: "0.0.0.0" });

  await app.ready().then(() => {
    console.log("then");
    getPrintableRoutes(app);
  });
});

afterAll(() => {
  app.close();
});

const generateValidTokens = (userPayload: UserPayload) => {
  const { accessToken, refreshToken } = getTokens(app, userPayload);
  return { accessToken, refreshToken };
};

// // const generateInvalidToken = () => 'invalid.token.value';

describe("GET /authenticate", () => {
  it("should return user data if JWT is valid", async () => {
    const mockUser = { id: 7, email: "test@example.com", displayName: "Test User" };
    const { accessToken } = generateValidTokens(mockUser);

    const response = await app.inject({
      method: "GET",
      url: "/api/authenticate",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  // //   it('should return new tokens and user data if refresh token is valid', async () => {
  // //     const mockUser = { email: 'test@example.com', displayName: 'Test User' };
  // //     const { refreshToken } = generateValidTokens(mockUser);

  // //     const response = await supertest(app.server)
  // //       .get('/authenticate')
  // //       .set('Cookie', [`${COOKIES_NAME.refreshToken}=${refreshToken}`]);

  // //     expect(response.status).toBe(200);
  // //     expect(response.body).toEqual(mockUser);
  // //     expect(response.headers['set-cookie']).toEqual(
  // //       expect.arrayContaining([
  // //         expect.stringContaining(`${COOKIES_NAME.accessToken}`),
  // //         expect.stringContaining(`${COOKIES_NAME.refreshToken}`)
  // //       ])
  // //     );
});

// //   it('should return 401 if refresh token is not available', async () => {
// //     const response = await supertest(app.server)
// //       .get('/authenticate');

// //     expect(response.status).toBe(401);
// //     expect(response.body).toEqual({ error: 'refresh token not available' });
// //   });

// //   it('should return 401 if refresh token is invalid', async () => {
// //     const invalidRefreshToken = generateInvalidToken();

// //     const response = await supertest(app.server)
// //       .get('/authenticate')
// //       .set('Cookie', [`${COOKIES_NAME.refreshToken}=${invalidRefreshToken}`]);

// //     expect(response.status).toBe(401);
// //     expect(response.body).toEqual({ error: 'cannot authenticate with refresh token' });
// //   });
// // });
