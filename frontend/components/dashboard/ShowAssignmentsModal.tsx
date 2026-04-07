"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import {
  getAssignments,
  type ConferenceAssignmentsResponse,
} from "@/lib/api";

type Props = {
  conferenceId: string;
  onClose: () => void;
};

export default function ShowAssignmentsModal({ conferenceId, onClose }: Props) {
  const [assignmentState, setAssignmentState] =
    useState<ConferenceAssignmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAssignments(conferenceId);
        setAssignmentState(data);
      } catch {
        setError("Unable to load assignments.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [conferenceId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Reviewer Assignments</h3>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading assignments...</p>
        ) : error ? (
          <p className="mt-4 text-sm text-rose-600">{error}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {(assignmentState?.assignments ?? []).map((paper) => (
              <div
                key={paper.paperId}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <div className="text-sm font-semibold text-slate-800">
                  {paper.paperTitle}
                </div>

                {paper.reviewers.length > 0 ? (
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                    {paper.reviewers.map((reviewer, index) => (
                      <li key={`${paper.paperId}-${reviewer.reviewerId}-${index}`}>
                        {reviewer.reviewerEmail}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No reviewers assigned yet.</p>
                )}

                <div className="mt-3 text-sm text-slate-700">
                  Total persons assigned:{" "}
                  <span className="font-medium">{paper.reviewers.length}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
