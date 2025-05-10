import type { User } from "better-auth";

export type ExtendedUser = User & {
  theme: string;
};
