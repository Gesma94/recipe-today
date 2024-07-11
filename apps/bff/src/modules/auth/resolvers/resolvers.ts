import type { IResolvers } from "mercurius";
import { createUser } from "../mutations/createUser.js";

const users = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

const resolvers: IResolvers = {
  Query: {
    users: () => users,
  },
  Mutation: {
    createUser: createUser,
  },
};

export default resolvers;
