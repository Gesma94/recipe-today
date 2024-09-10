import { it, expect, describe } from "vitest";
import { setupTestDbEnvironment, type TestDbEnvironmentContext } from "../../../../tests/test-setups.js";
import { faker } from "@faker-js/faker";
import { UserPayloadSchema, type UserPayload } from "../../../common/schemas/user-schema.js";
import { Value } from "@sinclair/typebox/value";
import { COOKIES_NAME, UserProvider } from "../../../common/const.js";

describe("POST /sign-up", () => {
  setupTestDbEnvironment();

  it<TestDbEnvironmentContext>("returns 200 with new user and set cookie", async ({ app }) => {
    const email = faker.internet.email();
    const displayName = faker.internet.displayName();

    expect(await app.prisma.user.findMany()).toHaveLength(0);

    const response = await app.inject({
      method: "POST",
      url: "/api/sign-up",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        email,
        displayName,
        password: faker.internet.password({ length: 8 }),
      },
    });

    const bodyResponse = response.json<UserPayload>();

    expect(response.statusCode).toBe(200);
    expect(bodyResponse.email).toBe(email);
    expect(bodyResponse.displayName).toBe(displayName);
    expect(bodyResponse.provider).toBe(UserProvider.Native);
    expect(Value.Check(UserPayloadSchema, bodyResponse)).toBe(true);
    expect(response.cookies.find(cookie => cookie.name === COOKIES_NAME.accessToken)).toBeTruthy();
    expect(response.cookies.find(cookie => cookie.name === COOKIES_NAME.refreshToken)).toBeTruthy();

    const users = await app.prisma.user.findMany();

    expect(users).toHaveLength(1);
    expect(users[0]?.email).toBe(email);
    expect(users[0]?.firebase_uid).toBe(null);
    expect(users[0]?.displayName).toBe(displayName);
  });
});
