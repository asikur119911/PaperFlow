"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { createConference } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewConferencePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    acronym: "",
    researchArea: "",
    startDate: "",
    venue: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await createConference({
        title: form.title,
        acronym: form.acronym,
        researchArea: form.researchArea,
        startDate: form.startDate,
        venue: form.venue
      });
      setMessage(`Created conference ${res.conferenceId}`);
      setTimeout(() => router.push("/conferences"), 1200);
    } catch (err: any) {
      setMessage(err.message ?? "Failed to create conference");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">
        Create conference
      </h1>
      <Card className="mt-4 max-w-xl">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            label="Acronym"
            value={form.acronym}
            onChange={(e) => setForm({ ...form, acronym: e.target.value })}
          />
          <Input
            label="Research area"
            value={form.researchArea}
            onChange={(e) =>
              setForm({ ...form, researchArea: e.target.value })
            }
          />
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm({ ...form, startDate: e.target.value })
            }
          />
          <Input
            label="Venue"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />
          {message && (
            <p className="text-xs text-slate-600">{message}</p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}

