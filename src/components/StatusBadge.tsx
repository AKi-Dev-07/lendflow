const config: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: {
    bg: "rgba(139, 110, 78, 0.1)",
    text: "#8B6E4E",
    dot: "#8B6E4E",
  },
  PAID: {
    bg: "rgba(28, 24, 20, 0.06)",
    text: "#1C1814",
    dot: "#1C1814",
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
