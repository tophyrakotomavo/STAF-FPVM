// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, church:churches(*)")
    .eq("id", user!.id)
    .single();

  // Stats based on role
  let stats: Record<string, number> = {};

  if (profile?.role === "super_admin") {
    const [churches, sampana, users, pendingInvites] = await Promise.all([
      supabase.from("churches").select("id", { count: "exact", head: true }),
      supabase.from("sampana").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);
    stats = {
      churches: churches.count ?? 0,
      sampana: sampana.count ?? 0,
      users: users.count ?? 0,
      pendingInvites: pendingInvites.count ?? 0,
    };
  } else if (profile?.role === "church_admin") {
    const [sampana, pending] = await Promise.all([
      supabase
        .from("sampana")
        .select("id", { count: "exact", head: true })
        .eq("church_id", profile.church_id!),
      supabase
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);
    stats = { sampana: sampana.count ?? 0, pendingInvites: pending.count ?? 0 };
  } else {
    // leader: get my sampana
    const { data: mySampana } = await supabase
      .from("sampana")
      .select("id")
      .eq("leader_id", user!.id)
      .single();
    if (mySampana) {
      const [events, sentPending, received] = await Promise.all([
        supabase
          .from("programme_events")
          .select("id", { count: "exact", head: true })
          .eq("sampana_id", mySampana.id),
        supabase
          .from("invitations")
          .select("id", { count: "exact", head: true })
          .eq("inviter_sampana_id", mySampana.id)
          .eq("status", "pending"),
        supabase
          .from("invitations")
          .select("id", { count: "exact", head: true })
          .eq("invitee_sampana_id", mySampana.id)
          .eq("status", "pending"),
      ]);
      stats = {
        events: events.count ?? 0,
        sentPending: sentPending.count ?? 0,
        receivedPending: received.count ?? 0,
      };
    }
  }

  const greeting =
    new Date().getHours() < 12
      ? "Maraina tsara"
      : new Date().getHours() < 18
        ? "Atoandro tsara"
        : "Hariva tsara";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-900 mb-1">
          {greeting}, {profile?.full_name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-brand-400 font-medium">
          {profile?.church?.name ?? "MiM Sampana Manager"} —{" "}
          {new Date().getFullYear()}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {profile?.role === "super_admin" && (
          <>
            <StatCard
              icon="🏛️"
              label="Fiangonana"
              value={stats.churches}
              color="violet"
            />
            <StatCard
              icon="👥"
              label="Sampana"
              value={stats.sampana}
              color="blue"
            />
            <StatCard
              icon="👤"
              label="Mpampiasa"
              value={stats.users}
              color="green"
            />
            <StatCard
              icon="📨"
              label="Fanasana miandry"
              value={stats.pendingInvites}
              color="amber"
              urgent={stats.pendingInvites > 0}
            />
          </>
        )}
        {profile?.role === "church_admin" && (
          <>
            <StatCard
              icon="👥"
              label="Sampana"
              value={stats.sampana}
              color="violet"
            />
            <StatCard
              icon="📨"
              label="Fanasana miandry"
              value={stats.pendingInvites}
              color="amber"
              urgent={stats.pendingInvites > 0}
            />
          </>
        )}
        {profile?.role === "leader" && (
          <>
            <StatCard
              icon="📅"
              label={`Fotoana ${new Date().getFullYear()}`}
              value={stats.events}
              color="violet"
            />
            <StatCard
              icon="📤"
              label="Fanasana nalefa"
              value={stats.sentPending}
              color="blue"
            />
            <StatCard
              icon="📥"
              label="Fanasana tonga"
              value={stats.receivedPending}
              color="amber"
              urgent={(stats.receivedPending ?? 0) > 0}
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm">
        <h2 className="font-display font-bold text-brand-800 text-lg mb-4">
          Fanomezan-dàlana haingana
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {profile?.role === "leader" && (
            <>
              <QuickLink
                href="/dashboard/programme"
                icon="📅"
                label="Hanampy fotoana"
              />
              <QuickLink
                href="/dashboard/search"
                icon="🔎"
                label="Mitady sampana dispo"
              />
              <QuickLink
                href="/dashboard/invitations"
                icon="📨"
                label="Hijery fanasana"
              />
            </>
          )}
          {profile?.role === "church_admin" && (
            <>
              <QuickLink
                href="/dashboard/sampana"
                icon="👥"
                label="Hitantana sampana"
              />
              <QuickLink
                href="/dashboard/branch-types"
                icon="🏷️"
                label="Karazana sampana"
              />
              <QuickLink
                href="/dashboard/users"
                icon="👤"
                label="Hitantana mpampiasa"
              />
              <QuickLink
                href="/dashboard/search"
                icon="🔎"
                label="Mitady sampana dispo"
              />
            </>
          )}
          {profile?.role === "super_admin" && (
            <>
              <QuickLink
                href="/dashboard/churches"
                icon="🏛️"
                label="Fiangonana"
              />
              <QuickLink href="/dashboard/sampana" icon="👥" label="Sampana" />
              <QuickLink
                href="/dashboard/branch-types"
                icon="🏷️"
                label="Karazana"
              />
              <QuickLink href="/dashboard/users" icon="👤" label="Mpampiasa" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  urgent,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  urgent?: boolean;
}) {
  const colors: Record<string, string> = {
    violet: "from-violet-50 to-purple-50 border-violet-200 text-violet-700",
    blue: "from-blue-50 to-cyan-50 border-blue-200 text-blue-700",
    green: "from-emerald-50 to-green-50 border-emerald-200 text-emerald-700",
    amber: "from-amber-50 to-yellow-50 border-amber-200 text-amber-700",
  };
  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 relative overflow-hidden
      ${urgent ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}
    >
      {urgent && (
        <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse-soft" />
      )}
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-bold font-display">{value}</div>
      <div className="text-sm font-medium opacity-80 mt-0.5">{label}</div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-100
      hover:bg-brand-50 hover:border-brand-200 transition-all duration-150 group"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-semibold text-brand-700 group-hover:text-brand-900">
        {label}
      </span>
    </a>
  );
}
