import { Context, Next } from "hono";
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
