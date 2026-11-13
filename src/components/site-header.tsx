import Link from "next/link";
import { Suspense } from "react";

import { HeaderFrame } from "./header-frame";

const headerClass = "border-b border-zinc-200 dark:border-zinc-800";

export function SiteHeader() {
  const content = (
    <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span aria-hidden className="flex h-6 overflow-hidden rounded">
          <span className="bg-hong w-2" />
          <span className="bg-chung w-2" />
        </span>
        Torneos de Taekwondo
      </Link>
    </div>
  );

  return (
    // The route is request data under Cache Components; the fallback keeps the header in the shell.
    <Suspense fallback={<header className={headerClass}>{content}</header>}>
      <HeaderFrame className={headerClass}>{content}</HeaderFrame>
    </Suspense>
  );
}
