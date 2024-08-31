export type UserPayload = {
  id: number;
  email: string;
  displayName: string;
  provider: "native" | "google";
};
