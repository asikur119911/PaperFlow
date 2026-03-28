"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { getPendingReviews, type PendingReviewsResponse } from "@/lib/api";

export default function ReviewerDashboardPage() {
  const reviewerId = "mock-reviewer-id";
  const [data, setData] = useState<PendingReviewsResponse | null>(null);

  useEffect(() => {
    getPendingReviews(reviewerId).then(setData).catch(console.error);
  }, [reviewerId]);

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">
        Reviewer dashboard
      </h1>
      <div className="mt-4 space-y-3">
        {data?.assignments.map((a) => (
          <Card key={a.assignmentId} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{a.paperTitle}</div>
              <div className="text-xs text-slate-500">
                Deadline: {a.deadline} · Status: {a.status}
              </div>
            </div>
            <Link href={`/reviewer/assignments/${a.assignmentId}`}>
              <Button variant="secondary">
                Review
              </Button>
            </Link>
          </Card>
        )) || <p className="text-sm text-slate-500">No assignments.</p>}
      </div>
    </AppShell>
  );
}

