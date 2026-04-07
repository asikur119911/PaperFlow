"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/conferences", label: "Conferences" },
  { href: "/conferences/new", label: "Create Conference" },
  { href: "/reviewer", label: "Reviewer Dashboard" },
  { href: "/profile", label: "My Profile" }

];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-white/80 backdrop-blur sm:flex">
      <div className="px-4 py-4 text-xl font-semibold tracking-tight">
        Paperflow CMS
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

