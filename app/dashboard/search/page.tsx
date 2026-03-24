// app/dashboard/search/page.tsx
import { createClient } from "@/lib/supabase/server";
import SearchClient from "./SearchClient";

export default async function SearchPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, church:churches(*)")
    .eq("id", user!.id)
    .single();

  // Get all sampana (allow everyone to see all sampana for invitation purposes)
  const { data: allSampana } = await supabase
    .from("sampana")
    .select("*, church:churches(*), leader:profiles(*)")
    .order("name");

  // Get my sampana (for leader to exclude self or choose from)
  let mySampanaId: string | null = null;
  if (profile?.role === "leader") {
    const { data: s } = await supabase
      .from("sampana")
      .select("id")
      .eq("leader_id", user!.id);
    // If leader has multiple, we'll pick the first one for now, 
    // but at least it won't crash with .single()
    mySampanaId = s && s.length > 0 ? s[0].id : null;
  } else if (profile?.role === "church_admin" || profile?.role === "super_admin") {
    // For admins, we might want to allow them to pick a sampana later,
    // but for now let's see if they have a 'preferred' or first sampana in their church
    const query = supabase.from("sampana").select("id");
    if (profile.role === "church_admin" && profile.church_id) {
      query.eq("church_id", profile.church_id);
    }
    const { data: s } = await query.limit(1);
    mySampanaId = s && s.length > 0 ? s[0].id : null;
  }

  // Get all events for 2026
  const { data: allEvents } = await supabase
    .from("programme_events")
    .select("*")
    .gte("event_date", `${new Date().getFullYear()}-01-01`)
    .lte("event_date", `${new Date().getFullYear()}-12-31`);

  return (
    <SearchClient
      allSampana={allSampana ?? []}
      allEvents={allEvents ?? []}
      mySampanaId={mySampanaId}
      role={profile?.role ?? "leader"}
    />
  );
}
