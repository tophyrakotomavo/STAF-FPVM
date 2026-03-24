"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    init();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsLoggedIn(!!session);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div>
      <nav>
        <span className="logo">
          <span>
            <Image
              src="/staf-logo.jpg"
              width={40}
              height={40}
              alt="staf"
              className="logo1"
            />
          </span>
          <span>STAF</span>
        </span>
        <span className="tools">
          <span className="link">
            <Link href="#acceuil">acceuil</Link>
          </span>
          <span className="link">
            <Link href="#sampana">sampana</Link>
          </span>
          <span className="link">
            <Link href="#fpvm">FPVM</Link>
          </span>
          <span className="link">
            {isLoggedIn ? (
              <Link href="/dashboard">Dashboard</Link>
            ) : (
              <Link href="/login" target="_blank">
                Log in
              </Link>
            )}
          </span>
        </span>
      </nav>
    </div>
  );
}
