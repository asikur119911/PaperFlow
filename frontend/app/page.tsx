import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="text-sm text-slate-500">My Conferences</div>
            <div className="mt-2 text-2xl font-semibold">0</div>
          </Card>
          <Card>
            <div className="text-sm text-slate-500">Submitted Papers</div>
            <div className="mt-2 text-2xl font-semibold">0</div>
          </Card>
          <Card>
            <div className="text-sm text-slate-500">Pending Reviews</div>
            <div className="mt-2 text-2xl font-semibold">0</div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

