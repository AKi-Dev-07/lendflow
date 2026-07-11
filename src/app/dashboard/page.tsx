"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarClock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import type { LoanWithBorrower, Repayment } from "@/lib/database.types";
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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface DashboardStats {
  activeLoans: number;
  totalMoneyOut: number;
  totalCollected: number;
}

interface MonthlyData {
  activeLoans: number;
  moneyOut: number;
  collected: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoanRow = any;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeLoans: 0,
    totalMoneyOut: 0,
    totalCollected: 0,
  });
  const [allLoans, setAllLoans] = useState<LoanRow[]>([]);
  const [allRepayments, setAllRepayments] = useState<Repayment[]>([]);
  const [upcoming, setUpcoming] = useState<LoanWithBorrower[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Month selector state
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed

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

    let loanQuery = supabase
      .from("loans")
      .select(
        isAdmin
          ? "*, borrowers(full_name, phone)"
          : "*, borrowers!inner(full_name, phone)"
      );

    if (!isAdmin && user) {
      loanQuery = loanQuery.eq("borrowers.auth_user_id", user.id);
    }

    const { data: loans } = await loanQuery;

    // Fetch all repayments
    const { data: repayments } = await supabase
      .from("repayments")
      .select("*")
      .order("payment_date", { ascending: false });

    if (loans) {
      setAllLoans(loans);
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(today);
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

    if (repayments) {
      setAllRepayments(repayments);
    }

    setLoading(false);
  }

  // Compute monthly data
  const monthlyData: MonthlyData = useMemo(() => {
    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

    // Loans issued this month
    const loansThisMonth = allLoans.filter((l) => {
      const issued = new Date(l.issue_date);
      return issued >= monthStart && issued <= monthEnd;
    });

    // Active loans that were active during this month
    // A loan is "active in this month" if it was issued on or before month end AND (still ACTIVE or was paid after month start)
    const activeThisMonth = allLoans.filter((l) => {
      const issued = new Date(l.issue_date);
      if (issued > monthEnd) return false; // issued after this month
      if (l.status === "ACTIVE") return true; // still active
      // If paid, check if it was active during this month
      // For simplicity, count loans issued in or before this month that are still ACTIVE,
      // plus loans issued this month
      return issued >= monthStart;
    });

    const moneyOut = loansThisMonth.reduce(
      (sum, l) => sum + Number(l.total_due),
      0
    );

    // Repayments collected this month
    const repaymentsThisMonth = allRepayments.filter((r) => {
      const payDate = new Date(r.payment_date);
      return payDate >= monthStart && payDate <= monthEnd;
    });

    const collected = repaymentsThisMonth.reduce(
      (sum, r) => sum + Number(r.amount_paid),
      0
    );

    return {
      activeLoans: activeThisMonth.length,
      moneyOut,
      collected,
    };
  }, [allLoans, allRepayments, selectedYear, selectedMonth]);

  // Compute last 6 months bar chart data
  const barChartData = useMemo(() => {
    const months: { label: string; moneyOut: number; collected: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const mOut = allLoans
        .filter((l) => {
          const issued = new Date(l.issue_date);
          return issued >= mStart && issued <= mEnd;
        })
        .reduce((sum, l) => sum + Number(l.total_due), 0);

      const mCol = allRepayments
        .filter((r) => {
          const payDate = new Date(r.payment_date);
          return payDate >= mStart && payDate <= mEnd;
        })
        .reduce((sum, r) => sum + Number(r.amount_paid), 0);

      months.push({
        label: MONTH_NAMES[d.getMonth()].substring(0, 3),
        moneyOut: mOut,
        collected: mCol,
      });
    }
    return months;
  }, [allLoans, allRepayments, selectedYear, selectedMonth]);

  const maxBarValue = useMemo(() => {
    const allVals = barChartData.flatMap((m) => [m.moneyOut, m.collected]);
    return Math.max(...allVals, 1);
  }, [barChartData]);

  function goToPrevMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }

  function goToNextMonth() {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  }

  // Compare with previous month for trend indicators
  const prevMonthData: MonthlyData = useMemo(() => {
    const pm = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const py = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    const monthStart = new Date(py, pm, 1);
    const monthEnd = new Date(py, pm + 1, 0, 23, 59, 59);

    const loansThisMonth = allLoans.filter((l) => {
      const issued = new Date(l.issue_date);
      return issued >= monthStart && issued <= monthEnd;
    });

    const activeThisMonth = allLoans.filter((l) => {
      const issued = new Date(l.issue_date);
      if (issued > monthEnd) return false;
      if (l.status === "ACTIVE") return true;
      return issued >= monthStart;
    });

    const moneyOut = loansThisMonth.reduce((sum, l) => sum + Number(l.total_due), 0);

    const repaymentsThisMonth = allRepayments.filter((r) => {
      const payDate = new Date(r.payment_date);
      return payDate >= monthStart && payDate <= monthEnd;
    });

    const collected = repaymentsThisMonth.reduce((sum, r) => sum + Number(r.amount_paid), 0);

    return { activeLoans: activeThisMonth.length, moneyOut, collected };
  }, [allLoans, allRepayments, selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: "#8B6E4E" }} />
      </div>
    );
  }

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

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

      {/* ── Monthly Breakdown ─────────────────── */}
      <div className="animate-fade-in mb-8" style={{ animationDelay: "150ms" }}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} style={{ color: "#8B6E4E" }} />
            <h2
              className="text-lg font-bold"
              style={{ color: "#1C1814", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Monthly Breakdown
            </h2>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
              style={{ color: "#7A6E64", backgroundColor: "rgba(139, 110, 78, 0.06)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(139, 110, 78, 0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(139, 110, 78, 0.06)"; }}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              className="text-sm font-semibold min-w-[140px] text-center"
              style={{ color: "#1C1814", fontFamily: "'Jost', sans-serif" }}
            >
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={goToNextMonth}
              disabled={isCurrentMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
              style={{
                color: isCurrentMonth ? "#E2D9CE" : "#7A6E64",
                backgroundColor: "rgba(139, 110, 78, 0.06)",
                cursor: isCurrentMonth ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!isCurrentMonth) e.currentTarget.style.backgroundColor = "rgba(139, 110, 78, 0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(139, 110, 78, 0.06)"; }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Monthly Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          {/* Active Loans */}
          <div
            className="card p-5"
            style={{ borderLeft: "3px solid #DC2626" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#7A6E64", fontFamily: "'Jost', sans-serif" }}
                >
                  Active Loans
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: "#1C1814", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {monthlyData.activeLoans}
                </p>
              </div>
              {prevMonthData.activeLoans !== monthlyData.activeLoans && (
                <div
                  className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5"
                  style={{
                    color: monthlyData.activeLoans > prevMonthData.activeLoans ? "#DC2626" : "#16A34A",
                    backgroundColor: monthlyData.activeLoans > prevMonthData.activeLoans ? "rgba(220,38,38,0.08)" : "rgba(22,163,74,0.08)",
                  }}
                >
                  {monthlyData.activeLoans > prevMonthData.activeLoans ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(monthlyData.activeLoans - prevMonthData.activeLoans)}
                </div>
              )}
            </div>
          </div>

          {/* Money Out */}
          <div
            className="card p-5"
            style={{ borderLeft: "3px solid #C8A882" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#7A6E64", fontFamily: "'Jost', sans-serif" }}
                >
                  Money Out
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: "#1C1814", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {formatCurrency(monthlyData.moneyOut)}
                </p>
              </div>
              {prevMonthData.moneyOut !== monthlyData.moneyOut && prevMonthData.moneyOut > 0 && (
                <div
                  className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5"
                  style={{
                    color: monthlyData.moneyOut > prevMonthData.moneyOut ? "#C8A882" : "#7A6E64",
                    backgroundColor: "rgba(200,168,130,0.1)",
                  }}
                >
                  {monthlyData.moneyOut > prevMonthData.moneyOut ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.round(((monthlyData.moneyOut - prevMonthData.moneyOut) / prevMonthData.moneyOut) * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* Collections */}
          <div
            className="card p-5"
            style={{ borderLeft: "3px solid #16A34A" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#7A6E64", fontFamily: "'Jost', sans-serif" }}
                >
                  Collections
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: "#1C1814", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {formatCurrency(monthlyData.collected)}
                </p>
              </div>
              {prevMonthData.collected !== monthlyData.collected && prevMonthData.collected > 0 && (
                <div
                  className="flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5"
                  style={{
                    color: monthlyData.collected > prevMonthData.collected ? "#16A34A" : "#DC2626",
                    backgroundColor: monthlyData.collected > prevMonthData.collected ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
                  }}
                >
                  {monthlyData.collected > prevMonthData.collected ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.round(((monthlyData.collected - prevMonthData.collected) / prevMonthData.collected) * 100)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mini Bar Chart - last 6 months */}
        <div className="card p-5">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: "#7A6E64", fontFamily: "'Jost', sans-serif" }}
          >
            6-Month Trend
          </p>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#C8A882" }} />
              <span className="text-xs" style={{ color: "#7A6E64" }}>Money Out</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#16A34A" }} />
              <span className="text-xs" style={{ color: "#7A6E64" }}>Collections</span>
            </div>
          </div>

          {/* Bars */}
          <div className="flex items-end gap-3 h-32">
            {barChartData.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 h-24">
                  {/* Money Out bar */}
                  <div
                    className="flex-1 rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max((m.moneyOut / maxBarValue) * 100, m.moneyOut > 0 ? 4 : 0)}%`,
                      backgroundColor: "#C8A882",
                      minHeight: m.moneyOut > 0 ? "4px" : "0px",
                    }}
                    title={`Money Out: ${formatCurrency(m.moneyOut)}`}
                  />
                  {/* Collected bar */}
                  <div
                    className="flex-1 rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max((m.collected / maxBarValue) * 100, m.collected > 0 ? 4 : 0)}%`,
                      backgroundColor: "#16A34A",
                      minHeight: m.collected > 0 ? "4px" : "0px",
                    }}
                    title={`Collections: ${formatCurrency(m.collected)}`}
                  />
                </div>
                <span className="text-[10px] font-semibold" style={{ color: "#7A6E64" }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
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
