import type { ReactNode } from "react";
import clsx from "clsx";

export default function Card({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

