"use client";

import { useEffect, useState } from "react";
import {
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarClock,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, daysUntil, getGreeting } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import type { LoanWithBorrower } from "@/lib/database.types";

interface DashboardStats {
  activeLoans: number;
  totalMoneyOut: number;
  totalCollected: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeLoans: 0,
    totalMoneyOut: 0,
    totalCollected: 0,
  });
  const [upcoming, setUpcoming] = useState<LoanWithBorrower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);

    const { data: loans } = await supabase
      .from("loans")
      .select("*, borrowers(full_name, phone)");

    if (loans) {
      const active = loans.filter((l) => l.status === "ACTIVE");
      const totalOut = loans.reduce(
        (sum, l) => sum + Number(l.total_due),
        0
      );
      const totalCollected = loans.reduce(
        (sum, l) => sum + Number(l.amount_paid),
        0
      );

      setStats({
        activeLoans: active.length,
        totalMoneyOut: totalOut,
        totalCollected: totalCollected,
      });

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(now);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      const upcomingLoans = active
        .filter((l) => {
          const due = new Date(l.due_date);
          return due <= weekFromNow;
        })
        .sort(
          (a, b) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        ) as LoanWithBorrower[];

      setUpcoming(upcomingLoans);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: "#0a3622" }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ── Header ────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#1a1a1a" }}>
          {getGreeting()} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>
          Here&apos;s your lending portfolio overview.
        </p>
      </div>

      {/* ── Stat Cards ────────────────────────── */}
      <div className="stagger mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Active Loans"
          value={String(stats.activeLoans)}
          icon={<Landmark size={22} />}
          accentColor="#0a3622"
          delay={0}
        />
        <StatCard
          label="Total Money Out"
          value={formatCurrency(stats.totalMoneyOut)}
          icon={<ArrowUpRight size={22} />}
          accentColor="#d97706"
          delay={80}
        />
        <StatCard
          label="Total Collected"
          value={formatCurrency(stats.totalCollected)}
          icon={<ArrowDownLeft size={22} />}
          accentColor="#00c46a"
          delay={160}
        />
      </div>

      {/* ── Upcoming Payments ─────────────────── */}
      <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock size={18} style={{ color: "#0a3622" }} />
          <h2 className="text-lg font-bold" style={{ color: "#1a1a1a" }}>
            Upcoming Payments
          </h2>
          <span
            className="ml-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: "rgba(0,196,106,0.12)", color: "#059669" }}
          >
            Next 7 days
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="card empty-state">
            <CalendarClock size={40} className="mx-auto mb-2" style={{ color: "#d1d5db" }} />
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              No payments due this week. You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Phone</th>
                  <th>Balance Due</th>
                  <th>Due Date</th>
                  <th>Days Left</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((loan) => {
                  const days = daysUntil(loan.due_date);
                  return (
                    <tr key={loan.id}>
                      <td className="font-semibold" style={{ color: "#1a1a1a" }}>
                        {loan.borrowers.full_name}
                      </td>
                      <td>{loan.borrowers.phone}</td>
                      <td className="font-semibold" style={{ color: "#d97706" }}>
                        {formatCurrency(Number(loan.balance))}
                      </td>
                      <td>{formatDate(loan.due_date)}</td>
                      <td>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            color:
                              days <= 0
                                ? "#dc2626"
                                : days <= 2
                                ? "#d97706"
                                : "#059669",
                            backgroundColor:
                              days <= 0
                                ? "rgba(220,38,38,0.08)"
                                : days <= 2
                                ? "rgba(217,119,6,0.08)"
                                : "rgba(0,196,106,0.08)",
                          }}
                        >
                          {days <= 0
                            ? `${Math.abs(days)}d overdue`
                            : `${days}d left`}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={loan.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
