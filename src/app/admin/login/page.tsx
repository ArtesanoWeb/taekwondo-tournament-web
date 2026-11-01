import type { Metadata } from "next";
import { Suspense } from "react";

import { safeNextPath } from "@/lib/auth";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false },
};

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Administración
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Inicia sesión para gestionar los torneos.
        </p>
      </div>
      {/* The query string is only known per request, so the form streams in behind a boundary. */}
      <Suspense>
        <LoginFormWithParams searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function LoginFormWithParams({
  searchParams,
}: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { next, vencida } = await searchParams;
  const nextPath = typeof next === "string" ? safeNextPath(next) : undefined;
  return <LoginForm next={nextPath} expired={vencida === "1"} />;
}
