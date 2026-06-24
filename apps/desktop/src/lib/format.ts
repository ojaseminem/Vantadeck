// Formats the backend's "last opened" timestamp for display. The backend stores
// a UTC timestamp ("YYYY-MM-DD HH:MM:SS"); demo data uses already-friendly
// strings, which are passed through unchanged.
export function formatLastOpened(value?: string | null): string {
  if (!value) return "";
  const iso = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  const now = new Date();
  const diffSeconds = Math.max(0, (now.getTime() - date.getTime()) / 1000);
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  if (diffSeconds < 7 * 86400) return `${Math.floor(diffSeconds / 86400)} days ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

/// Compact relative age from a UNIX epoch (seconds), e.g. "5m ago", "2h ago".
export function timeAgo(epochSeconds: number): string {
  if (!epochSeconds) return "";
  const diff = Math.max(0, Date.now() / 1000 - epochSeconds);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
