"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { submitReview } from "@/lib/api";
import { useParams } from "next/navigation";

export default function ReviewSubmissionPage() {
  const params = useParams<{ assignmentId: string }>();
  const assignmentId = params.assignmentId;

  const [form, setForm] = useState({
    score: 8,
    confidence: "HIGH",
    recommendation: "ACCEPT" as "ACCEPT" | "REJECT" | "REVISE",
    comments: ""
  });
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await submitReview({
        assignmentId,
        score: form.score,
        confidence: form.confidence,
        recommendation: form.recommendation,
        comments: form.comments
      });
      setMessage(`Review submitted: ${res.reviewId}`);
    } catch (err: any) {
      setMessage(err.message ?? "Failed to submit review");
    }
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">
        Submit review
      </h1>
      <Card className="mt-4 max-w-2xl space-y-3">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            label="Score (1–10)"
            type="number"
            min={1}
            max={10}
            value={form.score}
            onChange={(e) =>
              setForm({ ...form, score: Number(e.target.value) })
            }
          />
          <Input
            label="Confidence"
            value={form.confidence}
            onChange={(e) =>
              setForm({ ...form, confidence: e.target.value })
            }
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Recommendation</span>
            <select
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
              value={form.recommendation}
              onChange={(e) =>
                setForm({
                  ...form,
                  recommendation: e.target.value as "ACCEPT" | "REJECT" | "REVISE"
                })
              }
            >
              <option value="ACCEPT">Accept</option>
              <option value="REJECT">Reject</option>
              <option value="REVISE">Revise</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Comments</span>
            <textarea
              className="min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
              value={form.comments}
              onChange={(e) =>
                setForm({ ...form, comments: e.target.value })
              }
            />
          </label>
          {message && (
            <p className="text-xs text-slate-600">
              {message}
            </p>
          )}
          <Button type="submit">Submit review</Button>
        </form>
      </Card>
    </AppShell>
  );
}

