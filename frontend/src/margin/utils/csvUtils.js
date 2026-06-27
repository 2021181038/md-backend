import Papa from "papaparse";

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
