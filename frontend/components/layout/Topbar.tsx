"use client";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur">
      <div className="text-sm font-medium text-slate-700">
        Hello, <span className="font-semibold">Mock User</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="hidden sm:inline">Role: Chair / Reviewer / Author</span>
        <button className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-slate-50">
          Logout
        </button>
      </div>
    </header>
  );
}

