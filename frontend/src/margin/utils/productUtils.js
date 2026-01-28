export const extractProductNames = (csvData) => {
  const names = [...new Set(csvData.map((row) => row["상품명"]))].sort((a, b) =>
    a.localeCompare(b, "ko")
  );
  return names;
};

