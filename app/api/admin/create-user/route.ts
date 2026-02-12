// app/api/admin/create-user/route.ts
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Verify caller is admin
  const serverClient = createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: callerProfile } = await serverClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!["super_admin", "church_admin"].includes(callerProfile?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let { email, password, full_name, role, church_id } = await req.json();

  // Validate
  if (!email || !password || !full_name || !role) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Security fix: Enforce church_id for church_admin
  if (callerProfile.role === "church_admin") {
    if (role === "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: cannot create super_admin" },
        { status: 403 },
      );
    }
    // Force the new user to be in the same church as the admin
    church_id = callerProfile.church_id;
  }

  // Use service role to create auth user
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: newUser, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !newUser.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Failed to create user" },
      { status: 500 },
    );
  }

  // Insert profile
  const { error: profileError } = await adminClient.from("profiles").insert({
    id: newUser.user.id,
    email,
    full_name,
    role,
    church_id: church_id || null,
  });

  if (profileError) {
    // Rollback auth user
    await adminClient.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId: newUser.user.id });
}
