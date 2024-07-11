import type { PrismaClient, User } from "@recipe-today/prisma";

export type IAuthRepository = {
  createUser(props: CreateUserProps): Promise<User>;
};

export function authRepositoryFactory(prismaClient: PrismaClient): IAuthRepository {
  return {
    createUser: async props => {
      const { displayName, email, firebaseUid, password } = props;

      return prismaClient.user.create({
        data: {
          email,
          password,
          displayName,
          firebase_uid: firebaseUid,
        },
      });
    },
  };
}

type CreateUserProps = {
  firebaseUid?: string | null;
  displayName: string;
  email: string;
  password?: string | null;
};
