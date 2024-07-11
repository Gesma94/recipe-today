import type { MutationResolvers } from "../../../@types/mercurius-generated.js";

export const createUser: MutationResolvers["createUser"] = async (_parent, args, contextValue) => {
  const { displayName, email, firebaseUid, password } = args.input;

  if (firebaseUid && password) {
    return {
      success: false,
      error: "cannot create account with password and firebaseUid",
    };
  }

  if (!firebaseUid && !password) {
    return {
      success: false,
      error: "cannot create acount with neither password nor firebase uid",
    };
  }

  if (!displayName) {
    return {
      success: false,
      error: "displayName cannot be undefined nor null",
    };
  }

  if (!email) {
    return {
      success: false,
      error: "email cannot be undefined nor null",
    };
  }

  contextValue.app.repositories.authRepository.createUser({ displayName, email, firebaseUid, password });

  return {
    data: { name: "test1", id: "id_test" },
    success: true,
    error: "no error",
  };
};
