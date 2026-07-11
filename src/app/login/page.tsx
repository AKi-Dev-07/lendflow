"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sparkles, Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center justify-center">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "#8B6E4E",
              boxShadow: "0 8px 24px rgba(139, 110, 78, 0.35)",
            }}
          >
            <Sparkles size={28} className="text-white" />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "#1C1814", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            LendFlow
          </h1>
          <p
            className="mt-2 text-sm font-medium"
            style={{ color: "#7A6E64", fontFamily: "'Jost', sans-serif" }}
          >
            Welcome back. Please enter your details.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-[10px] p-8"
          style={{
            backgroundColor: "#FDFCFB",
            boxShadow: "0 10px 40px rgba(28, 24, 20, 0.06)",
            border: "1px solid #E2D9CE",
          }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "#1C1814", fontFamily: "'Jost', sans-serif" }}
              >
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail size={18} style={{ color: "#7A6E64" }} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@lendflow.app"
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "#1C1814", fontFamily: "'Jost', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={18} style={{ color: "#7A6E64" }} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div
                className="rounded-lg p-3 text-sm font-medium"
                style={{
                  backgroundColor: "rgba(180, 77, 77, 0.08)",
                  color: "#b44d4d",
                  border: "1px solid rgba(180, 77, 77, 0.15)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full justify-center py-3"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
