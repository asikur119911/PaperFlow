"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listConferences, type ConferenceSummary } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ConferencesPage() {
  const router = useRouter();
  const [confs, setConfs] = useState<ConferenceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listConferences({ status: "OPEN", page: 1, limit: 20 })
      .then((res) => setConfs(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Conferences
        </h1>
        {/* <Link href="/conferences/new">
          <Button>New conference</Button>
        </Link> */}
      </div>
      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Loading...</p>
      ) : confs.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Sorry, no new conference at this moment.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {confs.map((conf) => (
            <Card key={conf.id}>
              {/* <div className="text-xs uppercase tracking-wide text-slate-500">
                {conf.id}
              </div> */}
              <div className="mt-1 text-lg font-semibold">{conf.title}</div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/conferences/${conf.id}/submit`)}
                >
                  Submit Paper
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

