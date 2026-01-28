import { PRICE_COEFFICIENTS } from '../../constants/config';

export const getRowHighlight = (rank, total) => {
  const upper = Math.round(total * PRICE_COEFFICIENTS.GROUP_HIGHLIGHT_RATIO); 
  const lower = upper; 

  const middleStart = upper + 1;
  const middleEnd = total - lower;
  const middleCount = middleEnd - middleStart + 1;
  const middleHalf = Math.floor(middleCount / 2);

  if (rank <= upper) return true; 
  if (rank >= total - lower + 1) {
    return rank < total - lower + 1 + lower / 2;
  }
  if (rank >= middleStart && rank < middleStart + middleHalf) return true;

  return false;
};

export const getMultiplier = (rank, total) => {
  const upper = Math.round(total * PRICE_COEFFICIENTS.GROUP_HIGHLIGHT_RATIO);
  const lower = upper;

  if (rank === 1) return 2.4;
  if (rank <= upper) return 2.2;
  if (rank > total - lower) return 1.3;
  return 1.6;
};

