"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ResultCard from "@/components/ui/ResultCard";
import { useState } from "react";
import { submitPaper } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

export default function SubmitPaperPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({ title: "", abstract: "", track: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitPaper({
        conferenceId: params.id,
        title: form.title,
        abstract: form.abstract,
        authors: [],
        track: form.track
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to submit paper.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <AppShell>
        <h1 className="text-2xl font-semibold tracking-tight">Submit paper</h1>
        <div className="mt-8 flex justify-center">
          <ResultCard
            success
            message="Paper submitted successfully!"
            onFinish={() => router.push("/")}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Submit paper</h1>

      {error ? (
        <div className="mt-8 flex justify-center">
          <ResultCard
            success={false}
            message={error}
            onFinish={() => setError(null)}
          />
        </div>
      ) : (
        <Card className="mt-4 max-w-2xl">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Abstract</span>
              <textarea
                className="min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={form.abstract}
                onChange={(e) => setForm({ ...form, abstract: e.target.value })}
              />
            </label>
            <Input
              label="Track"
              value={form.track}
              onChange={(e) => setForm({ ...form, track: e.target.value })}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting…" : "Submit"}
            </Button>
          </form>
        </Card>
      )}
    </AppShell>
  );
}
