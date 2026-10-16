import Link from "next/link";

const navLinks = [{ href: "/", label: "Torneos" }];

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span aria-hidden className="flex h-6 overflow-hidden rounded">
            <span className="bg-hong w-2" />
            <span className="bg-chung w-2" />
          </span>
          Torneos de Taekwondo
        </Link>
        <nav aria-label="Principal">
          <ul className="flex gap-4 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
