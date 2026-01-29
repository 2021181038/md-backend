import { DUTY_CONFIG, PROXY_FEE_CONFIG } from '../../constants/config';

export const calculateMargin = (row, costs, exchangeRate, divideMap, proxyApplied) => {
  const costWon = Number(costs[row.option]) || 0;
  // 계산용 숫자 값과 화면 표시용 값을 분리
  const numericCostYen = costWon > 0 ? Math.floor(costWon / exchangeRate) : 0;
  const costYen = costWon > 0 ? numericCostYen : "-";

  const minSettle = Number(row.minSettle);
  const maxSettle = Number(row.maxSettle);
  const minPay = Number(row.minPay);
  const maxPay = Number(row.maxPay);

  if (isNaN(minSettle) || isNaN(maxSettle) || isNaN(minPay) || isNaN(maxPay)) {
    return {
      costWon,
      costYen,
      avgSettle: "-",
      avgPay: "-",
      marginAvg: "-",
      totalMarginAvg: "-",
      proxyFee: "-",
    };
  }

  const divideValue = divideMap[row.option] || 1;
  const avgSettle = Math.floor(((minSettle + maxSettle) / 2) / divideValue);
  const avgPay = Math.floor(((minPay + maxPay) / 2) / divideValue);

  const autoDutyRate = avgPay > DUTY_CONFIG.AUTO_DUTY_THRESHOLD ? DUTY_CONFIG.AUTO_DUTY_RATE : 0;
  const autoDutyAmount = Math.floor(avgPay * autoDutyRate);

  let proxyFee = 0;
  if (proxyApplied[row.option]) {
    if (costWon <= PROXY_FEE_CONFIG.TIER_1_MAX) proxyFee = PROXY_FEE_CONFIG.TIER_1_FEE;
    else if (costWon <= PROXY_FEE_CONFIG.TIER_2_MAX) proxyFee = PROXY_FEE_CONFIG.TIER_2_FEE;
    else proxyFee = PROXY_FEE_CONFIG.TIER_3_FEE;
  }

  const marginAvg = Math.floor(
    avgSettle - numericCostYen - autoDutyAmount - (proxyFee / exchangeRate)
  );

  const totalMarginAvg = Math.floor(marginAvg * row.qty);
  
  return {
    costWon,
    costYen,
    avgSettle,
    avgPay,
    marginAvg,
    totalMarginAvg,
    proxyFee,
  };
};

export const calculateTotalMargin = (matchedSummary, costs, exchangeRate, dutyApplied, proxyApplied) => {
  if (matchedSummary.length === 0) return null;

  let totalSum = 0;
  let totalPayYen = 0;
  let totalSettleYen = 0;
  let totalCostWon = 0;
  matchedSummary.forEach((row) => {
    const costWon = Number(costs[row.option]) || 0;
    const costYen = costWon > 0 ? costWon / exchangeRate : 0;
    const minSettle = Number(row.minSettle);
    const maxSettle = Number(row.maxSettle);
    const minPay = Number(row.minPay);
    const maxPay = Number(row.maxPay);
    
    // 매입금 총합 계산 (원가 × 수량)
    totalCostWon += costWon * row.qty;
    
    if (!isNaN(minSettle) && !isNaN(maxSettle) && !isNaN(minPay) && !isNaN(maxPay)) {
      const avgSettle = Math.floor((minSettle + maxSettle) / 2);
      const avgPay = Math.floor((minPay + maxPay) / 2);
      const dutyRate = dutyApplied[row.option] ? DUTY_CONFIG.CLOTHES_DUTY_RATE : 0;
      const autoDutyRate = avgPay > DUTY_CONFIG.AUTO_DUTY_THRESHOLD ? DUTY_CONFIG.AUTO_DUTY_RATE : 0;
      const dutyAmount = Math.floor(avgPay * (dutyRate + autoDutyRate));
      const marginAvg = Math.floor(avgSettle - costYen - dutyAmount);
      totalSum += marginAvg * row.qty;
      totalPayYen += avgPay * row.qty;
      totalSettleYen += avgSettle * row.qty;
    }
  });

  let totalProxy = 0;
  matchedSummary.forEach((row) => {
    const costWon = Number(costs[row.option]) || 0;
    if (proxyApplied[row.option]) {
      if (costWon <= PROXY_FEE_CONFIG.TIER_1_MAX) totalProxy += PROXY_FEE_CONFIG.TIER_1_FEE * row.qty;
      else if (costWon <= PROXY_FEE_CONFIG.TIER_2_MAX) totalProxy += PROXY_FEE_CONFIG.TIER_2_FEE * row.qty;
      else totalProxy += PROXY_FEE_CONFIG.TIER_3_FEE * row.qty;
    }
  });

  const totalProxyYen = totalProxy / exchangeRate;
  const totalMarginWon = Math.ceil((totalSum * exchangeRate) - totalProxy);
  const totalPayWon = Math.ceil(totalPayYen * exchangeRate);
  const totalSettleWon = Math.ceil(totalSettleYen * exchangeRate);

  return {
    total: (totalSum - totalProxyYen).toFixed(2),
    totalWon: totalMarginWon.toLocaleString(),
    totalPayWon: totalPayWon.toLocaleString(),
    totalSettleWon: totalSettleWon.toLocaleString(),
    totalCostWon: Math.ceil(totalCostWon).toLocaleString(),
    totalProxyFee: totalProxy,
  };
};

