import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BranchTypesClient from "./BranchTypesClient";

export default async function BranchTypesPage() {
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

  if (!["super_admin", "church_admin"].includes(profile?.role ?? "")) {
    redirect("/dashboard");
  }

  const { data: branchTypes } = await supabase
    .from("branch_type")
    .select("*")
    .order("name");

  const { data: usageRows } = await supabase
    .from("sampana")
    .select("branch_type_id")
    .not("branch_type_id", "is", null);

  const usageCounts: Record<string, number> = {};
  usageRows?.forEach((row) => {
    if (!row.branch_type_id) return;
    usageCounts[row.branch_type_id] = (usageCounts[row.branch_type_id] ?? 0) + 1;
  });

  return (
    <BranchTypesClient
      branchTypes={branchTypes ?? []}
      usageCounts={usageCounts}
    />
  );
}
