import Papa from "papaparse";

export const parseOrderCSV = (file, onComplete) => {
  Papa.parse(file, {
    header: true,
    encoding: "UTF-8",
    complete: (result) => {
      const data = result.data.filter((row) => row["상품명"]);
      onComplete(data);
    },
  });
};

export const parseSettlementCSV = (file, onComplete) => {
  Papa.parse(file, {
    header: true,
    encoding: "UTF-8",
    complete: (result) => {
      const data = result.data.filter((row) => row["옵션정보"]);
      onComplete(data);
    },
  });
};

export const exportToCSV = (matchedSummary, calculateMargin) => {
  if (matchedSummary.length === 0) {
    alert("먼저 마진 계산을 완료해주세요!");
    return;
  }

  const rows = [["옵션정보", "마진"]];

  matchedSummary.forEach((row) => {
    const { marginAvg } = calculateMargin(row);
    rows.push([row.option, marginAvg]);
  });

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    rows.map((e) => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "margin_summary.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

