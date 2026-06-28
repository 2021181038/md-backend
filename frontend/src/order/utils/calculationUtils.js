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

