const config: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: {
    bg: "rgba(220, 38, 38, 0.1)",
    text: "#DC2626",
    dot: "#DC2626",
  },
  PAID: {
    bg: "rgba(22, 163, 74, 0.1)",
    text: "#16A34A",
    dot: "#16A34A",
  },
  DEFAULTED: {
    bg: "rgba(180, 77, 77, 0.08)",
    text: "#b44d4d",
    dot: "#b44d4d",
  },
};

interface StatusBadgeProps {
  status: "ACTIVE" | "PAID" | "DEFAULTED";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.text, fontFamily: "'Jost', sans-serif" }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c.dot }}
      />
      {status}
    </span>
  );
}
