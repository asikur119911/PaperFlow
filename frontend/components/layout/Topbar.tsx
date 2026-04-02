"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    setEmail(localStorage.getItem("email") ?? "");
    try {
      setRoles(JSON.parse(localStorage.getItem("roles") ?? "[]"));
    } catch {
      setRoles([]);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("roles");
    router.push("/auth/login");
  }

  return (
    <header className="flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur">
      <div className="text-sm font-medium text-slate-700">
        Hello, <span className="font-semibold">{email || "Guest"}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        {roles.length > 0 && (
          <span className="hidden sm:inline">
            Role: {roles.join(", ")}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

