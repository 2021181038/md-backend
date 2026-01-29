export const extractText = (summary) => {
  if (summary.length === 0) return "";

  const text = summary
    .map((item) => {
      let clean = item.option
        .replace(/^OPTION:\s*/i, "")
        .replace(/\s*\/\s*TYPE:\s*/i, " ")
        .replace(/\([^)]*円[^)]*\)/g, "")
        .replace(/\s*-\s*$/, "")
        .trim();
      return `${clean} ${item.qty}`;
    })
    .join("\n");
  
  return text;
};

/**
 * 옵션정보를 파싱하여 메인 텍스트와 서브 텍스트로 분리
 * @param {string} optionText - 원본 옵션 정보
 * @returns {{main: string, sub: string}} - 메인 텍스트와 서브 텍스트
 */
export const parseOptionText = (optionText) => {
  if (!optionText) return { main: "", sub: "" };

  let cleaned = optionText;

  // 配送日程の内容に同意:... 부분 제거 (여러 패턴으로 시도)
  cleaned = cleaned.replace(/配送日程の内容に同意:[^/]*/g, "").trim();
  
  // キャンセルと払い戻し不可に同意:... 부분 제거
  cleaned = cleaned.replace(/キャンセルと払い戻し不可に同意:[^/]*/g, "").trim();
  
  // 남은 불필요한 / 제거 (연속된 / 또는 앞뒤 공백과 함께)
  cleaned = cleaned.replace(/\s*\/\s*\/\s*/g, " / ").trim();
  cleaned = cleaned.replace(/^\s*\/\s*/, "").trim();
  cleaned = cleaned.replace(/\s*\/\s*$/, "").trim();
  
  // OPTION:, MEMBER:, TYPE: 라벨 제거
  cleaned = cleaned
    .replace(/^OPTION:\s*/i, "")
    .replace(/\s*\/\s*MEMBER:\s*/i, " / ")
    .replace(/\s*\/\s*TYPE:\s*/i, " / ")
    .trim();

  // /를 기준으로 분리
  const parts = cleaned.split(" / ").filter(part => part.trim() !== "");

  if (parts.length === 0) {
    return { main: optionText, sub: "" };
  }

  const main = parts[0].trim();
  const sub = parts.slice(1).join(" / ").trim();

  return { main, sub };
};

