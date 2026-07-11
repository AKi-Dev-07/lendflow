"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Landmark,
  Plus,
  Loader2,
  Calculator,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import type { Borrower, LoanWithBorrower } from "@/lib/database.types";

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanWithBorrower[]>([]);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [form, setForm] = useState({
    borrower_id: "",
    principal_amount: "",
    interest_rate: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const [loansRes, borrowersRes] = await Promise.all([
      supabase
        .from("loans")
        .select("*, borrowers(full_name, phone)")
        .order("created_at", { ascending: false }),
      supabase.from("borrowers").select("*").order("full_name"),
    ]);

    if (loansRes.data) setLoans(loansRes.data as LoanWithBorrower[]);
    if (borrowersRes.data) setBorrowers(borrowersRes.data);
    setLoading(false);
  }

  const totalDue = useMemo(() => {
    const p = parseFloat(form.principal_amount) || 0;
    const r = parseFloat(form.interest_rate) || 0;
    return p + p * (r / 100);
  }, [form.principal_amount, form.interest_rate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const principal = parseFloat(form.principal_amount);
    const rate = parseFloat(form.interest_rate);
    const computed = principal + principal * (rate / 100);

    const { error } = await supabase.from("loans").insert([{
      borrower_id: form.borrower_id,
      principal_amount: principal,
      interest_rate: rate,
      total_due: computed,
      balance: computed,
      issue_date: form.issue_date,
      due_date: form.due_date,
    }]);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setForm({
        borrower_id: "",
        principal_amount: "",
        interest_rate: "",
        issue_date: new Date().toISOString().split("T")[0],
        due_date: "",
      });
      setModalOpen(false);
      fetchData();
    }
    setSaving(false);
  }

  const filtered = loans.filter((loan) => {
    const matchesSearch =
      loan.borrowers.full_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      loan.borrowers.phone.includes(search);
    const matchesStatus =
      statusFilter === "ALL" || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: "#8B6E4E" }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* ── Header ────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: "#1C1814", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            <Landmark size={24} style={{ color: "#8B6E4E" }} />
            Loan Management
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#7A6E64" }}>
            {loans.length} loan{loans.length !== 1 ? "s" : ""} issued
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setModalOpen(true)}
          disabled={borrowers.length === 0}
        >
          <Plus size={16} />
          Issue New Loan
        </button>
      </div>

      {/* ── Filters ───────────────────────────── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "#7A6E64" }}
          />
          <input
            type="text"
            placeholder="Search by borrower name or phone..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select-field sm:w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAID">Paid</option>
          <option value="DEFAULTED">Defaulted</option>
        </select>
      </div>

      {/* ── Table ─────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card empty-state">
          <Landmark size={40} className="mx-auto mb-2" style={{ color: "#E2D9CE" }} />
          <p className="text-sm" style={{ color: "#7A6E64" }}>
            {search || statusFilter !== "ALL"
              ? "No loans match your filters."
              : "No loans issued yet. Create your first loan to begin."}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Principal</th>
                <th>Rate</th>
                <th>Total Due</th>
                <th>Balance</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((loan) => (
                <tr key={loan.id}>
                  <td className="font-semibold" style={{ color: "#1C1814" }}>
                    {loan.borrowers.full_name}
                  </td>
                  <td>{formatCurrency(Number(loan.principal_amount))}</td>
                  <td>{Number(loan.interest_rate)}%</td>
                  <td className="font-semibold" style={{ color: "#1C1814" }}>
                    {formatCurrency(Number(loan.total_due))}
                  </td>
                  <td
                    className="font-semibold"
                    style={{
                      color:
                        Number(loan.balance) > 0 ? "#C8A882" : "#8B6E4E",
                    }}
                  >
                    {formatCurrency(Number(loan.balance))}
                  </td>
                  <td className="text-xs" style={{ color: "#7A6E64" }}>
                    {formatDate(loan.issue_date)}
                  </td>
                  <td className="text-xs" style={{ color: "#7A6E64" }}>
                    {formatDate(loan.due_date)}
                  </td>
                  <td>
                    <StatusBadge status={loan.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Issue Loan Modal ──────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue New Loan"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Borrower *</label>
            <select
              required
              className="select-field"
              value={form.borrower_id}
              onChange={(e) =>
                setForm({ ...form, borrower_id: e.target.value })
              }
            >
              <option value="" disabled>
                Select a borrower...
              </option>
              {borrowers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.full_name} — {b.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Principal Amount *</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                className="input-field"
                placeholder="e.g. 5000"
                value={form.principal_amount}
                onChange={(e) =>
                  setForm({ ...form, principal_amount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="input-label">Interest Rate (%) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="input-field"
                placeholder="e.g. 10"
                value={form.interest_rate}
                onChange={(e) =>
                  setForm({ ...form, interest_rate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Auto-calculated Total Due */}
          <div
            className="flex items-center gap-3 rounded-xl p-3.5"
            style={{
              background: "rgba(139, 110, 78, 0.06)",
              border: "1px solid rgba(139, 110, 78, 0.12)",
            }}
          >
            <Calculator size={18} style={{ color: "#8B6E4E" }} />
            <div>
              <p className="text-xs font-medium" style={{ color: "#7A6E64" }}>
                Total Due (auto-calculated)
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "#8B6E4E", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {formatCurrency(totalDue)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Issue Date *</label>
              <input
                type="date"
                required
                className="input-field"
                value={form.issue_date}
                onChange={(e) =>
                  setForm({ ...form, issue_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="input-label">Due Date *</label>
              <input
                type="date"
                required
                className="input-field"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value })
                }
              />
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
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Landmark size={16} />
              )}
              {saving ? "Issuing..." : "Issue Loan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
