"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Lock } from "lucide-react";

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
        <div className="mb-8 flex flex-col items-center justify-center animate-fade-in">
          <div className="relative mb-4 h-16 w-16 animate-float">
            <Image
              src="/logo.png"
              alt="LendFlow Logo"
              fill
              className="object-contain rounded-2xl"
              priority
            />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight animate-fade-in"
            style={{
              color: "#1C1814",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              animationDelay: "100ms",
            }}
          >
            LendFlow
          </h1>
          <p
            className="mt-2 text-sm font-medium animate-fade-in"
            style={{
              color: "#7A6E64",
              fontFamily: "'Jost', sans-serif",
              animationDelay: "200ms",
            }}
          >
            Welcome back. Please enter your details.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-[10px] p-8 animate-fade-in"
          style={{
            backgroundColor: "#FDFCFB",
            boxShadow: "0 10px 40px rgba(28, 24, 20, 0.06)",
            border: "1px solid #E2D9CE",
            animationDelay: "150ms",
          }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="animate-fade-in" style={{ animationDelay: "250ms" }}>
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

            <div className="animate-fade-in" style={{ animationDelay: "350ms" }}>
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
                className="rounded-lg p-3 text-sm font-medium animate-scale-in"
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
              className="btn-primary mt-2 w-full justify-center py-3 animate-fade-in"
              style={{ animationDelay: "450ms" }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
