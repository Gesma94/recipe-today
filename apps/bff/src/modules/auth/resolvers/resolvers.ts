import type { Resolvers } from "../../../@types/graphql-generated.js";
import { createUser } from "../mutations/createUser.js";

const users = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

const resolvers: Resolvers = {
  Query: {
    users: () => users,
  },
  Mutation: {
    createUser: createUser,
  },
};

export default resolvers;
