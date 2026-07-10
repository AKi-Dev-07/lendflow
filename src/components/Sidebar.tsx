"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Landmark,
  Receipt,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/borrowers", label: "Borrowers", icon: Users },
  { href: "/loans", label: "Loans", icon: Landmark },
  { href: "/repayments", label: "Repayments", icon: Receipt },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col"
      style={{ backgroundColor: "#0a3622" }}
    >
      {/* ── Logo ──────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "#00c46a",
            boxShadow: "0 4px 14px rgba(0, 196, 106, 0.35)",
          }}
        >
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            LendFlow
          </h1>
          <p
            className="text-[0.65rem] font-medium"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Loan Management
          </p>
        </div>
      </div>

      {/* ── Divider ───────────────────────────── */}
      <div
        className="mx-5 mb-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      />

      {/* ── Navigation ────────────────────────── */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: "rgba(0, 196, 106, 0.15)",
                      color: "#00e07a",
                    }
                  : {
                      color: "rgba(255,255,255,0.55)",
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                }
              }}
            >
              <Icon
                size={18}
                className="shrink-0"
                style={{
                  color: isActive ? "#00c46a" : "rgba(255,255,255,0.4)",
                }}
              />
              {label}
              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "#00c46a" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────── */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: "#00c46a" }}
          >
            A
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-[0.65rem]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Free Tier
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
