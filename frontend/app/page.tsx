"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listConferences,
  listPapers,
  getPendingReviews,
  type ConferenceSummary,
  type PaperSummary,
} from "@/lib/api";
import { useRouter } from "next/navigation";

function PublicLanding() {
  const [confs, setConfs] = useState<ConferenceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listConferences({ page: 1, limit: 20 })
      .then((res) => setConfs(res.data))
      .catch(() => setConfs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div className="text-xl font-semibold tracking-tight">Paperflow CMS</div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="secondary">Log in</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Sign up</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Upcoming Conferences
        </h1>
        <p className="mt-2 text-slate-500">
          Browse open conferences. Log in to submit papers, review assignments,
          or manage your conference.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-slate-500">Loading...</p>
        ) : confs.length === 0 ? (
          <p className="mt-8 text-sm text-slate-500">
            No conferences available right now.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {confs.map((conf) => (
              <Card key={conf.id}>
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  {conf.id}
                </div>
                <div className="mt-1 text-lg font-semibold">{conf.title}</div>
                <p className="mt-3 text-xs text-slate-500">
                  Log in to submit a paper or manage this conference.
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProfileDashboard({email,roles}: {email: string;roles: string[];}) {  // parameters wont come 
  /*
  and why that is ? some one can both be an admin of a conference and author in another conference 
  we will show two divs , one where his created conferences will be shown(the lower div) , the upper div will show his participated conferences 
  */
  const router = useRouter();
  const [confs, setConfs] = useState<ConferenceSummary[]>([]);
  const [papers, setPapers] = useState<PaperSummary[]>([]);
  const [assignments, setAssignments] = useState<
    {
      paperTitle: string;
      deadline: string;
      status: string;
      assignmentId: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const isChair = roles.includes("CHAIR");
  const isReviewer = roles.includes("REVIEWER");
  const username:string = email.split("@")[0];
  useEffect(() => {
    const userId = localStorage.getItem("userId") ?? "";
    const promises: Promise<void>[] = [];

    promises.push(
      listConferences({ page: 1, limit: 50 })
        .then((res) => setConfs(res.data))
        .catch(() => setConfs([]))
    );

    promises.push(
      listPapers()
        .then((res) => setPapers(res.data))
        .catch(() => setPapers([]))
    );

    if (userId) {
      promises.push(
        getPendingReviews(userId)
          .then((res) => setAssignments(res.assignments))
          .catch(() => setAssignments([]))
      );
    }

    Promise.all(promises).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-10">
        {/* Profile header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back,{" "}
            <span className="text-slate-600">{username || "User"}</span>
          </h1>
          {/* <p className="mt-1 text-sm text-slate-500">
            Role:{" "}
            <span className="font-medium text-slate-700">
              {roles.join(", ") || "AUTHOR"}
            </span>
          </p> */}
        </div>

        {/* Conferences as Admin – CHAIR only */}
        {isChair && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Conferences You Administer
              </h2>
              <Link href="/conferences/new">
                <Button>New Conference</Button>
              </Link>
            </div>
            {loading ? (
              <p className="mt-3 text-sm text-slate-500">Loading…</p>
            ) : confs.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No conferences yet.
              </p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {confs.map((conf) => (
                  <Card key={conf.id}>
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      {conf.id}
                    </div>
                    <div className="mt-1 font-semibold">{conf.title}</div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          router.push(`/conferences/${conf.id}/submit`)
                        }
                      >
                        View Submissions
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Conferences as Reviewer – REVIEWER only */}
        {isReviewer && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Conferences You Review
              </h2>
              <Link href="/reviewer">
                <Button variant="secondary">All Assignments</Button>
              </Link>
            </div>
            {loading ? (
              <p className="mt-3 text-sm text-slate-500">Loading…</p>
            ) : assignments.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No review assignments yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {assignments.map((a) => (
                  <Card
                    key={a.assignmentId}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium">{a.paperTitle}</div>
                      <div className="text-xs text-slate-500">
                        Deadline: {a.deadline} · Status: {a.status}
                      </div>
                    </div>
                    <Link href={`/reviewer/assignments/${a.assignmentId}`}>
                      <Button variant="secondary">Review</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Conferences as Author / Publisher – always shown */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Conferences Where You Published
            </h2>
            <Link href="/conferences">
              <Button variant="secondary">Browse Conferences</Button>
            </Link>
          </div>
          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Loading…</p>
          ) : papers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No submissions yet.{" "}
              <Link
                href="/conferences"
                className="font-medium text-slate-700 underline underline-offset-2"
              >
                Browse conferences
              </Link>{" "}
              to submit a paper.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {papers.map((p) => (
                <Card key={p.id}>
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    Conference: {p.title}
                  </div>
                  <div className="mt-1 font-semibold">{p.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Status: {p.status}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedEmail = localStorage.getItem("email") ?? "";
    let storedRoles: string[] = [];
    try {
      storedRoles = JSON.parse(localStorage.getItem("roles") ?? "[]");
    } catch {
      storedRoles = [];
    }
    setEmail(storedEmail);
    setRoles(storedRoles);
    setIsLoggedIn(!!token);
  }, []);

  // Wait for localStorage hydration before rendering
  if (isLoggedIn === null) return null;

  if (!isLoggedIn) return <PublicLanding />;

  return <ProfileDashboard email={email} roles={roles} />;
}
