import {
  EXCHANGE_RATES,
  PRICE_COEFFICIENTS,
  PRICE_CONFIG,
} from '../constants/config';

/**
 * 숫자를 100의 배수로 올림
 * @param {number} num - 올림할 숫자
 * @returns {number} 100의 배수로 올림된 숫자
 */
export const ceilToNearestHundred = (num) => Math.ceil(num / PRICE_CONFIG.ROUND_TO_HUNDRED) * PRICE_CONFIG.ROUND_TO_HUNDRED;

/**
 * 엔화 가격의 끝 두 자리를 90으로 맞춤
 * @param {number} yen - 엔화 가격
 * @returns {number} 끝자리가 90으로 조정된 가격
 */
export const applyEnding90 = (yen) => {
  return Math.floor(yen / PRICE_CONFIG.ROUND_TO_HUNDRED) * PRICE_CONFIG.ROUND_TO_HUNDRED + PRICE_CONFIG.ENDING_90;
};

/**
 * 원화를 엔화로 변환 (현장구매 방식)
 * 두 가지 계산 방식 중 더 큰 값을 사용하고 100의 배수로 올림
 * @param {number} krwPrice - 원화 가격
 * @returns {number} 엔화 가격
 */
export const convertKrwToYenOffline = (krwPrice) => {
  const methodA = ((krwPrice + PRICE_COEFFICIENTS.OFFLINE_FIXED_COST) / PRICE_COEFFICIENTS.OFFLINE_METHOD_A) / EXCHANGE_RATES.OFFLINE;
  const methodB = krwPrice * PRICE_COEFFICIENTS.OFFLINE_METHOD_B;
  return ceilToNearestHundred(Math.max(methodA, methodB)) + PRICE_CONFIG.ADJUSTMENT;
};

/**
 * 원화를 엔화로 변환 (온라인 방식)
 * @param {number} krwPrice - 원화 가격
 * @returns {number} 엔화 가격
 */
export const convertKrwToYenOnline = (krwPrice) => {
  return Math.round(krwPrice * PRICE_COEFFICIENTS.ONLINE);
};

/**
 * 온라인 가격 계산 (원가 * 계수, 끝자리 90)
 * @param {number} rawPrice - 원가
 * @returns {number} 끝자리가 90으로 조정된 엔화 가격
 */
export const calculateOnlinePrice = (rawPrice) => {
  return Math.ceil((rawPrice * PRICE_COEFFICIENTS.ONLINE) / PRICE_CONFIG.ROUND_TO_HUNDRED) * PRICE_CONFIG.ROUND_TO_HUNDRED + PRICE_CONFIG.ADJUSTMENT;
};

/**
 * 앨범 업로드용: 원화를 엔화로 변환
 * 환율을 적용하고 끝자리를 90으로 조정
 * @param {number|string} krw - 원화 가격
 * @returns {number} 엔화 가격 (끝자리 90)
 */
export const convertToYen = (krw) => {
  if (!krw || Number(krw) <= 0) return 0;
  let yen = Math.round(Number(krw) / EXCHANGE_RATES.ALBUM);
  return applyEnding90(yen);
};

/**
 * 앨범 업로드용: 옵션 없는 상품 전용 엔화 변환
 * 배수 계수를 적용하고 끝자리를 90으로 조정
 * @param {number|string} krw - 원화 가격
 * @returns {number} 엔화 가격 (끝자리 90)
 */
export const convertSingleToYen = (krw) => {
  if (!krw || Number(krw) <= 0) return 0;
  let yen = Math.round(Number(krw) / EXCHANGE_RATES.ALBUM_SINGLE);
  yen = Math.round(yen * PRICE_COEFFICIENTS.ALBUM_SINGLE_MULTIPLIER);
  return Math.floor(yen / PRICE_CONFIG.ROUND_TO_HUNDRED) * PRICE_CONFIG.ROUND_TO_HUNDRED + PRICE_CONFIG.ENDING_90;
};

/**
 * 가격별로 상품을 그룹화
 * 비슷한 가격대의 상품들을 하나의 그룹으로 묶음
 * @param {Array<Object>} items - 그룹화할 상품 목록 (price 속성 필요)
 * @returns {Array<Object>} 그룹화된 상품 목록
 */
export const groupByCustomPrice = (items) => {
  const sorted = [...items].sort((a, b) => Number(a.price) - Number(b.price));
  let remaining = [...sorted];
  const groups = [];

  while (remaining.length > 0) {
    const prices = remaining.map(item => Number(item.price));
    const min = Math.min(...prices);
    const rawStandard = min * 2;
    const lowerBound = rawStandard * PRICE_COEFFICIENTS.GROUP_BOUND_LOWER;
    const upperBound = rawStandard * PRICE_COEFFICIENTS.GROUP_BOUND_UPPER;

    const group = remaining.filter(item => {
      const p = Number(item.price);
      return p >= lowerBound && p <= upperBound;
    });

    let standardPrice;
    if (group.length === 1) {
      standardPrice = Number(group[0].price);
    } else {
      const maxPrice = Math.max(...group.map(g => Number(g.price)));
      let raw = Math.round(maxPrice * PRICE_COEFFICIENTS.GROUP_STANDARD_MULTIPLIER);
      standardPrice = Math.ceil(raw / PRICE_CONFIG.ROUND_TO_HUNDRED) * PRICE_CONFIG.ROUND_TO_HUNDRED + PRICE_CONFIG.ADJUSTMENT;
    }

    const hasStandard = group.some(item => Number(item.price) === standardPrice);
    if (!hasStandard) {
      group.push({
        name: "–",
        price: standardPrice.toString(),
        quantity: 0
      });
    }

    const updatedGroup = group.map(item => ({
      ...item,
      diffFromStandard: Number(item.price) - standardPrice
    }));

    groups.push({ standardPrice, items: updatedGroup });

    const ids = new Set(group.map(g => g.name + g.price));
    remaining = remaining.filter(item => !ids.has(item.name + item.price));
  }

  return groups;
};

