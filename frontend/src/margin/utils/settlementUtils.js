export const summarizeOrders = (csvData, selectedNames) => {
  // 1단계: 선택한 상품명만 필터링 (수량은 아직 체크하지 않음)
  const filtered = csvData.filter((row) =>
    selectedNames.includes(row["상품명"])
  );

  // 2단계: 같은 옵션별로 합산하되, 수량이 양수인 행만 합산
  const merged = {};
  filtered.forEach((row) => {
    const option = row["옵션정보"];
    const qty = Number(row["수량"]) || 0;
    // 수량이 양수인 행만 합산 (음수 행은 무시)
    if (qty > 0) {
      if (!merged[option]) merged[option] = 0;
      merged[option] += qty;
    }
  });

  // 3단계: 최종 합산 결과가 양수인 옵션만 반환
  const summaryArr = Object.entries(merged)
    .filter(([option, qty]) => qty > 0)
    .map(([option, qty]) => ({
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
      (row) => row["옵션정보"] === item.option && Number(row["수량"]) > 0
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

