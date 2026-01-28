import { getRowHighlight } from './highlightUtils';

export const isRowHighlighted = (row, total) => {
  if (row.isHighlighted !== null) {
    return row.isHighlighted;
  }
  return getRowHighlight(row.rank, total);
};

export const calcPreviewResult = (set) => {
  const memberCount = set.rows.length;
  const purchaseCost = Number(set.basePrice) * memberCount;
  const highlightedRows = set.rows.filter(r =>
    isRowHighlighted(r, set.rows.length)
  );

  const expectedSales = highlightedRows.reduce(
    (acc, r) => acc + Number(r.priceKrw || 0),
    0
  );
  return { purchaseCost, expectedSales };
};

