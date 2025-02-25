import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { createClient } from "redis";
import { config } from "../config.js";
import { users, type NewUser, type User } from "./schema.js";
const { Pool } = pkg;

const SALT_ROUNDS = 10;
const CACHE_TTL = 3600; // 1 hour

export class DrizzleClient {
  private db;
  private pool;
  private redis;

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
    });
    this.db = drizzle(this.pool);
    this.redis = createClient({
      url: config.redis.url,
    });
    this.redis.connect().catch(console.error);
  }

  private async cacheUser(key: string, user: User) {
    await this.redis.set(key, JSON.stringify(user), {
      EX: CACHE_TTL,
    });
  }

  private async getCachedUser(key: string): Promise<User | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async createUser(
    data: Omit<
      NewUser,
      "id" | "createdAt" | "updatedAt" | "passwordHash" | "isActive"
    > & { password: string }
  ) {
    const passwordHash = await hash(data.password, SALT_ROUNDS);
    const [user] = await this.db
      .insert(users)
      .values({
        ...data,
        passwordHash,
        isActive: true,
      })
      .returning();

    // Cache the new user
    await this.cacheUser(`user:${user.id}`, user);
    await this.cacheUser(`user:email:${user.email}`, user);
    await this.cacheUser(`user:username:${user.username}`, user);

    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const cacheKey = `user:${id}`;
    const cached = await this.getCachedUser(cacheKey);
    if (cached) return cached;

    const [user] = await this.db.select().from(users).where(eq(users.id, id));

    if (user) {
      await this.cacheUser(cacheKey, user);
    }

    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:email:${email}`;
    const cached = await this.getCachedUser(cacheKey);
    if (cached) return cached;

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (user) {
      await this.cacheUser(cacheKey, user);
    }

    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const cacheKey = `user:username:${username}`;
    const cached = await this.getCachedUser(cacheKey);
    if (cached) return cached;

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (user) {
      await this.cacheUser(cacheKey, user);
    }

    return user || null;
  }

  async updateUser(
    id: number,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt" | "passwordHash">>
  ): Promise<User | null> {
    const [user] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (user) {
      // Update cache
      await this.cacheUser(`user:${user.id}`, user);
      await this.cacheUser(`user:email:${user.email}`, user);
      await this.cacheUser(`user:username:${user.username}`, user);
    }

    return user || null;
  }

  async verifyPassword(userId: number, password: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    return compare(password, user.passwordHash);
  }

  async changePassword(userId: number, newPassword: string): Promise<boolean> {
    const passwordHash = await hash(newPassword, SALT_ROUNDS);
    const [user] = await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return !!user;
  }

  async closeConnection() {
    await this.pool.end();
    await this.redis.quit();
  }
}
