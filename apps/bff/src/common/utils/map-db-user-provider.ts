import { $Enums } from "@recipe-today/prisma";
import { UserProvider } from "../const.js";

export function mapDbUserProvider(dbUserProvider: $Enums.UserProvider): UserProvider {
  switch (dbUserProvider) {
    case $Enums.UserProvider.EMAIL:
      return UserProvider.Email;
    case $Enums.UserProvider.GOOGLE:
      return UserProvider.Google;
  }
}
