/**
 * 그룹명 기반 검색 키워드 생성 유틸리티
 */

const TYPE_LABELS = {
  "ペンライト": ["ペンライト"],
  "アルバム": ["アルバム", "CD"],
  "フォトカード": ["フォトカード"],
  MD: ["md"],
};

/**
 * 그룹명으로부터 검색 키워드 생성
 * @param {string} groupName - 그룹명 (예: "NCT 127")
 * @returns {Array<string>} 생성된 키워드 배열
 */
export const generateGroupKeywords = (groupName) => {
  if (!groupName || !groupName.trim()) {
    return [];
  }

  const trimmed = groupName.trim();
  const keywords = [];

  keywords.push(trimmed.toLowerCase());
  keywords.push(trimmed.toLowerCase().replace(/\s+/g, ""));
  keywords.push(trimmed.replace(/\s+/g, ""));
  keywords.push(trimmed.replace(/\s+/g, "-"));
  keywords.push(trimmed.toLowerCase().replace(/\s+/g, "-"));

  return [...new Set(keywords)];
};

/**
 * 카테고리별 추가 키워드 생성
 * @param {string} groupName - 그룹명
 * @param {string} keywordType - 키워드 타입
 * @returns {Array<string>} 카테고리 관련 키워드 배열
 */
export const generateTypeKeywords = (groupName, keywordType) => {
  const labels = TYPE_LABELS[keywordType];
  if (!labels?.length) return [];

  const trimmed = groupName.trim();
  const keywords = [...labels];

  labels.forEach((label) => {
    if (keywordType === "MD") {
      keywords.push(`${trimmed} MD`);
    } else {
      keywords.push(`${trimmed} ${label}`);
    }
  });

  return keywords;
};

/**
 * MD 타입인 경우 추가 키워드 생성
 * @param {string} groupName - 그룹명
 * @returns {Array<string>} MD 관련 키워드 배열
 */
export const generateMDKeywords = (groupName) =>
  generateTypeKeywords(groupName, "MD");

/**
 * 전체 검색 키워드 생성 (그룹명 기반)
 * @param {string} groupName - 그룹명
 * @param {string} keywordType - 키워드 타입 ("MD", "ペンライト", "アルバム", "フォトカード" 등)
 * @returns {Array<string>} 생성된 키워드 배열
 */
export const generateAllKeywords = (groupName, keywordType = "") => {
  if (!groupName || !groupName.trim()) {
    return [];
  }

  const groupKeywords = generateGroupKeywords(groupName);
  const typeKeywords = generateTypeKeywords(groupName, keywordType);

  return [...new Set([...groupKeywords, ...typeKeywords])];
};
