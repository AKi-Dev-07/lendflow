"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarClock,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import type { LoanWithBorrower } from "@/lib/database.types";
import { useAuth } from "@/lib/AuthContext";

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.", author: "Ayn Rand" },
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "Fortune favors the bold.", author: "Virgil" },
  { text: "A wise person should have money in their head, but not in their heart.", author: "Jonathan Swift" },
  { text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
  { text: "Formal education will make you a living; self-education will make you a fortune.", author: "Jim Rohn" },
];

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
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Pick a random quote that stays stable for this render
  const quote = useMemo(() => {
    const today = new Date();
    const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % quotes.length;
    return quotes[dayIndex];
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard();
    }
  }, [authLoading, user, isAdmin]);

  async function fetchDashboard() {
    setLoading(true);

    let query = supabase
      .from("loans")
      .select(
        isAdmin
          ? "*, borrowers(full_name, phone)"
          : "*, borrowers!inner(full_name, phone)"
      );

    if (!isAdmin && user) {
      query = query.eq("borrowers.auth_user_id", user.id);
    }

    const { data: loans } = await query;

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
        <Loader2 size={32} className="animate-spin" style={{ color: "#8B6E4E" }} />
      </div>
    );
  }

  return (
    <div>
      {/* ── Header with Quote ────────────────── */}
      <div className="mb-8 animate-fade-in">
        <h1
          className="text-2xl font-bold"
          style={{ color: "#1C1814", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {isAdmin ? "Portfolio Overview" : "Your Loans"}
        </h1>
        <div className="mt-3">
          <p className="quote-text">
            &ldquo;{quote.text}&rdquo;
          </p>

        </div>
      </div>

      {/* ── Stat Cards ────────────────────────── */}
      <div className="stagger mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Active Loans"
          value={String(stats.activeLoans)}
          icon={<Landmark size={22} />}
          accentColor="#8B6E4E"
          delay={0}
        />
        {isAdmin && (
          <StatCard
            label="Total Money Out"
            value={formatCurrency(stats.totalMoneyOut)}
            icon={<ArrowUpRight size={22} />}
            accentColor="#C8A882"
            delay={80}
          />
        )}
        <StatCard
          label={isAdmin ? "Total Collected" : "Total Paid"}
          value={formatCurrency(stats.totalCollected)}
          icon={<ArrowDownLeft size={22} />}
          accentColor="#1C1814"
          delay={isAdmin ? 160 : 80}
        />
      </div>

      {/* ── Upcoming Payments ─────────────────── */}
      <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock size={18} style={{ color: "#8B6E4E" }} />
          <h2
            className="text-lg font-bold"
            style={{ color: "#1C1814", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Upcoming Payments
          </h2>
          <span
            className="ml-1 rounded-full px-2.5 py-0.5 text-xs font-semibold animate-scale-in"
            style={{
              backgroundColor: "rgba(139, 110, 78, 0.1)",
              color: "#8B6E4E",
              animationDelay: "400ms",
            }}
          >
            Next 7 days
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="card empty-state animate-scale-in" style={{ animationDelay: "300ms" }}>
            <CalendarClock size={40} className="mx-auto mb-2" style={{ color: "#E2D9CE" }} />
            <p className="text-sm" style={{ color: "#7A6E64" }}>
              No payments due this week. You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="table-container animate-fade-in" style={{ animationDelay: "300ms" }}>
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
                      <td className="font-semibold" style={{ color: "#1C1814" }}>
                        {loan.borrowers.full_name}
                      </td>
                      <td>{loan.borrowers.phone}</td>
                      <td className="font-semibold" style={{ color: "#C8A882" }}>
                        {formatCurrency(Number(loan.balance))}
                      </td>
                      <td>{formatDate(loan.due_date)}</td>
                      <td>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            color:
                              days <= 0
                                ? "#b44d4d"
                                : days <= 2
                                ? "#C8A882"
                                : "#8B6E4E",
                            backgroundColor:
                              days <= 0
                                ? "rgba(180, 77, 77, 0.08)"
                                : days <= 2
                                ? "rgba(200, 168, 130, 0.12)"
                                : "rgba(139, 110, 78, 0.08)",
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
