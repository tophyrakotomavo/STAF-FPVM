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

  // Get all sampana (filtered by church for church_admin / leader)
  let sampanaQuery = supabase
    .from("sampana")
    .select("*, church:churches(*), leader:profiles(*)");
  if (profile?.role !== "super_admin" && profile?.church_id) {
    sampanaQuery = sampanaQuery.eq("church_id", profile.church_id);
  }
  const { data: allSampana } = await sampanaQuery.order("name");

  // Get my sampana (for leader to exclude self)
  let mySampanaId: string | null = null;
  if (profile?.role === "leader") {
    const { data: s } = await supabase
      .from("sampana")
      .select("id")
      .eq("leader_id", user!.id)
      .single();
    mySampanaId = s?.id ?? null;
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
