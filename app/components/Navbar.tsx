"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

export function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="navbar-brand">
          🚗 CarRental
        </Link>
        <div className="navbar-links">
          {loading ? null : profile ? (
            <>
              {/* Se o perfil não tem nome, redirecionar para completar */}
              {!profile.name && (
                <Link href="/profile">Completar perfil</Link>
              )}
              {profile.role === "owner" && (
                <>
                  <Link href="/owner">Meus carros</Link>
                  <Link href="/owner/bookings">Reservas</Link>
                </>
              )}
              {profile.role === "renter" && (
                <Link href="/my-bookings">Minhas reservas</Link>
              )}
              <Link href="/profile">Perfil</Link>
              <button onClick={handleLogout} className="btn btn-small btn-primary">
                Sair
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
