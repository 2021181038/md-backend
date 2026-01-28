/**
 * 로깅 유틸리티
 * 개발/프로덕션 환경별 로깅 전략 제공
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 에러 로깅
 * @param {Error|string} error - 에러 객체 또는 에러 메시지
 * @param {Object} context - 추가 컨텍스트 정보
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  if (isDevelopment) {
    // 개발 환경: 콘솔에 상세 정보 출력
    console.error('🚨 Error:', errorInfo);
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    if (Object.keys(context).length > 0) {
      console.error('Context:', context);
    }
  } else {
    // 프로덕션 환경: 콘솔에 최소한의 정보만 출력
    console.error('Error:', errorInfo.message);
    
    // TODO: 필요시 외부 에러 트래킹 서비스(Sentry 등)로 전송
    // sendToErrorTracking(errorInfo);
  }

  return errorInfo;
};

/**
 * 경고 로깅
 * @param {string} message - 경고 메시지
 * @param {Object} context - 추가 컨텍스트 정보
 */
/**
 * 경고를 로깅 (개발 환경에서만)
 * @param {string} message - 경고 메시지
 * @param {Object} context - 추가 컨텍스트 정보
 */
export const logWarning = (message, context = {}) => {
  if (isDevelopment) {
    console.warn('⚠️ Warning:', message, context);
  }
};

/**
 * 정보 로깅
 * @param {string} message - 정보 메시지
 * @param {Object} data - 추가 데이터
 */
export const logInfo = (message, data = {}) => {
  if (isDevelopment) {
    console.log('ℹ️ Info:', message, data);
  }
};

/**
 * 디버그 로깅
 * @param {string} message - 디버그 메시지
 * @param {Object} data - 추가 데이터
 */
export const logDebug = (message, data = {}) => {
  if (isDevelopment) {
    console.debug('🔍 Debug:', message, data);
  }
};

/**
 * API 에러 로깅 (특별 처리)
 * @param {Error|string} error - 에러 객체 또는 에러 메시지
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} requestData - 요청 데이터
 */
export const logApiError = (error, endpoint, requestData = {}) => {
  logError(error, {
    type: 'API_ERROR',
    endpoint,
    requestData,
  });
};

/**
 * 사용자 액션 로깅 (선택적)
 * @param {string} action - 액션 이름
 * @param {Object} data - 액션 데이터
 */
export const logUserAction = (action, data = {}) => {
  if (isDevelopment) {
    console.log('👤 User Action:', action, data);
  }
  // 프로덕션에서는 분석 도구로 전송 가능
};

