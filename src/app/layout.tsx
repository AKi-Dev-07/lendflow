import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "MORGAN — Loan Management Dashboard",
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
        <AuthProvider>
          <ProtectedRoute>
            <AppLayout>{children}</AppLayout>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
