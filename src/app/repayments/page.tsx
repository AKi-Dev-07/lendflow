"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  Loader2,
  CreditCard,
  Banknote,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import type { LoanWithBorrower, Repayment } from "@/lib/database.types";

export default function RepaymentsPage() {
  const [loans, setLoans] = useState<LoanWithBorrower[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithBorrower | null>(
    null
  );
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRepayments, setLoadingRepayments] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [payForm, setPayForm] = useState({
    amount_paid: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "Cash" as "Cash" | "Bank Transfer",
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  async function fetchLoans() {
    setLoading(true);
    const { data } = await supabase
      .from("loans")
      .select("*, borrowers(full_name, phone)")
      .eq("status", "ACTIVE")
      .order("due_date", { ascending: true });

    if (data) setLoans(data as LoanWithBorrower[]);
    setLoading(false);
  }

  async function selectLoan(loan: LoanWithBorrower) {
    setSelectedLoan(loan);
    setLoadingRepayments(true);

    const { data } = await supabase
      .from("repayments")
      .select("*")
      .eq("loan_id", loan.id)
      .order("payment_date", { ascending: false });

    if (data) setRepayments(data);
    setLoadingRepayments(false);
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLoan) return;
    setSaving(true);

    const amount = parseFloat(payForm.amount_paid);

    if (amount > Number(selectedLoan.balance)) {
      alert(
        `Payment of ${formatCurrency(amount)} exceeds the remaining balance of ${formatCurrency(Number(selectedLoan.balance))}.`
      );
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("repayments").insert([{
      loan_id: selectedLoan.id,
      amount_paid: amount,
      payment_date: payForm.payment_date,
      payment_method: payForm.payment_method,
    }]);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setPayForm({
        amount_paid: "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "Cash",
      });
      setModalOpen(false);

      await fetchLoans();

      const { data: updatedLoan } = await supabase
        .from("loans")
        .select("*, borrowers(full_name, phone)")
        .eq("id", selectedLoan.id)
        .single();

      if (updatedLoan) {
        setSelectedLoan(updatedLoan as LoanWithBorrower);
        const { data: reps } = await supabase
          .from("repayments")
          .select("*")
          .eq("loan_id", selectedLoan.id)
          .order("payment_date", { ascending: false });
        if (reps) setRepayments(reps);
      } else {
        setSelectedLoan(null);
        setRepayments([]);
      }
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: "#0a3622" }} />
      </div>
    );
  }

  // ─── Detail view ───────────────────────────────
  if (selectedLoan) {
    const paidPercent = Math.round(
      (Number(selectedLoan.amount_paid) / Number(selectedLoan.total_due)) * 100
    );

    return (
      <div className="animate-fade-in">
        <button
          className="btn-ghost mb-5"
          onClick={() => {
            setSelectedLoan(null);
            setRepayments([]);
          }}
        >
          <ArrowLeft size={16} />
          Back to Active Loans
        </button>

        {/* Loan detail card */}
        <div className="card mb-6 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#1a1a1a" }}>
                {selectedLoan.borrowers.full_name}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
                {selectedLoan.borrowers.phone}
              </p>
            </div>
            <StatusBadge status={selectedLoan.status} />
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>
                Principal
              </p>
              <p className="text-lg font-bold" style={{ color: "#374151" }}>
                {formatCurrency(Number(selectedLoan.principal_amount))}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>
                Total Due
              </p>
              <p className="text-lg font-bold" style={{ color: "#374151" }}>
                {formatCurrency(Number(selectedLoan.total_due))}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>
                Paid
              </p>
              <p className="text-lg font-bold" style={{ color: "#059669" }}>
                {formatCurrency(Number(selectedLoan.amount_paid))}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>
                Balance
              </p>
              <p className="text-lg font-bold" style={{ color: "#d97706" }}>
                {formatCurrency(Number(selectedLoan.balance))}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs font-medium mb-1.5" style={{ color: "#6b7280" }}>
              <span>Repayment Progress</span>
              <span>{paidPercent}%</span>
            </div>
            <div
              className="h-2.5 w-full rounded-full overflow-hidden"
              style={{ background: "#e8e7df" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, paidPercent)}%`,
                  background: "linear-gradient(90deg, #0a3622, #00c46a)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Repayments section */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "#1a1a1a" }}>
            <Receipt size={18} style={{ color: "#0a3622" }} />
            Payment History
          </h3>
          {selectedLoan.status === "ACTIVE" && (
            <button
              className="btn-primary"
              onClick={() => setModalOpen(true)}
            >
              <CreditCard size={16} />
              Log Payment
            </button>
          )}
        </div>

        {loadingRepayments ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 size={24} className="animate-spin" style={{ color: "#0a3622" }} />
          </div>
        ) : repayments.length === 0 ? (
          <div className="card empty-state">
            <Receipt size={40} className="mx-auto mb-2" style={{ color: "#d1d5db" }} />
            <p className="text-sm" style={{ color: "#9ca3af" }}>
              No payments recorded yet for this loan.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Recorded</th>
                </tr>
              </thead>
              <tbody>
                {repayments.map((r) => (
                  <tr key={r.id}>
                    <td className="font-semibold" style={{ color: "#1a1a1a" }}>
                      {formatDate(r.payment_date)}
                    </td>
                    <td className="font-semibold" style={{ color: "#059669" }}>
                      {formatCurrency(Number(r.amount_paid))}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        {r.payment_method === "Cash" ? (
                          <Banknote size={14} style={{ color: "#059669" }} />
                        ) : (
                          <CreditCard size={14} style={{ color: "#0a3622" }} />
                        )}
                        {r.payment_method}
                      </span>
                    </td>
                    <td className="text-xs" style={{ color: "#9ca3af" }}>
                      {formatDate(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Log Payment Modal ─────────────────── */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Log a Payment"
        >
          <div
            className="mb-5 rounded-xl p-4"
            style={{
              background: "rgba(217, 119, 6, 0.06)",
              border: "1px solid rgba(217, 119, 6, 0.15)",
            }}
          >
            <p className="text-xs font-medium" style={{ color: "#6b7280" }}>
              Remaining balance for{" "}
              <span className="font-semibold" style={{ color: "#1a1a1a" }}>
                {selectedLoan.borrowers.full_name}
              </span>
            </p>
            <p className="text-xl font-bold mt-0.5" style={{ color: "#d97706" }}>
              {formatCurrency(Number(selectedLoan.balance))}
            </p>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="input-label">Amount Paid *</label>
              <input
                type="number"
                required
                min="0.01"
                max={Number(selectedLoan.balance)}
                step="0.01"
                className="input-field"
                placeholder={`Max: ${formatCurrency(Number(selectedLoan.balance))}`}
                value={payForm.amount_paid}
                onChange={(e) =>
                  setPayForm({ ...payForm, amount_paid: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">Payment Date *</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={payForm.payment_date}
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      payment_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="input-label">Payment Method *</label>
                <select
                  className="select-field"
                  value={payForm.payment_method}
                  onChange={(e) =>
                    setPayForm({
                      ...payForm,
                      payment_method: e.target.value as
                        | "Cash"
                        | "Bank Transfer",
                    })
                  }
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CreditCard size={16} />
                )}
                {saving ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // ─── Active loans list ─────────────────────────
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#1a1a1a" }}>
          <Receipt size={24} style={{ color: "#0a3622" }} />
          Repayment Ledger
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>
          Select an active loan to view payment history and log new payments.
        </p>
      </div>

      {loans.length === 0 ? (
        <div className="card empty-state">
          <Receipt size={40} className="mx-auto mb-2" style={{ color: "#d1d5db" }} />
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            No active loans to show. All loans have been paid off!
          </p>
        </div>
      ) : (
        <div className="stagger space-y-3">
          {loans.map((loan, i) => (
            <button
              key={loan.id}
              onClick={() => selectLoan(loan)}
              className="card w-full text-left p-5 flex items-center justify-between animate-fade-in group cursor-pointer"
              style={{ animationDelay: `${i * 60}ms` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(10, 54, 34, 0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0"
                  style={{
                    background: "rgba(10, 54, 34, 0.08)",
                  }}
                >
                  <span className="text-sm font-bold" style={{ color: "#0a3622" }}>
                    {loan.borrowers.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "#1a1a1a" }}>
                    {loan.borrowers.full_name}
                  </p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    Due {formatDate(loan.due_date)} · Principal{" "}
                    {formatCurrency(Number(loan.principal_amount))}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-medium" style={{ color: "#9ca3af" }}>Balance</p>
                  <p className="font-bold" style={{ color: "#d97706" }}>
                    {formatCurrency(Number(loan.balance))}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="transition-colors"
                  style={{ color: "#d1d5db" }}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
