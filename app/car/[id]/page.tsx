"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import type { Car, Profile } from "@/lib/types";

// Página de detalhes do carro + formulário de reserva
export default function CarDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      // Carregar detalhes do carro
      const { data: carData } = await supabase
        .from("cars")
        .select("*")
        .eq("id", carId)
        .single();

      if (!carData) {
        setLoading(false);
        return;
      }
      setCar(carData);

      // Carregar dados do dono
      const { data: ownerData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", carData.owner_id)
        .single();
      setOwner(ownerData);

      // Carregar usuário atual (se logado)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentUser(profileData);
      }

      setLoading(false);
    }
    load();
  }, [supabase, carId]);

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setBooking(true);
    setMessage("");
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Validar datas
    if (new Date(startDate) >= new Date(endDate)) {
      setError("A data de fim deve ser posterior à data de início.");
      setBooking(false);
      return;
    }

    if (new Date(startDate) < new Date()) {
      setError("A data de início não pode ser no passado.");
      setBooking(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("bookings")
      .insert({
        car_id: carId,
        renter_id: user.id,
        start_date: startDate,
        end_date: endDate,
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setMessage("Reserva solicitada com sucesso! Aguarde a aprovação do proprietário.");
      setStartDate("");
      setEndDate("");
    }
    setBooking(false);
  }

  // Calcular total estimado
  function calculateTotal(): string {
    if (!startDate || !endDate || !car) return "0.00";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return "0.00";
    return (days * Number(car.price_per_day)).toFixed(2);
  }

  if (loading) return <p className="text-center mt-3">Carregando...</p>;
  if (!car) return <p className="text-center mt-3">Carro não encontrado.</p>;

  const isOwner = currentUser?.id === car.owner_id;
  const isRenter = currentUser?.role === "renter";

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div className="card">
        <h1 className="page-title">{car.title}</h1>
        <p>📍 {car.city}</p>
        <p className="price mt-1">R$ {Number(car.price_per_day).toFixed(2)} / dia</p>
        <p className="mt-2">{car.description}</p>
        {owner && (
          <p className="mt-2" style={{ color: "var(--text-light)" }}>
            Proprietário: {owner.name} | Tel: {owner.phone}
          </p>
        )}
      </div>

      {/* Formulário de reserva - só aparece para locatários */}
      {!currentUser ? (
        <div className="card text-center">
          <p>Faça login para solicitar uma reserva.</p>
          <button onClick={() => router.push("/login")} className="btn btn-primary mt-1">
            Entrar
          </button>
        </div>
      ) : isOwner ? (
        <div className="message message-info">
          Este é o seu carro. Você pode gerenciá-lo na página{" "}
          <a href="/owner">Meus carros</a>.
        </div>
      ) : isRenter ? (
        <div className="card">
          <h2 style={{ marginBottom: "1rem" }}>Solicitar reserva</h2>

          {message && <div className="message message-success">{message}</div>}
          {error && <div className="message message-error">{error}</div>}

          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label htmlFor="start">Data de início</label>
              <input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="end">Data de fim</label>
              <input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {startDate && endDate && (
              <p className="mb-2">
                <strong>Total estimado: R$ {calculateTotal()}</strong>
              </p>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={booking}>
              {booking ? "Enviando..." : "Solicitar reserva"}
            </button>
          </form>
        </div>
      ) : (
        <div className="message message-info">
          Somente locatários podem solicitar reservas. Altere seu perfil se deseja alugar carros.
        </div>
      )}
    </div>
  );
}
