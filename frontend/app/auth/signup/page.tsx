"use client";

import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useState } from "react";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    affiliation: "",
    country: ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await registerUser({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        affiliation: form.affiliation,
        country: form.country
      });
      setMessage(`${res.message} Redirecting to login...`);
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: any) {
      setMessage(err.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <h1 className="text-xl font-semibold tracking-tight">Sign up</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a mock account for the demo.
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
            <Input
              label="Affiliation"
              value={form.affiliation}
              onChange={(e) =>
                setForm({ ...form, affiliation: e.target.value })
              }
            />
            <Input
              label="Country"
              value={form.country}
              onChange={(e) =>
                setForm({ ...form, country: e.target.value })
              }
            />
            {message && (
              <p className="text-xs text-slate-600">
                {message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

