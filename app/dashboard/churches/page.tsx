// app/dashboard/churches/page.tsx
import { createClient } from "@/lib/supabase/server";
import ChurchesClient from "./ChurchesClient";
import { redirect } from "next/navigation";

export default async function ChurchesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "super_admin") redirect("/dashboard");

  const { data: churches } = await supabase
    .from("churches")
    .select("*")
    .order("name");

  const { data: sampanaCounts } = await supabase
    .from("sampana")
    .select("church_id");

  const countMap: Record<string, number> = {};
  sampanaCounts?.forEach((s) => {
    countMap[s.church_id] = (countMap[s.church_id] ?? 0) + 1;
  });

  return <ChurchesClient churches={churches ?? []} sampanaCounts={countMap} />;
}
