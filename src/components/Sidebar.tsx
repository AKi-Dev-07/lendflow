"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Landmark,
  Receipt,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/borrowers", label: "Borrowers", icon: Users },
  { href: "/loans", label: "Loans", icon: Landmark },
  { href: "/repayments", label: "Repayments", icon: Receipt },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, authError } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (isAdmin) return true;
    return item.href === "/" || item.href === "/repayments";
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col"
      style={{ backgroundColor: "#1C1814" }}
    >
      {/* ── Logo ──────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "#8B6E4E",
            boxShadow: "0 4px 14px rgba(139, 110, 78, 0.35)",
          }}
        >
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1
            className="text-lg font-bold text-white tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            LendFlow
          </h1>
          <p
            className="text-[0.65rem] font-medium"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Jost', sans-serif" }}
          >
            Loan Management
          </p>
        </div>
      </div>

      {/* ── Divider ───────────────────────────── */}
      <div
        className="mx-5 mb-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      />

      {/* ── Navigation ────────────────────────── */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {filteredNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: "rgba(139, 110, 78, 0.18)",
                      color: "#C8A882",
                    }
                  : {
                      color: "rgba(255,255,255,0.50)",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.50)";
                }
              }}
            >
              <Icon
                size={18}
                className="shrink-0"
                style={{
                  color: isActive ? "#C8A882" : "rgba(255,255,255,0.35)",
                }}
              />
              <span style={{ fontFamily: "'Jost', sans-serif" }}>{label}</span>
              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "#C8A882" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────── */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={handleSignOut}
          className="mb-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/8"
          style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Jost', sans-serif" }}
        >
          <LogOut size={16} />
          Sign out
        </button>
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white uppercase"
            style={{ backgroundColor: "#8B6E4E" }}
          >
            {user?.email?.[0] || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p
              className="truncate text-sm font-medium text-white"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              {user?.email || "User"}
            </p>
            <p
              className="text-[0.65rem]"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Jost', sans-serif" }}
            >
              {isAdmin ? "Administrator" : "Borrower"}
            </p>
            {authError && (
              <p className="text-[0.6rem] text-red-400 mt-1 truncate" title={authError}>
                Error: {authError}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
