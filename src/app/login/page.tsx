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
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center justify-center">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "#00c46a",
              boxShadow: "0 8px 24px rgba(0, 196, 106, 0.4)",
            }}
          >
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0a3622" }}>
            LendFlow
          </h1>
          <p className="mt-2 text-sm font-medium" style={{ color: "#6b7280" }}>
            Welcome back. Please enter your details.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 10px 40px rgba(10, 54, 34, 0.08)",
            border: "1px solid rgba(10, 54, 34, 0.05)",
          }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold" style={{ color: "#1a1a1a" }}>
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail size={18} style={{ color: "#9ca3af" }} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-sm font-medium ring-1 ring-inset transition-all"
                  style={{
                    backgroundColor: "#f9fafb",
                    color: "#1a1a1a",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                  }}
                  placeholder="admin@lendflow.app"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold" style={{ color: "#1a1a1a" }}>
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={18} style={{ color: "#9ca3af" }} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-sm font-medium ring-1 ring-inset transition-all"
                  style={{
                    backgroundColor: "#f9fafb",
                    color: "#1a1a1a",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: "#0a3622",
                boxShadow: "0 4px 12px rgba(10, 54, 34, 0.25)",
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
