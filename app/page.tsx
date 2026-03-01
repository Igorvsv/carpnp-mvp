"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Car } from "@/lib/types";
import Link from "next/link";

// Página inicial: busca de carros por cidade
export default function HomePage() {
  const supabase = createClient();
  const [cars, setCars] = useState<Car[]>([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCars(searchCity?: string) {
    setLoading(true);
    let query = supabase
      .from("cars")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (searchCity && searchCity.trim()) {
      query = query.ilike("city", `%${searchCity.trim()}%`);
    }

    const { data } = await query;
    setCars(data || []);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadCars(city);
  }

  return (
    <div>
      <h1 className="page-title">Encontre o carro ideal para sua viagem</h1>

      {/* Barra de busca por cidade */}
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Buscar por cidade..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Buscar
        </button>
      </form>

      {/* Lista de carros */}
      {loading ? (
        <p className="text-center">Carregando...</p>
      ) : cars.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum carro encontrado.</p>
          <p>Tente buscar por outra cidade.</p>
        </div>
      ) : (
        <div className="car-grid">
          {cars.map((car) => (
            <Link href={`/car/${car.id}`} key={car.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card">
                <h3>{car.title}</h3>
                <p>📍 {car.city}</p>
                <p className="price mt-1">R$ {Number(car.price_per_day).toFixed(2)} / dia</p>
                <p className="mt-1">{car.description.slice(0, 100)}{car.description.length > 100 ? "..." : ""}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
