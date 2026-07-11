import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  accentColor: string;
  delay?: number;
}

export default function StatCard({
  label,
  value,
  icon,
  accentColor,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="card flex items-center gap-4 p-5 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon circle */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: `${accentColor}12`,
          border: `1px solid ${accentColor}20`,
          color: accentColor,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#7A6E64", fontFamily: "'Jost', sans-serif" }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-bold mt-0.5"
          style={{ color: "#1C1814", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
