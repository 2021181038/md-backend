/**
 * 애플리케이션 상수 설정
 * 모든 하드코딩된 값들을 한 곳에서 관리
 */

// 환율 설정
export const EXCHANGE_RATES = {
  OFFLINE: 9.42,      // 현장구매 환율
  ONLINE: 9.42,        // 온라인 환율 (마진 계산기)
  ALBUM: 9.32,         // 앨범 업로드 환율
  ALBUM_SINGLE: 9.42,  // 앨범 업로드 단일 상품 환율
  ORDER: 9.43,         // 주문 관리 환율
};

// 가격 계산 계수
export const PRICE_COEFFICIENTS = {
  ONLINE: 0.16,        // 온라인 가격 계산 계수
  OFFLINE_METHOD_A: 0.58,  // 현장구매 방법 A 계수
  OFFLINE_METHOD_B: 0.2,   // 현장구매 방법 B 계수
  OFFLINE_FIXED_COST: 1600, // 현장구매 고정 비용
  ALBUM_SINGLE_MULTIPLIER: 1.6, // 앨범 단일 상품 배수
  GROUP_STANDARD_MULTIPLIER: 0.68, // 그룹 표준 가격 배수
  GROUP_BOUND_LOWER: 0.5,   // 그룹 하한선
  GROUP_BOUND_UPPER: 1.5,   // 그룹 상한선
  GROUP_HIGHLIGHT_RATIO: 0.25, // 그룹 하이라이트 비율
};

// 이미지 처리 설정
export const IMAGE_CONFIG = {
  MAX_SIZE: 1080,      // 최대 이미지 크기 (픽셀)
  BATCH_SIZE: 4,       // 이미지 배치 크기
  QUALITY: 0.9,        // 이미지 압축 품질
};

// 가격 계산 설정
export const PRICE_CONFIG = {
  ROUND_TO_HUNDRED: 100,  // 100의 배수로 올림
  ENDING_90: 90,          // 끝자리 90
  ADJUSTMENT: -10,         // 가격 조정값
};

// 관세 설정
export const DUTY_CONFIG = {
  AUTO_DUTY_THRESHOLD: 16500,  // 자동 관세 적용 임계값 (엔)
  AUTO_DUTY_RATE: 0.05,        // 자동 관세율 (5%)
  CLOTHES_DUTY_RATE: 0.12,     // 옷 관세율 (12%)
};

// 대리비 설정
export const PROXY_FEE_CONFIG = {
  TIER_1_MAX: 14000,    // 1단계 최대 금액 (원)
  TIER_1_FEE: 1000,     // 1단계 대리비 (원)
  TIER_2_MAX: 39000,    // 2단계 최대 금액 (원)
  TIER_2_FEE: 2000,     // 2단계 대리비 (원)
  TIER_3_FEE: 3000,     // 3단계 대리비 (원)
};

// 날짜 포맷 설정
export const DATE_FORMAT = {
  LOCALE: 'ko-KR',
  HOUR_12: false,
};

// 기본값
export const DEFAULTS = {
  DIVIDE_VALUE: 1,      // 기본 분할값
  EMPTY_PRICE: '',      // 빈 가격
  EMPTY_STRING: '',     // 빈 문자열
};

