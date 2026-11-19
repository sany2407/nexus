export const inr = (value: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(value),
  )}`;

export const inrCompact = (value: number) => {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)}Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return inr(value);
};

export const num = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(value),
  );

export const decimal = (value: number, digits = 1) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const relativeTime = (timestamp: number, now = Date.now()) => {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 3) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

export const clockTime = (date: Date, withSeconds = true) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
    hour12: false,
  }).format(date);

export const dayLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .toUpperCase();

export const pct = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

export const pad = (value: number, size = 2) =>
  String(value).padStart(size, "0");
