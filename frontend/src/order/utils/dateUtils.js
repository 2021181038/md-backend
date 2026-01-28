export const formatLastSavedTime = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleString("ko-KR", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

