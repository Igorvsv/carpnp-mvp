"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

// Página de perfil - criar/editar nome, telefone e role
export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"owner" | "renter">("renter");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setRole(data.role || "renter");
      }
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ name, phone, role })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Perfil atualizado com sucesso!");
      // Redirecionar para a página adequada após salvar
      setTimeout(() => {
        if (role === "owner") {
          router.push("/owner");
        } else {
          router.push("/");
        }
        router.refresh();
      }, 1000);
    }
    setSaving(false);
  }

  if (loading) return <p className="text-center">Carregando...</p>;

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h1 className="page-title">
        {profile?.name ? "Editar perfil" : "Completar perfil"}
      </h1>

      {!profile?.name && (
        <div className="message message-info mb-2">
          Complete seu perfil para começar a usar a plataforma.
        </div>
      )}

      {message && <div className="message message-success">{message}</div>}
      {error && <div className="message message-error">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="name">Nome completo</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Seu nome completo"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Telefone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Eu quero:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as "owner" | "renter")}
          >
            <option value="renter">Alugar carros (locatário)</option>
            <option value="owner">Disponibilizar meus carros (proprietário)</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={saving}>
          {saving ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </div>
  );
}
