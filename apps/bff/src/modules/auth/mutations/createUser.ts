import type { MutationResolvers } from "../../../@types/mercurius-generated.js";
import { ErrorType } from "../../../@types/mercurius-generated.js";

export const createUser: MutationResolvers["createUser"] = async (_parent, args, contextValue) => {
  const { displayName, email, firebaseUid, password } = args.input;

  if (firebaseUid && password) {
    contextValue.app.log.error(contextValue, "cannot create account with password and firebaseUid");

    return {
      success: false,
      error: ErrorType.INTERNAL_ERROR,
    };
  }

  if (!firebaseUid && !password) {
    contextValue.app.log.error(contextValue, "cannot create acount with neither password nor firebase uid");

    return {
      success: false,
      error: ErrorType.INTERNAL_ERROR,
    };
  }

  if (!displayName) {
    contextValue.app.log.error(contextValue, "displayName cannot be undefined nor null");

    return {
      success: false,
      error: ErrorType.INTERNAL_ERROR,
    };
  }

  if (!email) {
    contextValue.app.log.error(contextValue, "email cannot be undefined nor null");

    return {
      success: false,
      error: ErrorType.INTERNAL_ERROR,
    };
  }

  contextValue.app.repositories.authRepository.createUser({
    displayName,
    email,
    firebaseUid,
    password: contextValue.app.passwordHasher.hashPassword(password),
  });

  return {
    data: { name: "test1", id: "id_test" },
    success: true,
  };
};
