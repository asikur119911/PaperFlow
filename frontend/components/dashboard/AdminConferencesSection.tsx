"use client";

import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { inviteReviewers, type ConferenceSummary } from "@/lib/api";
import AssignReviewersModal from "@/components/dashboard/AssignReviewersModal";
import ShowAssignmentsModal from "@/components/dashboard/ShowAssignmentsModal";

type Props = {
  confs: ConferenceSummary[];
  loading: boolean;
};

export default function AdminConferencesSection({ confs, loading }: Props) {
  const [expandedConferenceId, setExpandedConferenceId] = useState<string | null>(
    null
  );
  const [inviteModalConferenceId, setInviteModalConferenceId] = useState<
    string | null
  >(null);
  const [inviteMode, setInviteMode] = useState<"select" | "manual" | "auto">(
    "select"
  );
  const [manualEmail, setManualEmail] = useState("");
  const [manualInviteSent, setManualInviteSent] = useState(false);
  const [autoInviteFileName, setAutoInviteFileName] = useState("");
  const [autoInviteSuccess, setAutoInviteSuccess] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [assignModalConferenceId, setAssignModalConferenceId] = useState<
    string | null
  >(null);
  const [showAssignmentsConferenceId, setShowAssignmentsConferenceId] = useState<
    string | null
  >(null);

  const closeInviteModal = () => {
    setInviteModalConferenceId(null);
    setInviteMode("select");
    setManualEmail("");
    setManualInviteSent(false);
    setAutoInviteFileName("");
    setAutoInviteSuccess(false);
    setInviteLoading(false);
    setInviteError("");
  };

  const openInviteModal = (conferenceId: string) => {
    setInviteModalConferenceId(conferenceId);
    setInviteMode("select");
    setManualEmail("");
    setManualInviteSent(false);
    setAutoInviteFileName("");
    setAutoInviteSuccess(false);
    setInviteLoading(false);
    setInviteError("");
  };

  const handleManualInviteSend = async () => {
    const email = manualEmail.trim();
    if (!email || !inviteModalConferenceId) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      await inviteReviewers(inviteModalConferenceId, { emails: [email] });
      setManualInviteSent(true);
      setManualEmail("");
      setTimeout(() => {
        setManualInviteSent(false);
      }, 2000);
    } catch {
      setInviteError("Unable to send invitation right now.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleAutoInviteUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !inviteModalConferenceId) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      const text = await file.text();
      const emails = text
        .split(/\r?\n|,|;/)
        .map((item) => item.trim())
        .filter(Boolean);
      if (emails.length === 0) {
        setInviteError("No valid emails found in CSV");
        return;
      }
      await inviteReviewers(inviteModalConferenceId, { emails });
      setAutoInviteFileName(file.name);
      setAutoInviteSuccess(true);
      setTimeout(() => {
        closeInviteModal();
      }, 1200);
    } catch {
      setInviteError("Unable to upload invitations right now.");
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conferences You Administer</h2>
          <Link href="/conferences/new">
            <Button>New Conference</Button>
          </Link>
        </div>
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading…</p>
        ) : confs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No conferences yet.</p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {confs.map((conf, index) => (
              <Card
                key={conf.id}
                className={`cursor-pointer transition-all duration-200 ${
                  expandedConferenceId === conf.id
                    ? "scale-[1.02] border-slate-300 shadow-md"
                    : "hover:border-slate-300 hover:shadow"
                }`}
              >
                <button
                  className="block w-full text-left"
                  onClick={() =>
                    setExpandedConferenceId((prev) => (prev === conf.id ? null : conf.id))
                  }
                >
                  <div className="mt-1 font-semibold">{conf.title}</div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    {conf.researchArea}
                  </div>
                </button>
                {expandedConferenceId === conf.id && (
                  <div className="mt-4 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="text-sm text-slate-700">
                      Total Submissions:{" "}
                      <span className="font-medium">{42 + index * 3}</span>
                    </div>
                    <div className="text-sm text-slate-700">
                      Deadline:{" "}
                      <span className="font-medium">
                        {new Date(
                          Date.now() + (index + 7) * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      className="mt-1 w-full"
                      onClick={(event) => {
                        event.stopPropagation();
                        openInviteModal(conf.id);
                      }}
                    >
                      Send Invitation to Reviewers
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          setAssignModalConferenceId(conf.id);
                        }}
                      >
                        Assign Reviewers
                      </Button>
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          setShowAssignmentsConferenceId(conf.id);
                        }}
                      >
                        Show Assignments
                      </Button>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      // call listConferenceAllPapers as list or something
                    }}
                  >
                    View Submissions
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {inviteModalConferenceId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4"
          onClick={closeInviteModal}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Send Invitation</h3>
              <Button variant="ghost" onClick={closeInviteModal}>
                Close
              </Button>
            </div>

            {inviteMode === "select" && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">
                  Choose how you want to invite reviewers.
                </p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="secondary"
                        disabled={inviteLoading}
                    onClick={() => setInviteMode("manual")}
                  >
                    Invite Manually
                  </Button>
                      <Button
                        className="flex-1"
                        disabled={inviteLoading}
                        onClick={() => setInviteMode("auto")}
                      >
                    Invite Automatically
                  </Button>
                </div>
              </div>
            )}

            {inviteMode === "manual" && (
              <div className="mt-4 space-y-3">
                <label className="block text-sm text-slate-700">Reviewer Email</label>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(event) => setManualEmail(event.target.value)}
                  placeholder="reviewer@example.com"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleManualInviteSend} disabled={inviteLoading}>
                    {inviteLoading ? "Sending..." : "Send Invite"}
                  </Button>
                  {manualInviteSent && (
                    <span className="text-base font-semibold text-emerald-600">✓</span>
                  )}
                </div>
              </div>
            )}

            {inviteMode === "auto" && (
              <div className="mt-4 space-y-3">
                {!autoInviteSuccess ? (
                  <>
                    <label className="block text-sm text-slate-700">
                      Upload reviewer CSV
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      disabled={inviteLoading}
                      onChange={handleAutoInviteUpload}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
                    />
                  </>
                ) : (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-5 text-center">
                    <div className="text-3xl text-emerald-600">✓</div>
                    <div className="mt-2 text-base font-medium text-emerald-700">
                      All invitations sent
                    </div>
                    {autoInviteFileName && (
                      <div className="mt-1 text-xs text-emerald-700/80">
                        {autoInviteFileName} uploaded successfully
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {inviteError && (
              <p className="mt-3 text-sm text-rose-600">{inviteError}</p>
            )}
          </div>
        </div>
      )}

      {assignModalConferenceId && (
        <AssignReviewersModal
          conferenceId={assignModalConferenceId}
          onClose={() => setAssignModalConferenceId(null)}
        />
      )}

      {showAssignmentsConferenceId && (
        <ShowAssignmentsModal
          conferenceId={showAssignmentsConferenceId}
          onClose={() => setShowAssignmentsConferenceId(null)}
        />
      )}
    </>
  );
}
