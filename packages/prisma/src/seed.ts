import { faker } from "@faker-js/faker";
import { prismaClient } from "./main.js";

await prismaClient.user.create({
  data: {
    displayName: faker.person.firstName(),
    firebase_uid: faker.string.uuid(),
  },
});

await prismaClient.user.create({
  data: {
    displayName: faker.person.firstName(),
    firebase_uid: faker.string.uuid(),
  },
});

await prismaClient.user.create({
  data: {
    displayName: faker.person.firstName(),
    firebase_uid: faker.string.uuid(),
  },
});
