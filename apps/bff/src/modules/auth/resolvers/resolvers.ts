const users = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

export default {
  Query: {
    users: () => users,
  },
};
