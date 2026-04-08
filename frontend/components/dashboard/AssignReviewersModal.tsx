"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import {
  assignReviewers,
  getAssignments,
  manualAssignReviewer,
  type ConferenceAssignmentsResponse,
  type PaperAssignmentSummary,
} from "@/lib/api";

type Props = {
  conferenceId: string;
  onClose: () => void;
};

type AssignMode = "select" | "manual" | "auto";

export default function AssignReviewersModal({ conferenceId, onClose }: Props) {
  const [assignMode, setAssignMode] = useState<AssignMode>("select");
  const [assignmentState, setAssignmentState] = useState<ConferenceAssignmentsResponse | null>(
    null
  );
  const [paperEmails, setPaperEmails] = useState<Record<string, string>>({});
  const [rowSuccess, setRowSuccess] = useState<Record<string, boolean>>({});
  const [autoAssigned, setAutoAssigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshAssignments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAssignments(conferenceId);
      setAssignmentState(data);
    } catch {
      setError("Unable to load assignments.");
      setAssignmentState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAssignments();
  }, [conferenceId]);

  const papers: PaperAssignmentSummary[] = assignmentState?.assignments ?? [];
  const totalInvitationsAccepted = useMemo(() => {
    const unique = new Set<string>();
    papers.forEach((paper) => {
      paper.reviewers.forEach((reviewer) => unique.add(reviewer.reviewerId));
    });
    return unique.size;
  }, [papers]);

  const hasManualData = useMemo(
    () => papers.length > 0,
    [papers.length]
  );

  const handleAssignManually = async (paperId: string) => {
    const email = (paperEmails[paperId] ?? "").trim();
    if (!email) return;
    setError("");
    try {
      await manualAssignReviewer(paperId, email);
      setPaperEmails((prev) => ({ ...prev, [paperId]: "" }));
      setRowSuccess((prev) => ({ ...prev, [paperId]: true }));
      setTimeout(() => setRowSuccess((prev) => ({ ...prev, [paperId]: false })), 2000);
      await refreshAssignments();
    } catch {
      setError("Unable to assign reviewer.");
    }
  };

  const handleAutoAssign = async () => {
    setAssignLoading(true);
    setError("");
    try {
      await assignReviewers(conferenceId);
      await refreshAssignments();
      setAutoAssigned(true);
    } catch {
      setError("Unable to assign reviewers.");
      setAutoAssigned(false);
    } finally {
      setAssignLoading(false);
    }
  };

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
          <h3 className="text-base font-semibold">Assign Reviewers</h3>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-3 text-sm text-slate-700">
          Total Invitations Accepted:{" "}
          <span className="font-medium">{totalInvitationsAccepted}</span>
        </div>
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

        {assignMode === "select" && (
          <div className="mt-4 flex gap-2">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => setAssignMode("manual")}
            >
              Assign Manually
            </Button>
            <Button className="flex-1" onClick={() => setAssignMode("auto")}>
              Assign Automatically
            </Button>
          </div>
        )}

        {assignMode === "manual" && (
          <div className="mt-4">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">Paper Title</th>
                    <th className="px-3 py-2 font-medium">Reviewer Email</th>
                    <th className="px-3 py-2 font-medium">Action</th>
                    <th className="px-3 py-2 font-medium">Assignments</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-3 py-4 text-slate-500" colSpan={4}>
                        Loading assignments...
                      </td>
                    </tr>
                  ) : hasManualData ? (
                    papers.map((paper) => (
                      <tr key={paper.paperId} className="border-t border-slate-100">
                        <td className="px-3 py-3 text-slate-700">{paper.paperTitle}</td>
                        <td className="px-3 py-3">
                          <input
                            type="email"
                            value={paperEmails[paper.paperId] ?? ""}
                            onChange={(event) =>
                              setPaperEmails((prev) => ({
                                ...prev,
                                [paper.paperId]: event.target.value,
                              }))
                            }
                            placeholder="reviewer@example.com"
                            className="w-full min-w-48 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Button onClick={() => handleAssignManually(paper.paperId)}>
                              Assign
                            </Button>
                            {rowSuccess[paper.paperId] && (
                              <span className="text-base font-semibold text-emerald-600">
                                ✓
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-700">
                          Total Assigned:{" "}
                          <span className="font-medium">{paper.reviewers.length}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-4 text-slate-500" colSpan={4}>
                        No papers available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {assignMode === "auto" && (
          <div className="mt-4 space-y-3">
            {!autoAssigned ? (
              <Button onClick={handleAutoAssign} disabled={assignLoading}>
                {assignLoading ? "Assigning..." : "Run CSP Assignment"}
              </Button>
            ) : (
              <div className="inline-flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span className="text-3xl text-emerald-600">✓</span>
                <span className="text-base font-medium text-emerald-700">
                  Assigned
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
