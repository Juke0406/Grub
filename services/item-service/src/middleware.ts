import { Context, Next } from "hono";
import { verify } from "jsonwebtoken";
import { Env } from "./types.js";

export const corsMiddleware = async (c: Context<Env>, next: Next) => {
  // Basic CORS settings
  c.header("Access-Control-Allow-Origin", "*");
  c.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  c.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Handle preflight requests
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: c.res.headers,
    });
  }

  await next();
};

export const authMiddleware = async (c: Context<Env>, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_here"
    ) as {
      userId: string;
    };
    c.set("userId", payload.userId);
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
};
