"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

// Página de login com magic link
export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Link de acesso enviado! Verifique seu email.");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1 className="page-title text-center">Entrar</h1>
      <p style={{ textAlign: "center", color: "var(--text-light)", marginBottom: "1.5rem" }}>
        Receba um link de acesso no seu email
      </p>

      {message && <div className="message message-success">{message}</div>}
      {error && <div className="message message-error">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Enviando..." : "Enviar link de acesso"}
        </button>
      </form>
    </div>
  );
}
