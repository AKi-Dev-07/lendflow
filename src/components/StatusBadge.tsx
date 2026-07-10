const config: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: {
    bg: "rgba(0, 196, 106, 0.1)",
    text: "#059669",
    dot: "#00c46a",
  },
  PAID: {
    bg: "rgba(10, 54, 34, 0.08)",
    text: "#0a3622",
    dot: "#0a3622",
  },
  DEFAULTED: {
    bg: "rgba(220, 38, 38, 0.08)",
    text: "#dc2626",
    dot: "#dc2626",
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
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c.dot }}
      />
      {status}
    </span>
  );
}
