"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import Modal from "@/components/Modal";
import type { Borrower, BorrowerInsert } from "@/lib/database.types";

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<BorrowerInsert>({
    full_name: "",
    phone: "",
    national_id: "",
    address: "",
  });

  useEffect(() => {
    fetchBorrowers();
  }, []);

  async function fetchBorrowers() {
    setLoading(true);
    const { data } = await supabase
      .from("borrowers")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBorrowers(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("borrowers").insert([form]);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setForm({ full_name: "", phone: "", national_id: "", address: "" });
      setModalOpen(false);
      fetchBorrowers();
    }
    setSaving(false);
  }

  const filtered = borrowers.filter(
    (b) =>
      b.full_name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      b.national_id.includes(search)
  );

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
            <Users size={24} style={{ color: "#8B6E4E" }} />
            Borrowers Directory
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#7A6E64" }}>
            {borrowers.length} borrower{borrowers.length !== 1 ? "s" : ""}{" "}
            registered
          </p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Add Borrower
        </button>
      </div>

      {/* ── Search ────────────────────────────── */}
      <div className="mb-5 relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "#7A6E64" }}
        />
        <input
          type="text"
          placeholder="Search by name, phone, or ID..."
          className="input-field pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Table ─────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card empty-state">
          <Users size={40} className="mx-auto mb-2" style={{ color: "#E2D9CE" }} />
          <p className="text-sm" style={{ color: "#7A6E64" }}>
            {search
              ? "No borrowers match your search."
              : "No borrowers yet. Add your first borrower to get started."}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Phone</th>
                <th>National ID</th>
                <th>Address</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td className="font-semibold" style={{ color: "#1C1814" }}>{b.full_name}</td>
                  <td>{b.phone}</td>
                  <td>
                    <code
                      className="rounded-md px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: "#F2EDE6", color: "#1C1814" }}
                    >
                      {b.national_id}
                    </code>
                  </td>
                  <td className="max-w-48 truncate">{b.address || "—"}</td>
                  <td className="text-xs" style={{ color: "#7A6E64" }}>
                    {formatDate(b.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add Borrower Modal ────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Borrower"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. John Doe"
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="input-label">Phone Number *</label>
            <input
              type="tel"
              required
              className="input-field"
              placeholder="e.g. +254 712 345 678"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </div>
          <div>
            <label className="input-label">National ID *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. 12345678"
              value={form.national_id}
              onChange={(e) =>
                setForm({ ...form, national_id: e.target.value })
              }
            />
          </div>
          <div>
            <label className="input-label">Address</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 123 Main St, Nairobi"
              value={form.address ?? ""}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
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
                <UserPlus size={16} />
              )}
              {saving ? "Saving..." : "Add Borrower"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
