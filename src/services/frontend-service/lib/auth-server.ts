import { cookies } from "next/headers";
import { auth } from "./auth";

export async function getServerSession() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("better-auth.session");

  const headers = new Headers();
  if (authCookie) {
    headers.set("cookie", `better-auth.session=${authCookie.value}`);
  }

  return auth.api.getSession({ headers });
}
