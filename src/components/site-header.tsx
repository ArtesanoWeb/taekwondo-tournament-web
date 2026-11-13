import Link from "next/link";
import { Suspense } from "react";

import { headerClass, headerRowClass } from "./header-classes";
import { HeaderFrame } from "./header-frame";

export function SiteHeader() {
  // Mobile first: larger on phones, the usual size from `sm` up.
  const brand = (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-xl font-semibold sm:gap-2 sm:text-base"
    >
      <span aria-hidden className="flex h-8 overflow-hidden rounded sm:h-6">
        <span className="bg-hong w-2.5 sm:w-2" />
        <span className="bg-chung w-2.5 sm:w-2" />
      </span>
      Torneos de Taekwondo
    </Link>
  );

  return (
    // The route is request data under Cache Components; the fallback keeps the header in the shell.
    <Suspense
      fallback={
        <header className={headerClass}>
          <div className={headerRowClass}>{brand}</div>
        </header>
      }
    >
      <HeaderFrame brand={brand} />
    </Suspense>
  );
}
