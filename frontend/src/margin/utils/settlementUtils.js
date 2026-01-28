export const summarizeOrders = (csvData, selectedNames) => {
  const filtered = csvData.filter((row) =>
    selectedNames.includes(row["상품명"])
  );

  const merged = {};
  filtered.forEach((row) => {
    const option = row["옵션정보"];
    const qty = Number(row["수량"]) || 0;
    if (!merged[option]) merged[option] = 0;
    merged[option] += qty;
  });

  const summaryArr = Object.entries(merged).map(([option, qty]) => ({
    option,
    qty,
  }));

  summaryArr.sort((a, b) => {
    const numA = parseInt(a.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
    const numB = parseInt(b.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
    return numA - numB;
  });

  return summaryArr;
};

export const matchSettlement = (summary, settlementData) => {
  const result = summary.map((item) => {
    const sameOptionsAll = settlementData.filter(
      (row) => row["옵션정보"] === item.option
    );

    if (sameOptionsAll.length === 0) {
      return {
        ...item,
        minSettle: "데이터 없음",
        maxSettle: "데이터 없음",
        minPay: "데이터 없음",
        maxPay: "데이터 없음",
      };
    }

    const singleQtyRows = sameOptionsAll.filter(
      (row) => Number(row["수량"]) === 1
    );
    let targetRows = singleQtyRows;
    
    if (targetRows.length === 0) {
      const validRows = sameOptionsAll.filter(
        (r) => !isNaN(Number(r["수량"])) && Number(r["수량"]) > 0
      );
      if (validRows.length === 0) {
        return {
          ...item,
          minSettle: "수량 데이터 없음",
          maxSettle: "수량 데이터 없음",
          minPay: "수량 데이터 없음",
          maxPay: "수량 데이터 없음",
        };
      }
      const minQty = Math.min(...validRows.map((r) => Number(r["수량"])));
      targetRows = validRows.filter((r) => Number(r["수량"]) === minQty);
      targetRows = targetRows.map((r) => {
        const settle = Number(String(r["정산금액"]).replace(/[^\d.-]/g, ""));
        const pay = Number(String(r["상품결제금"]).replace(/[^\d.-]/g, ""));
        const qty = Number(r["수량"]);
        return {
          ...r,
          정산금액: qty > 0 ? (settle / qty).toFixed(2) : settle,
          상품결제금: qty > 0 ? (pay / qty).toFixed(2) : pay,
        };
      });
    }

    const settleValues = targetRows
      .map((row) => Number(String(row["정산금액"]).replace(/[^\d.-]/g, "")))
      .filter((n) => !isNaN(n) && n > 0);

    const payValues = targetRows
      .map((row) => Number(String(row["상품결제금"]).replace(/[^\d.-]/g, "")))
      .filter((n) => !isNaN(n) && n > 0);

    if (settleValues.length === 0 || payValues.length === 0) {
      return {
        ...item,
        minSettle: "유효 데이터 없음",
        maxSettle: "유효 데이터 없음",
        minPay: "유효 데이터 없음",
        maxPay: "유효 데이터 없음",
      };
    }

    const minSettle = Math.min(...settleValues);
    const maxSettle = Math.max(...settleValues);
    const minPay = Math.min(...payValues);
    const maxPay = Math.max(...payValues);

    return {
      ...item,
      minSettle,
      maxSettle,
      minPay,
      maxPay,
    };
  });

  result.sort((a, b) => {
    const numA = parseInt(a.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
    const numB = parseInt(b.option.match(/\[(\d+)\]/)?.[1] || 0, 10);
    return numA - numB;
  });

  return result;
};

