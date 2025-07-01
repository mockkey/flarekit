import { and, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../schema";

type CreateUserParams = Omit<
  schema.User,
  "id" | "emailVerified" | "createdAt" | "updatedAt"
>;
type UpdateUserParams = Partial<
  Omit<schema.User, "id" | "createdAt" | "updatedAt">
>;
type CreateSessionParams = Omit<
  schema.Session,
  "id" | "createdAt" | "updatedAt"
>;
type CreateAccountParams = Omit<
  schema.Account,
  "id" | "createdAt" | "updatedAt"
>;
type UpdateAccountParams = Partial<
  Omit<schema.Account, "id" | "createdAt" | "updatedAt">
>;

type Session = {
  session: schema.Session | null;
  user: schema.User | null;
};

export class UserDbService {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  // Get user by email
  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    return this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .get();
  }

  // Get user by ID
  async getUserById(id: string): Promise<schema.User | undefined> {
    return this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, id))
      .get();
  }

  // Create new user
  async createUser(params: CreateUserParams): Promise<schema.User> {
    return this.db
      .insert(schema.user)
      .values({
        ...params,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();
  }

  // Update user
  async updateUser(
    userId: string,
    params: UpdateUserParams,
  ): Promise<schema.User | undefined> {
    return this.db
      .update(schema.user)
      .set({
        ...params,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, userId))
      .returning()
      .get();
  }

  // Delete user
  async deleteUser(userId: string): Promise<schema.User | undefined> {
    return this.db
      .delete(schema.user)
      .where(eq(schema.user.id, userId))
      .returning()
      .get();
  }

  // Update email verification status
  async updateUserEmailVerified(
    userId: string,
    isVerified: boolean,
  ): Promise<schema.User | undefined> {
    return this.db
      .update(schema.user)
      .set({ emailVerified: isVerified, updatedAt: new Date() })
      .where(eq(schema.user.id, userId))
      .returning()
      .get();
  }

  // Get user session
  async getUserSession(sessionId: string): Promise<schema.Session | undefined> {
    return this.db
      .select()
      .from(schema.session)
      .where(eq(schema.session.id, sessionId))
      .get();
  }

  async getUserSessionByToken(token: string): Promise<Session | undefined> {
    return this.db
      .select({
        user: schema.user,
        session: schema.session,
      })
      .from(schema.session)
      .leftJoin(schema.user, eq(schema.user.id, schema.session.userId))
      .where(eq(schema.session.token, token))
      .get();
  }

  // Create user session
  async createUserSession(
    params: CreateSessionParams,
  ): Promise<schema.Session> {
    return this.db
      .insert(schema.session)
      .values({
        ...params,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();
  }

  // Delete user session
  async deleteUserSession(
    sessionId: string,
  ): Promise<schema.Session | undefined> {
    return this.db
      .delete(schema.session)
      .where(eq(schema.session.id, sessionId))
      .returning()
      .get();
  }

  // Get user account
  async getUserAccount(params: {
    userId: string;
    providerId: string;
  }): Promise<schema.Account | undefined> {
    return this.db
      .select()
      .from(schema.account)
      .where(
        and(
          eq(schema.account.userId, params.userId),
          eq(schema.account.providerId, params.providerId),
        ),
      )
      .get();
  }

  // Create user account
  async createUserAccount(
    params: CreateAccountParams,
  ): Promise<schema.Account> {
    return this.db
      .insert(schema.account)
      .values({
        ...params,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
      .get();
  }

  // Update user account
  async updateUserAccount(
    accountId: string,
    params: UpdateAccountParams,
  ): Promise<schema.Account | undefined> {
    return this.db
      .update(schema.account)
      .set({
        ...params,
        updatedAt: new Date(),
      })
      .where(eq(schema.account.id, accountId))
      .returning()
      .get();
  }

  // Delete user account
  async deleteUserAccount(
    accountId: string,
  ): Promise<schema.Account | undefined> {
    return this.db
      .delete(schema.account)
      .where(eq(schema.account.id, accountId))
      .returning()
      .get();
  }
}
