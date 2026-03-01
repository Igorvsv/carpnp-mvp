"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Car } from "@/lib/types";

// Página do dono: listar e criar carros
export default function OwnerPage() {
  const supabase = createClient();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Campos do formulário
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCars() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Verificar se é owner
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "owner") {
      router.push("/");
      return;
    }

    const { data } = await supabase
      .from("cars")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    setCars(data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: insertError } = await supabase
      .from("cars")
      .insert({
        owner_id: user.id,
        title,
        city,
        price_per_day: parseFloat(pricePerDay),
        description,
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      // Limpar formulário e recarregar
      setTitle("");
      setCity("");
      setPricePerDay("");
      setDescription("");
      setShowForm(false);
      loadCars();
    }
    setSaving(false);
  }

  async function toggleActive(car: Car) {
    const { error } = await supabase
      .from("cars")
      .update({ active: !car.active })
      .eq("id", car.id);

    if (!error) {
      setCars(cars.map((c) => (c.id === car.id ? { ...c, active: !c.active } : c)));
    }
  }

  if (loading) return <p className="text-center mt-3">Carregando...</p>;

  return (
    <div>
      <div className="flex-between mb-2">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Meus carros</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? "Cancelar" : "+ Novo carro"}
        </button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <div className="card mb-2">
          <h2 style={{ marginBottom: "1rem" }}>Novo anúncio</h2>
          {error && <div className="message message-error">{error}</div>}

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="title">Título</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Honda Civic 2022"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">Cidade</label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Preço por dia (R$)</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="1"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                placeholder="150.00"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="desc">Descrição</label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o carro, condições, etc."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Salvando..." : "Criar anúncio"}
            </button>
          </form>
        </div>
      )}

      {/* Lista de carros */}
      {cars.length === 0 ? (
        <div className="empty-state">
          <p>Você ainda não tem carros cadastrados.</p>
          <p>Clique em &quot;+ Novo carro&quot; para começar.</p>
        </div>
      ) : (
        <div className="car-grid">
          {cars.map((car) => (
            <div key={car.id} className="card">
              <div className="flex-between mb-1">
                <h3>{car.title}</h3>
                <span className={`badge ${car.active ? "badge-approved" : "badge-rejected"}`}>
                  {car.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p>📍 {car.city}</p>
              <p className="price mt-1">R$ {Number(car.price_per_day).toFixed(2)} / dia</p>
              <p className="mt-1">{car.description.slice(0, 80)}...</p>
              <div className="mt-2">
                <button
                  onClick={() => toggleActive(car)}
                  className={`btn btn-small ${car.active ? "btn-danger" : "btn-success"}`}
                >
                  {car.active ? "Desativar" : "Ativar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
