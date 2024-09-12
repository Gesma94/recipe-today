import { faker } from "@faker-js/faker";
import { $Enums, type User } from "@recipe-today/prisma";

export function createFakerUser(id: number, override?: Partial<Omit<User, "id">>): User {
  return {
    id,
    firebase_uid: null,
    email: faker.internet.email(),
    password: faker.internet.password({ length: 8 }),
    createdAt: new Date(),
    displayName: faker.internet.displayName(),
    updatedAt: new Date(),
    provider: $Enums.UserProvider.EMAIL,
    ...override,
  };
}
