import type { User } from "@recipe-today/prisma";
import type { UserPayload } from "../schemas/user-schema.js";
import { mapDbUserProvider } from "./map-db-user-provider.js";

export function getUserPayload(user: User): UserPayload {
  return { id: user.id, email: user.email, displayName: user.displayName, provider: mapDbUserProvider(user.provider) };
}
