# 상수 정의 (Constants Definition)

## 현재 하드코딩된 값들 (Currently Hardcoded Values)

### 환율 (Exchange Rates)
- `9.43`: 일부 계산에서 사용
- `9.42`: 일부 계산에서 사용
- **위치**: 여러 파일에 분산
- **제안**: `constants/exchangeRates.js`로 통합

### 가격 계산 계수 (Price Calculation Coefficients)
- `0.16`: 온라인 업로드 가격 변환 계수
- `0.2`: 현장구매 업로드 가격 변환 계수 (methodB)
- `0.58`: 현장구매 업로드 가격 변환 계수 (methodA)
- `1600`: 현장구매 업로드 가격 변환 상수
- **위치**: `utils/priceUtils.js`, 여러 컴포넌트
- **제안**: `constants/priceConfig.js`로 통합

### 이미지 처리 (Image Processing)
- `1080`: 최대 이미지 크기 (픽셀)
- `4`: 배치 크기 (이미지 처리 시)
- `0.9`: 이미지 품질 (0-1)
- **위치**: `utils/imageUtils.js`
- **제안**: `constants/imageConfig.js`로 통합

### UI 상수 (UI Constants)
- `50`: 상품명 최대 길이 (문자)
- `4`: 최대 멤버 수 (키워드 생성)
- `20`: 기본 옵션 수량
- **위치**: 여러 컴포넌트
- **제안**: `constants/uiConfig.js`로 통합

### API 설정 (API Configuration)
- `REACT_APP_API_BASE`: API 베이스 URL
- **위치**: 환경 변수
- **제안**: 환경 변수 검증 로직 추가

## 제안하는 상수 파일 구조 (Proposed Constants File Structure)

```javascript
// constants/config.js
export const EXCHANGE_RATES = {
  DEFAULT: 9.42,
  ALTERNATIVE: 9.43,
};

export const PRICE_CONFIG = {
  ONLINE: {
    CONVERSION_RATE: 0.16,
  },
  OFFLINE: {
    METHOD_A: {
      DIVISOR: 0.58,
      EXCHANGE_RATE: 9.42,
    },
    METHOD_B: {
      MULTIPLIER: 0.2,
    },
    CONSTANT: 1600,
  },
};

export const IMAGE_CONFIG = {
  MAX_SIZE: 1080,
  BATCH_SIZE: 4,
  QUALITY: 0.9,
};

export const UI_CONFIG = {
  PRODUCT_NAME_MAX_LENGTH: 50,
  MAX_MEMBERS: 4,
  DEFAULT_OPTION_QUANTITY: 20,
};

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE,
  TIMEOUT: 30000, // 30초
};
```

## 사용 예시 (Usage Example)

```javascript
// Before
const finalPrice = Math.round(rawPrice * 0.16);

// After
import { PRICE_CONFIG } from '../constants/config';
const finalPrice = Math.round(rawPrice * PRICE_CONFIG.ONLINE.CONVERSION_RATE);
```

## 이점 (Benefits)

1. **유지보수성**: 값 변경 시 한 곳만 수정
2. **가독성**: 의미 있는 이름으로 코드 이해도 향상
3. **테스트 용이성**: 상수 값을 쉽게 모킹 가능
4. **문서화**: 상수 파일 자체가 문서 역할

