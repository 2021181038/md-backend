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

