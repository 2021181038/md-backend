/**
 * 날짜를 썸네일 형식으로 포맷 (예: 1月15日)
 * @param {string} isoDate - ISO 형식의 날짜 문자열
 * @returns {string} 포맷된 날짜 문자열 (예: "1月15日")
 */
export const formatThumbnailDate = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

/**
 * formatDateJP의 별칭 (호환성 유지)
 * @param {string} isoDate - ISO 형식의 날짜 문자열
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatDateJP = formatThumbnailDate;

/**
 * 마지막 저장 시간을 한국어 형식으로 포맷
 * @param {string} dateString - 날짜 문자열
 * @returns {string|null} 포맷된 날짜 문자열 또는 null
 */
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

