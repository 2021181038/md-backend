import {
  EXCHANGE_RATES,
  PRICE_COEFFICIENTS,
  PRICE_CONFIG,
} from '../constants/config';

// MD 텍스트 파싱 (개선된 버전: 더 정확한 파싱)
export const parseMdText = (rawText, priceMode = "offline") => {
  const lines = rawText.split("\n").filter(line => {
    const trimmed = line.trim();
    // 빈 줄, 테이블 구분선, 헤더 등 제외
    return trimmed !== "" && 
           !trimmed.match(/^[|:\-\s]+$/) && 
           !trimmed.match(/^(No\.|번호|상품명|가격|Price)/i);
  });
  
  const ceilToNearestHundred = (num) => Math.ceil(num / PRICE_CONFIG.ROUND_TO_HUNDRED) * PRICE_CONFIG.ROUND_TO_HUNDRED;

  return lines.map((line) => {
    let match;
    const trimmedLine = line.trim();

    // 1) [번호] 상품명 - 가격 WON (가장 일반적인 형식)
    match = trimmedLine.match(/\[(\d+)\]\s*(.+?)\s*[-–—]\s*([\d,]+)\s*(WON|원|\u20a9|\uC6D0)?\s*$/i);
    if (match) {
      const rawPrice = Number(match[3].replace(/[^\d]/g, ""));
      if (rawPrice > 0) {
        let finalPrice;
        if (priceMode === "online") {
          finalPrice = Math.round(rawPrice * PRICE_COEFFICIENTS.ONLINE);
        } else {
          const methodA = ((rawPrice + PRICE_COEFFICIENTS.OFFLINE_FIXED_COST) / PRICE_COEFFICIENTS.OFFLINE_METHOD_A) / EXCHANGE_RATES.OFFLINE;
          const methodB = rawPrice * PRICE_COEFFICIENTS.OFFLINE_METHOD_B;
          finalPrice = ceilToNearestHundred(Math.max(methodA, methodB)) + PRICE_CONFIG.ADJUSTMENT;
        }
        return {
          name: `[${match[1]}] ${match[2].trim().replace(/[-\u2013\u2014:]+$/, "")}`,
          price: finalPrice.toString(),
          originalPriceKrw: rawPrice.toString(),
        };
      }
    }

    // 2) [번호] 상품명 가격 (공백으로 구분)
    match = trimmedLine.match(/\[(\d+)\]\s*(.+?)\s+([\d,]+)\s*(WON|원|\u20a9|\uC6D0)?\s*$/i);
    if (match) {
      const rawPrice = Number(match[3].replace(/[^\d]/g, ""));
      if (rawPrice > 0) {
        let finalPrice;
        if (priceMode === "online") {
          finalPrice = Math.round(rawPrice * PRICE_COEFFICIENTS.ONLINE);
        } else {
          const methodA = ((rawPrice + PRICE_COEFFICIENTS.OFFLINE_FIXED_COST) / PRICE_COEFFICIENTS.OFFLINE_METHOD_A) / EXCHANGE_RATES.OFFLINE;
          const methodB = rawPrice * PRICE_COEFFICIENTS.OFFLINE_METHOD_B;
          finalPrice = ceilToNearestHundred(Math.max(methodA, methodB)) + PRICE_CONFIG.ADJUSTMENT;
        }
        return {
          name: `[${match[1]}] ${match[2].trim().replace(/[-\u2013\u2014:]+$/, "")}`,
          price: finalPrice.toString(),
          originalPriceKrw: rawPrice.toString(),
        };
      }
    }

    // 3) 상품명 ₩가격 또는 상품명 가격원
    match = trimmedLine.match(/^(.+?)\s*[₩\u20a9](\d[\d,]*)|^(.+?)\s+(\d[\d,]+)\s*(원|\uC6D0)/);
    if (match) {
      const productName = match[1] || match[3];
      const priceStr = match[2] || match[4];
      const rawPrice = Number(priceStr.replace(/[^\d]/g, ""));
      if (rawPrice > 0 && productName) {
        let finalPrice;
        if (priceMode === "online") {
          finalPrice = Math.round(rawPrice * PRICE_COEFFICIENTS.ONLINE);
        } else {
          const methodA = ((rawPrice + PRICE_COEFFICIENTS.OFFLINE_FIXED_COST) / PRICE_COEFFICIENTS.OFFLINE_METHOD_A) / EXCHANGE_RATES.OFFLINE;
          const methodB = rawPrice * PRICE_COEFFICIENTS.OFFLINE_METHOD_B;
          finalPrice = ceilToNearestHundred(Math.max(methodA, methodB));
        }
        return {
          name: productName.trim().replace(/[-\u2013\u2014:]+$/, ""),
          price: finalPrice.toString(),
          originalPriceKrw: rawPrice.toString(),
          options: []
        };
      }
    }

    // 4) 매칭 안 되면 상품명만 추출 (가격은 빈 문자열)
    return { 
      name: trimmedLine.replace(/[-\u2013\u2014:]+$/, "").trim(), 
      price: "", 
      options: [] 
    };
  }).filter(item => item.name); // 빈 이름 제거
};

// 번호 부여 (없는 경우에만)
export const assignNumbers = (items) => {
  return items.map((item, idx) => {
    if (/^\[\d+\]/.test(item.name)) {
      return item;
    } else {
      return { ...item, name: `[${idx + 1}] ${item.name}` };
    }
  });
};

