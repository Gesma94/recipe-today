import { Type, type Static } from "@sinclair/typebox";
import { UserProvider } from "../const.js";

export const UserPayloadSchema = Type.Object({
  id: Type.Number(),
  email: Type.String(),
  displayName: Type.String(),
  provider: Type.Enum(UserProvider),
});

export type UserPayload = Static<typeof UserPayloadSchema>;
