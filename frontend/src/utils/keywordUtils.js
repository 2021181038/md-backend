/**
 * 그룹명 기반 검색 키워드 생성 유틸리티
 */

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

  // 1. 소문자로 바꾼 버전: "nct 127"
  keywords.push(trimmed.toLowerCase());

  // 2. 소문자로 바꾸고 띄어쓰기 지운 버전: "nct127"
  keywords.push(trimmed.toLowerCase().replace(/\s+/g, ""));

  // 3. 그대로 두고 띄어쓰기 지운 버전: "NCT127"
  keywords.push(trimmed.replace(/\s+/g, ""));

  // 4. 띄어쓰기에 - 넣은 버전: "NCT-127", "nct-127"
  keywords.push(trimmed.replace(/\s+/g, "-"));
  keywords.push(trimmed.toLowerCase().replace(/\s+/g, "-"));

  // 중복 제거
  return [...new Set(keywords)];
};

/**
 * MD 타입인 경우 추가 키워드 생성
 * @param {string} groupName - 그룹명
 * @returns {Array<string>} MD 관련 키워드 배열
 */
export const generateMDKeywords = (groupName) => {
  const keywords = ["md"];

  if (groupName && groupName.trim()) {
    // 그룹명 + MD
    keywords.push(`${groupName.trim()} MD`);
  }

  return keywords;
};

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
  
  // MD인 경우 추가 키워드
  if (keywordType === "MD") {
    const mdKeywords = generateMDKeywords(groupName);
    return [...groupKeywords, ...mdKeywords];
  }

  return groupKeywords;
};

