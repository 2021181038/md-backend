// 옵션명 정리 (동의 문구 제거)
export const cleanOptionName = (optionName) => {
  if (!optionName) return "";

  let cleanName = optionName;

  const REMOVE_PATTERNS = [
    /\/\s*配送日程の内容に同意[^/]*/g,
    /\/\s*キャンセルと払い戻し不可に同意[^/]*/g,
  ];

  REMOVE_PATTERNS.forEach((pattern) => {
    cleanName = cleanName.replace(pattern, "");
  });

  cleanName = cleanName
    .replace(/TYPE:?/gi, "")
    .replace(/OPTION:?/gi, "")
    .replace(/\s*\/\s*$/, "")
    .trim();

  return cleanName;
};

// 옵션명 렌더링 (TYPE/OPTION 구조 처리)
export const renderOptionName = (optionName) => {
  const cleanName = cleanOptionName(optionName);
  if (!cleanName) return null;

  if (cleanName.includes("/")) {
    return (
      <>
        <div className="type-line">{cleanName.split("/")[0]}</div>
        <div className="sub-line">
          {cleanName.split("/").slice(1).join("/")}
        </div>
      </>
    );
  }

  return cleanName;
};

