import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getSession } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { LoginForm } from "@/components/forms/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  await connection();
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.20),transparent_35%)] p-4">
      <Card className="w-full max-w-md border border-border/50 bg-card/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{APP_NAME}</CardTitle>
          <CardDescription>
            Sign in with your environment credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
