import Papa from "papaparse";

export const parseCSV = (file, onComplete) => {
  Papa.parse(file, {
    header: true,
    encoding: "UTF-8",
    complete: (result) => {
      onComplete(result.data);
    },
  });
};

export const extractProductNames = (csvData) => {
  const names = [
    ...new Set(
      csvData.map(
        (row) => row["상품명"] || row["Product Name"] || row["Name"]
      )
    ),
  ].sort((a, b) => a.localeCompare(b, "ko"));
  return names;
};

export const summarizeOrders = (csvData, selectedNames) => {
  const filtered = csvData.filter((row) =>
    selectedNames.includes(row["상품명"] || row["Product Name"] || row["Name"])
  );

  const merged = {};
  filtered.forEach((row) => {
    const option = row["옵션정보"] || row["Option"] || "기타";
    const qty = Number(row["수량"] || row["Qty"] || 0);
    merged[option] = (merged[option] || 0) + qty;
  });

  const summaryArr = Object.entries(merged).map(([option, qty]) => ({
    option,
    qty,
  }));

  // [숫자] 기준 정렬
  summaryArr.sort((a, b) => {
    const numA = parseInt(a.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
    const numB = parseInt(b.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
    return numA - numB;
  });

  return summaryArr;
};

export const parseMarginCSV = (csvData) => {
  return csvData
    .filter((row) => row["옵션정보"] && row["마진"])
    .map((row) => ({
      option_name: row["옵션정보"].trim(),
      margin: Number(row["마진"]),
    }));
};

