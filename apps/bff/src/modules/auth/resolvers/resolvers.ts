import type { IResolvers } from "@graphql-tools/utils";

const users = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

const resolvers: IResolvers = {
  Query: {
    users: () => users,
  },
};

export default resolvers;
