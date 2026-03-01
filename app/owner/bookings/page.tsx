"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/types";

// Página do dono: gerenciar reservas recebidas
export default function OwnerBookingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBookings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Buscar carros do dono, depois reservas desses carros
    const { data: myCars } = await supabase
      .from("cars")
      .select("id")
      .eq("owner_id", user.id);

    if (!myCars || myCars.length === 0) {
      setLoading(false);
      return;
    }

    const carIds = myCars.map((c) => c.id);

    const { data } = await supabase
      .from("bookings")
      .select("*, car:cars(*), renter:profiles!bookings_renter_id_fkey(*)")
      .in("car_id", carIds)
      .order("created_at", { ascending: false });

    setBookings(data || []);
    setLoading(false);
  }

  async function updateStatus(bookingId: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (!error) {
      setBookings(
        bookings.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
    }
  }

  if (loading) return <p className="text-center mt-3">Carregando...</p>;

  return (
    <div>
      <h1 className="page-title">Reservas recebidas</h1>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma reserva recebida ainda.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Carro</th>
                <th>Locatário</th>
                <th>Período</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.car?.title || "—"}</td>
                  <td>
                    {b.renter?.name || "—"}
                    <br />
                    <small style={{ color: "var(--text-light)" }}>{b.renter?.phone}</small>
                  </td>
                  <td>
                    {new Date(b.start_date).toLocaleDateString("pt-BR")} →{" "}
                    {new Date(b.end_date).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <span className={`badge badge-${b.status}`}>
                      {b.status === "pending" ? "Pendente" : b.status === "approved" ? "Aprovada" : "Rejeitada"}
                    </span>
                  </td>
                  <td>
                    {b.status === "pending" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateStatus(b.id, "approved")}
                          className="btn btn-small btn-success"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => updateStatus(b.id, "rejected")}
                          className="btn btn-small btn-danger"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
