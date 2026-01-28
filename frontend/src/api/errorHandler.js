import { logApiError } from '../utils/logger';
import { showError } from '../utils/notification';

/**
 * API 에러 타입 정의
 */
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  constructor(message, status, type, originalError) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * HTTP 응답을 확인하고 에러가 있으면 throw
 * @param {Response} response - fetch 응답 객체
 * @returns {Promise<Response>}
 */
export const checkResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `서버 오류 (status: ${response.status})`;
    let errorData = null;

    try {
      errorData = await response.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // JSON 파싱 실패 시 기본 메시지 사용
    }

    const errorType = response.status >= 500 
      ? API_ERROR_TYPES.SERVER_ERROR 
      : API_ERROR_TYPES.CLIENT_ERROR;

    throw new ApiError(errorMessage, response.status, errorType, errorData);
  }

  return response;
};

/**
 * API 호출 래퍼 함수
 * @param {Function} apiCall - API 호출 함수
 * @param {Object} options - 옵션
 * @param {boolean} options.showErrorToast - 에러 토스트 표시 여부 (기본: true)
 * @param {boolean} options.logError - 에러 로깅 여부 (기본: true)
 * @param {string} options.endpoint - API 엔드포인트 (로깅용)
 * @returns {Promise<any>}
 */
export const handleApiCall = async (apiCall, options = {}) => {
  const {
    showErrorToast = true,
    logError: shouldLogError = true,
    endpoint = 'unknown',
  } = options;

  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new ApiError(
        '네트워크 연결을 확인해주세요.',
        0,
        API_ERROR_TYPES.NETWORK_ERROR,
        error
      );

      if (shouldLogError) {
        logApiError(networkError, endpoint);
      }

      if (showErrorToast) {
        showError(networkError.message);
      }

      throw networkError;
    }

    // ApiError인 경우
    if (error instanceof ApiError) {
      if (shouldLogError) {
        logApiError(error, endpoint);
      }

      if (showErrorToast) {
        showError(error.message);
      }

      throw error;
    }

    // 기타 에러
    const unknownError = new ApiError(
      error.message || '알 수 없는 오류가 발생했습니다.',
      null,
      API_ERROR_TYPES.UNKNOWN_ERROR,
      error
    );

    if (shouldLogError) {
      logApiError(unknownError, endpoint);
    }

    if (showErrorToast) {
      showError(unknownError.message);
    }

    throw unknownError;
  }
};

/**
 * JSON 응답 파싱 및 검증
 * @param {Response} response - fetch 응답 객체
 * @param {string} requiredField - 필수 필드명 (예: 'result', 'data')
 * @returns {Promise<any>}
 */
export const parseJsonResponse = async (response, requiredField = null) => {
  const data = await response.json();

  if (requiredField && !data[requiredField]) {
    throw new ApiError(
      `서버 응답에 필수 필드 '${requiredField}'가 없습니다.`,
      response.status,
      API_ERROR_TYPES.SERVER_ERROR,
      data
    );
  }

  if (data.error) {
    throw new ApiError(
      data.error,
      response.status,
      API_ERROR_TYPES.SERVER_ERROR,
      data
    );
  }

  return data;
};

/**
 * 표준화된 fetch 래퍼
 * @param {string} url - API URL
 * @param {Object} options - fetch 옵션
 * @param {Object} errorOptions - 에러 처리 옵션
 * @returns {Promise<any>}
 */
export const apiFetch = async (url, options = {}, errorOptions = {}) => {
  return handleApiCall(
    async () => {
      const response = await fetch(url, options);
      await checkResponse(response);
      return response;
    },
    {
      endpoint: url,
      ...errorOptions,
    }
  );
};

