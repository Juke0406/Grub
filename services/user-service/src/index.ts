import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { DrizzleClient } from "./db/index.js";
import type {
  ChangePasswordBody,
  CreateUserBody,
  HonoContext,
  SafeUser,
  UpdateUserBody,
  VerifyPasswordBody,
} from "./types.js";

const app = new Hono<{ Bindings: {}; Variables: {} }>();
app.use("*", cors());
app.use("*", prettyJSON());

const db = new DrizzleClient();

// Create a new user
app.post("/users", async (c: HonoContext) => {
  const body = await c.req.json<CreateUserBody>();
  const { username, email, password, displayName, avatar, bio, interests } =
    body;

  if (!username || !email || !password || !displayName) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    // Check if username or email already exists
    const existingUser = await Promise.all([
      db.getUserByUsername(username),
      db.getUserByEmail(email),
    ]);

    if (existingUser[0]) {
      return c.json({ error: "Username already taken" }, 400);
    }

    if (existingUser[1]) {
      return c.json({ error: "Email already registered" }, 400);
    }

    const user = await db.createUser({
      username,
      email,
      password,
      displayName,
      avatar,
      bio,
      interests,
    });

    // Don't return the password hash
    const { passwordHash, ...safeUser } = user;
    return c.json(safeUser as SafeUser, 201);
  } catch (error) {
    return c.json({ error: "Failed to create user" }, 500);
  }
});

// Get user by ID
app.get("/users/:id", async (c: HonoContext) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }

  try {
    const user = await db.getUserById(id);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Don't return the password hash
    const { passwordHash, ...safeUser } = user;
    return c.json(safeUser as SafeUser);
  } catch (error) {
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// Update user
app.patch("/users/:id", async (c: HonoContext) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }

  const body = await c.req.json<UpdateUserBody>();
  const { displayName, avatar, bio, interests } = body;

  try {
    const user = await db.updateUser(id, {
      ...(displayName && { displayName }),
      ...(avatar && { avatar }),
      ...(bio && { bio }),
      ...(interests && { interests }),
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Don't return the password hash
    const { passwordHash, ...safeUser } = user;
    return c.json(safeUser as SafeUser);
  } catch (error) {
    return c.json({ error: "Failed to update user" }, 500);
  }
});

// Get user by username
app.get("/users/username/:username", async (c: HonoContext) => {
  const username = c.req.param("username");

  try {
    const user = await db.getUserByUsername(username);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Don't return the password hash
    const { passwordHash, ...safeUser } = user;
    return c.json(safeUser as SafeUser);
  } catch (error) {
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// Get user by email
app.get("/users/email/:email", async (c: HonoContext) => {
  const email = c.req.param("email");

  try {
    const user = await db.getUserByEmail(email);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Don't return the password hash
    const { passwordHash, ...safeUser } = user;
    return c.json(safeUser as SafeUser);
  } catch (error) {
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// Change password
app.post("/users/:id/change-password", async (c: HonoContext) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }

  const body = await c.req.json<ChangePasswordBody>();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    const isValid = await db.verifyPassword(id, currentPassword);
    if (!isValid) {
      return c.json({ error: "Invalid current password" }, 401);
    }

    const success = await db.changePassword(id, newPassword);
    if (!success) {
      return c.json({ error: "Failed to change password" }, 500);
    }

    return c.json({ message: "Password updated successfully" });
  } catch (error) {
    return c.json({ error: "Failed to change password" }, 500);
  }
});

// Verify password
app.post("/users/:id/verify-password", async (c: HonoContext) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid user ID" }, 400);
  }

  const body = await c.req.json<VerifyPasswordBody>();
  const { password } = body;

  if (!password) {
    return c.json({ error: "Missing password" }, 400);
  }

  try {
    const isValid = await db.verifyPassword(id, password);
    return c.json({ valid: isValid });
  } catch (error) {
    return c.json({ error: "Failed to verify password" }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: 4004,
  },
  (info) => {
    console.log(`User service running on http://localhost:${info.port}`);
  }
);
