"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  getReviewerDashboard,
  type ReviewerDashboardPaper,
} from "@/lib/api";

type Props = {
  userId: string;
};

export default function ReviewerDashboard({ userId }: Props) {
  const [papers, setPapers] = useState<ReviewerDashboardPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setPapers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    getReviewerDashboard(userId)
      .then((res) => setPapers(res.papers))
      .catch(() => setError("Unable to load reviewer dashboard."))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conferences You Review</h2>
        <Link href="/reviewer">
          <Button variant="secondary">All Assignments</Button>
        </Link>
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-slate-500">Loading…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-slate-500">{error}</p>
      ) : papers.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No review assignments yet.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Conference</th>
                <th className="px-3 py-2 font-medium">Paper Title</th>
                <th className="px-3 py-2 font-medium">Paper ID</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((paper) => (
                <tr key={`${paper.conferenceId}-${paper.paperId}`} className="border-t border-slate-100">
                  <td className="px-3 py-3">{paper.conferenceTitle}</td>
                  <td className="px-3 py-3">{paper.paperTitle}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{paper.paperId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
