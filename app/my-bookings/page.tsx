"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/types";
import Link from "next/link";

// Página do locatário: ver minhas reservas
export default function MyBookingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("bookings")
        .select("*, car:cars(*)")
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false });

      setBookings(data || []);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  if (loading) return <p className="text-center mt-3">Carregando...</p>;

  return (
    <div>
      <h1 className="page-title">Minhas reservas</h1>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não fez nenhuma reserva.</p>
          <Link href="/" className="btn btn-primary mt-2" style={{ display: "inline-block" }}>
            Buscar carros
          </Link>
        </div>
      ) : (
        <div>
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <div className="flex-between">
                <div>
                  <h3>{b.car?.title || "Carro"}</h3>
                  <p>📍 {b.car?.city}</p>
                </div>
                <span className={`badge badge-${b.status}`}>
                  {b.status === "pending" ? "Pendente" : b.status === "approved" ? "Aprovada" : "Rejeitada"}
                </span>
              </div>
              <p className="mt-1">
                {new Date(b.start_date).toLocaleDateString("pt-BR")} →{" "}
                {new Date(b.end_date).toLocaleDateString("pt-BR")}
              </p>
              {b.car && (
                <p className="mt-1">
                  <strong>R$ {Number(b.car.price_per_day).toFixed(2)}</strong> / dia
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
