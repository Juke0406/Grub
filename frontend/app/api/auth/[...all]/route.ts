import {getUser, auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";



export const { POST } = toNextJsHandler(auth);

export async function GET(req: Request) {
    const user = await getUser(req);
  
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }