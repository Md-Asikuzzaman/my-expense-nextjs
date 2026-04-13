import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";

export default async function Home() {
  await connection();
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
}
