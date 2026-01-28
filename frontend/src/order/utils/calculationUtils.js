// 총 마진 계산
export const calculateTotalProfit = (eventOrders, margins, exchangeRate) => {
  return eventOrders.reduce((sum, row) => {
    const marginRow = margins.find((m) => m.option_name === row.option_name);
    const marginValue = marginRow ? marginRow.margin : 0;

    const needed = row.needed_qty ?? row.quantity ?? 0;
    const received = row.received_qty ?? 0;
    const total = needed + received;

    return sum + total * marginValue;
  }, 0);
};

// 총 수고비 계산
export const calculateTotalFee = (agents) => {
  return agents.reduce((sum, a) => sum + Number(a.fee || 0), 0);
};

