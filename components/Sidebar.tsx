// components/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import Image from "next/image";
import clsx from "clsx";

interface SidebarProps {
  profile: Profile | null;
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const role = profile?.role;

  const links = [
    {
      href: "/dashboard",
      label: "🏠 Fandraisana",
      roles: ["super_admin", "church_admin", "leader"],
    },
    {
      href: "/dashboard/churches",
      label: "🏛️ Fiangonana",
      roles: ["super_admin"],
    },
    {
      href: "/dashboard/sampana",
      label: "👥 Sampana",
      roles: ["super_admin", "church_admin"],
    },
    {
      href: "/dashboard/users",
      label: "👤 Mpampiasa",
      roles: ["super_admin", "church_admin"],
    },
    { href: "/dashboard/programme", label: "📅 Programako", roles: ["leader"] },
    {
      href: "/dashboard/search",
      label: "🔎 Mitady sampana",
      roles: ["super_admin", "church_admin", "leader"],
    },
    {
      href: "/dashboard/invitations",
      label: "📨 Fanasana",
      roles: ["super_admin", "church_admin", "leader"],
    },
  ].filter((l) => !role || l.roles.includes(role));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-40 shadow-xl"
      style={{
        background:
          "linear-gradient(180deg, #2E1065 0%, #4C1D95 60%, #5B21B6 100%)",
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl border border-white/20 overflow-hidden">
            <Image src="/staf-logo.jpg" alt="Logo" width={50} height={50} />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-tight">
              S.T.A.F
            </div>
            <div className="text-purple-300 text-xs tracking-wider">
              SAMPANA MANAGER
            </div>
          </div>
        </Link>
        {profile?.church && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-white/8 text-purple-200 text-xs font-medium border border-white/10">
            🏛️ {profile.church.name}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
              pathname === link.href
                ? "bg-white/15 text-white shadow-inner border border-white/20"
                : "text-purple-200 hover:bg-white/8 hover:text-white",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div
            className="w-9 h-9 rounded-full bg-purple-400/30 border border-purple-300/30
            flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          >
            {profile?.full_name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm truncate">
              {profile?.full_name}
            </div>
            <div className="text-purple-300 text-xs truncate">
              {role === "super_admin"
                ? "⚡ Super Admin"
                : role === "church_admin"
                  ? "🏛️ Admin Fiangonana"
                  : "👤 Leader Sampana"}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-xl border border-white/15 text-purple-200
            hover:bg-white/10 hover:text-white text-sm font-medium transition-all duration-150"
        >
          🚪 Hivoaka
        </button>
      </div>
    </aside>
  );
}
