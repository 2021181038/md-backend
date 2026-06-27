import {
  EXCHANGE_RATES,
  PRICE_COEFFICIENTS,
  PRICE_CONFIG,
} from '../constants/config';
import { calculateOnlinePrice } from './priceUtils';

const ceilToNearestHundred = (num) =>
  Math.ceil(num / PRICE_CONFIG.ROUND_TO_HUNDRED) * PRICE_CONFIG.ROUND_TO_HUNDRED;

const toKrwNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  return Number(String(value).replace(/[^\d]/g, '')) || 0;
};

const applyPriceMode = (rawPrice, priceMode) => {
  if (!rawPrice || rawPrice <= 0) return '';

  if (priceMode === 'online') {
    return calculateOnlinePrice(rawPrice).toString();
  }

  const methodA =
    ((rawPrice + PRICE_COEFFICIENTS.OFFLINE_FIXED_COST) /
      PRICE_COEFFICIENTS.OFFLINE_METHOD_A) /
    EXCHANGE_RATES.OFFLINE;
  const methodB = rawPrice * PRICE_COEFFICIENTS.OFFLINE_METHOD_B;
  return (
    ceilToNearestHundred(Math.max(methodA, methodB)) + PRICE_CONFIG.ADJUSTMENT
  ).toString();
};

export const parseMdProducts = (products, priceMode = 'offline') => {
  if (!Array.isArray(products)) return [];

  return products
    .map((product) => {
      const name = String(product?.name || '').trim();
      if (!name) return null;

      const rawPrice = toKrwNumber(product?.price);
      const cleanName = name.replace(/^\[\d+\]\s*/, '').trim();

      return {
        name: cleanName,
        price: applyPriceMode(rawPrice, priceMode),
        originalPriceKrw: rawPrice > 0 ? rawPrice.toString() : '',
        options: [],
      };
    })
    .filter(Boolean);
};

export const parseMdResponse = (payload, priceMode = 'offline', textParser) => {
  if (payload?.products?.length) {
    return parseMdProducts(payload.products, priceMode);
  }

  const text = payload?.text ?? (typeof payload === 'string' ? payload : '');
  if (!text) return [];

  const parser = textParser || ((value) => parseMdText(value, priceMode));
  return parser(text);
};

// MD 텍스트 파싱 (JSON 실패 시 fallback)
export const parseMdText = (rawText, priceMode = "offline") => {
  const lines = rawText.split("\n").filter(line => {
    const trimmed = line.trim();
    return trimmed !== "" && 
           !trimmed.match(/^[|:\-\s]+$/) && 
           !trimmed.match(/^(No\.|번호|상품명|가격|Price)/i);
  });

  return lines.map((line) => {
    let match;
    const trimmedLine = line.trim();

    match = trimmedLine.match(/\[(\d+)\]\s*(.+?)\s*[-–—]\s*([\d,]+)\s*(WON|원|\u20a9|\uC6D0)?\s*$/i);
    if (match) {
      const rawPrice = toKrwNumber(match[3]);
      if (rawPrice > 0) {
        return {
          name: `[${match[1]}] ${match[2].trim().replace(/[-\u2013\u2014:]+$/, "")}`,
          price: applyPriceMode(rawPrice, priceMode),
          originalPriceKrw: rawPrice.toString(),
        };
      }
    }

    match = trimmedLine.match(/\[(\d+)\]\s*(.+?)\s+([\d,]+)\s*(WON|원|\u20a9|\uC6D0)?\s*$/i);
    if (match) {
      const rawPrice = toKrwNumber(match[3]);
      if (rawPrice > 0) {
        return {
          name: `[${match[1]}] ${match[2].trim().replace(/[-\u2013\u2014:]+$/, "")}`,
          price: applyPriceMode(rawPrice, priceMode),
          originalPriceKrw: rawPrice.toString(),
        };
      }
    }

    match = trimmedLine.match(/^(.+?)\s*[₩\u20a9](\d[\d,]*)|^(.+?)\s+(\d[\d,]+)\s*(원|\uC6D0)/);
    if (match) {
      const productName = match[1] || match[3];
      const rawPrice = toKrwNumber(match[2] || match[4]);
      if (rawPrice > 0 && productName) {
        return {
          name: productName.trim().replace(/[-\u2013\u2014:]+$/, ""),
          price: applyPriceMode(rawPrice, priceMode),
          originalPriceKrw: rawPrice.toString(),
          options: [],
        };
      }
    }

    return {
      name: trimmedLine.replace(/[-\u2013\u2014:]+$/, "").trim(),
      price: "",
      options: [],
    };
  }).filter(item => item.name);
};

export const assignNumbers = (items) => {
  return items.map((item, idx) => {
    if (/^\[\d+\]/.test(item.name)) {
      return item;
    }
    return { ...item, name: `[${idx + 1}] ${item.name}` };
  });
};
