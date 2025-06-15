export function convertToLocalTime(utcDate) {
  if (!utcDate) return null;

  const date = new Date(utcDate);

  const formatted = date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatted;
}
