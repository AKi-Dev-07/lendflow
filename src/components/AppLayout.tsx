"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <main
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#F9F6F2" }}
      >
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: "#F9F6F2" }}>
      {/* ── Mobile Top Bar ────────────────────── */}
      <div 
        className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30 shadow-sm" 
        style={{ backgroundColor: "#1C1814" }}
      >
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
            <Image src="/logo.png" alt="MORGAN Logo" fill className="object-cover" />
          </div>
          <h1 
            className="text-lg font-bold text-white tracking-tight" 
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            MORGAN
          </h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="text-white p-1 rounded-lg transition-colors hover:bg-white/10"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Sidebar (Desktop & Mobile Drawer) ─── */}
      <>
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar Container */}
        <div 
          className={`
            fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 cubic-bezier(0.22, 1, 0.36, 1)
            md:translate-x-0 md:z-40
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <Sidebar onClose={() => setMobileMenuOpen(false)} />
        </div>
      </>

      {/* ── Main Content ──────────────────────── */}
      <main className="flex-1 w-full md:ml-64 px-4 py-6 md:px-8 md:py-7 overflow-x-hidden">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
