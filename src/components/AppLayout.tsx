"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <main
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#f3f2eb" }}
      >
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f3f2eb" }}>
      <Sidebar />
      <main className="ml-64 flex-1 px-8 py-7">{children}</main>
    </div>
  );
}
