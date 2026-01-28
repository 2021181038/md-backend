/**
 * 환경 변수 검증 유틸리티
 * 앱 시작 시 필수 환경 변수를 검증합니다.
 */

/**
 * 필수 환경 변수 목록
 */
const REQUIRED_ENV_VARS = {
  REACT_APP_API_BASE: {
    name: 'REACT_APP_API_BASE',
    description: 'API 서버 기본 URL',
    example: 'http://localhost:5000',
  },
};

/**
 * 환경 변수 검증 결과
 */
export class EnvValidationError extends Error {
  constructor(missingVars) {
    const message = `필수 환경 변수가 누락되었습니다:\n${missingVars.map(v => `  - ${v.name}: ${v.description}`).join('\n')}`;
    super(message);
    this.name = 'EnvValidationError';
    this.missingVars = missingVars;
  }
}

/**
 * 환경 변수 검증
 * @param {Object} customRequiredVars - 추가로 검증할 환경 변수 (선택)
 * @throws {EnvValidationError} 필수 환경 변수가 누락된 경우
 */
export const validateEnvVars = (customRequiredVars = {}) => {
  const allRequiredVars = { ...REQUIRED_ENV_VARS, ...customRequiredVars };
  const missingVars = [];

  for (const [key, config] of Object.entries(allRequiredVars)) {
    const value = process.env[key];

    if (!value || value.trim() === '') {
      missingVars.push({
        name: key,
        description: config.description || '설명 없음',
        example: config.example,
      });
    }
  }

  if (missingVars.length > 0) {
    throw new EnvValidationError(missingVars);
  }

  return true;
};

/**
 * 환경 변수 검증 및 에러 처리
 * 앱 시작 시 호출해야 합니다.
 * @param {Object} customRequiredVars - 추가로 검증할 환경 변수 (선택)
 */
export const validateAndHandleEnvVars = (customRequiredVars = {}) => {
  try {
    validateEnvVars(customRequiredVars);
    return true;
  } catch (error) {
    if (error instanceof EnvValidationError) {
      // 개발 환경에서는 콘솔에 상세 정보 출력
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 환경 변수 검증 실패:', error.message);
        console.error('\n다음 환경 변수를 설정해주세요:');
        error.missingVars.forEach(({ name, description, example }) => {
          console.error(`  ${name}: ${description}`);
          if (example) {
            console.error(`    예시: ${example}`);
          }
        });
        console.error('\n.env 파일 또는 환경 변수에 설정해주세요.');
      } else {
        // 프로덕션 환경에서는 사용자에게 알림
        console.error('환경 변수 설정 오류가 발생했습니다. 관리자에게 문의하세요.');
      }

      // 앱이 계속 실행되도록 하지 않고 에러를 throw
      throw error;
    }

    throw error;
  }
};

/**
 * 환경 변수 가져오기 (기본값 포함)
 * @param {string} key - 환경 변수 키
 * @param {string} defaultValue - 기본값
 * @returns {string}
 */
export const getEnvVar = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

/**
 * 환경 변수 가져오기 (필수)
 * @param {string} key - 환경 변수 키
 * @param {string} description - 설명 (에러 메시지용)
 * @returns {string}
 * @throws {Error} 환경 변수가 없을 경우
 */
export const getRequiredEnvVar = (key, description = '') => {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    throw new Error(`필수 환경 변수 '${key}'가 설정되지 않았습니다.${description ? ` (${description})` : ''}`);
  }

  return value;
};

