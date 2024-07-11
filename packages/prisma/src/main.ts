import { PrismaClient, ChatStatus, MessageRole } from "@prisma/client";
import type { Chat, Message, User } from "@prisma/client";

export type { Chat, User, Message };
export { ChatStatus, MessageRole, PrismaClient };
