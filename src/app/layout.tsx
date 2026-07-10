import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "LendFlow — Loan Management Dashboard",
  description:
    "A modern, local moneylending management system. Track borrowers, loans, and repayments in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen" style={{ backgroundColor: "#f3f2eb" }}>
          <Sidebar />
          <main className="ml-64 flex-1 px-8 py-7">{children}</main>
        </div>
      </body>
    </html>
  );
}
