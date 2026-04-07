"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { updateProfile } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [country, setCountry] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(localStorage.getItem("fullName") ?? "");
    setEmail(localStorage.getItem("email") ?? "");
    setAffiliation(localStorage.getItem("affiliation") ?? "");
    setCountry(localStorage.getItem("country") ?? "");
    try {
      setRoles(JSON.parse(localStorage.getItem("roles") ?? "[]"));
    } catch {
      setRoles([]);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const userId = localStorage.getItem("userId") ?? "";
      await updateProfile(userId, { fullName, affiliation, country });
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("affiliation", affiliation);
      localStorage.setItem("country", country);
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and update your profile information.
          </p>
        </div>

        {/* Info Card */}
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Account Info
          </h2>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-24 text-slate-500">Email</span>
              <span className="font-medium text-slate-700">{email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-24 text-slate-500">Role</span>
              <span className="font-medium text-slate-700">
                {roles.join(", ") || "AUTHOR"}
              </span>
            </div>
          </div>
        </Card>

        {/* Edit Card */}
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Edit Profile
          </h2>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Affiliation"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
            />
            <Input
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />

            {message && (
              <p className="text-xs text-green-600">{message}</p>
            )}
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
