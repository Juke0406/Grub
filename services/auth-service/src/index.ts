import { serve } from "@hono/node-server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { sign, verify } from "jsonwebtoken";
import { db } from "./db/index.js";
import { users } from "./db/schema.js";
import { corsMiddleware } from "./middleware.js";
import { Env } from "./types.js";

declare module "hono" {
  interface ContextVariableMap {
    userId: string;
  }
}

// Create app instance with environment type
const app = new Hono<Env>();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// Apply CORS middleware with proper typing
app.use("*", corsMiddleware);

// JWT middleware
app.use("/api/protected/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verify(token, JWT_SECRET) as { userId: string };
    c.set("userId", payload.userId);
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
});

// Health check
app.get("/", (c) => c.text("Auth Service Running"));

// Register endpoint
app.post("/api/auth/register", async (c) => {
  try {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();

    // Validate input
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();

    if (existingUser.length > 0) {
      return c.json({ error: "User already exists" }, 409);
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
      })
      .returning();

    // Generate JWT
    const token = sign({ userId: user.id }, JWT_SECRET);

    return c.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Login endpoint
app.post("/api/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();

    // Validate input
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Generate JWT
    const token = sign({ userId: user.id }, JWT_SECRET);

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Protected route example
app.get("/api/protected/user", async (c) => {
  try {
    const userId = c.get("userId");
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Protected route error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

const port = parseInt(process.env.PORT || "4001", 10);
console.log(`Auth service listening on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
