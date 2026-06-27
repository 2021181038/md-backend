const API_BASE = process.env.REACT_APP_API_BASE;

const WAKE_MAX_ATTEMPTS = 6;
const WAKE_TIMEOUT_MS = 45000;
const EXTRACT_MAX_ATTEMPTS = 5;
const EXTRACT_TIMEOUT_MS = 120000;
const WAKE_BACKOFF_MS = [3000, 6000, 12000, 12000, 12000, 12000];
const EXTRACT_BACKOFF_MS = [3000, 6000, 12000, 20000, 30000];

const ERROR_HINTS = {
  SERVER_UNAVAILABLE: "Render 서버가 깨어나는 중일 수 있습니다. 30~60초 후 다시 시도해주세요.",
  SERVER_TIMEOUT: "네트워크가 느리거나 서버 응답이 지연되고 있습니다.",
  OPENAI_AUTH: "Render → Environment → OPENAI_API_KEY 를 확인해주세요.",
  OPENAI_QUOTA: "platform.openai.com → Billing 에서 잔액을 확인해주세요.",
  OPENAI_RATE_LIMIT: "1~2분 기다린 뒤 다시 시도해주세요.",
  OPENAI_TIMEOUT: "이미지가 크거나 상품이 많으면 시간이 더 걸릴 수 있습니다.",
  OPENAI_CONNECTION: "OpenAI 서버 연결 문제입니다. 잠시 후 재시도해주세요.",
  OPENAI_SERVER: "OpenAI 측 일시적 오류입니다. 잠시 후 재시도해주세요.",
  OPENAI_ERROR: "같은 이미지로 한 번 더 시도해주세요.",
  MISSING_API_KEY: "Render 대시보드에 OPENAI_API_KEY 를 등록해주세요.",
  MISSING_IMAGES: "이미지를 선택한 뒤 다시 시도해주세요.",
  EMPTY_RESULT: "표가 잘 보이는 선명한 스크린샷으로 다시 시도해주세요.",
  NO_RESULT: "서버 응답에 상품 데이터가 없습니다.",
};

export class ExtractApiError extends Error {
  constructor(message, { code, retryable, status, hint } = {}) {
    super(message);
    this.name = "ExtractApiError";
    this.code = code;
    this.retryable = retryable;
    this.status = status;
    this.hint = hint;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const isRetryableStatus = (status) =>
  status >= 500 || status === 429 || status === 408 || status === 502 || status === 503 || status === 504;

const isRetryableError = (error) =>
  error?.name === "AbortError" ||
  error?.name === "TypeError" ||
  (typeof error?.message === "string" && error.message.toLowerCase().includes("fetch"));

const buildApiError = (payload, status, fallbackMessage) => {
  const code = payload?.code || (status >= 500 ? "SERVER_UNAVAILABLE" : "OPENAI_ERROR");
  const message = payload?.error || fallbackMessage;
  const retryable = payload?.retryable ?? isRetryableStatus(status);
  const hint = ERROR_HINTS[code];

  return new ExtractApiError(message, { code, retryable, status, hint });
};

const parseApiError = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return buildApiError(data, response.status, fallbackMessage);
  } catch {
    return new ExtractApiError(fallbackMessage, {
      code: response.status >= 500 ? "SERVER_UNAVAILABLE" : "OPENAI_ERROR",
      retryable: isRetryableStatus(response.status),
      status: response.status,
      hint: ERROR_HINTS.SERVER_UNAVAILABLE,
    });
  }
};

export const formatExtractError = (error) => {
  if (error instanceof ExtractApiError) {
    return error.hint ? `${error.message} (${error.hint})` : error.message;
  }

  if (error?.name === "AbortError") {
    return `요청 시간이 초과되었습니다. (${ERROR_HINTS.SERVER_TIMEOUT})`;
  }

  return error?.message || "상품 정보를 불러오지 못했습니다.";
};

const pingLegacyServer = async () => {
  const response = await fetchWithTimeout(
    `${API_BASE}/extract-md`,
    { method: "POST", body: new FormData() },
    WAKE_TIMEOUT_MS
  );

  if (response.status === 400) return true;
  if (response.ok) return true;
  return isRetryableStatus(response.status) ? false : true;
};

export const wakeServer = async (onProgress) => {
  for (let attempt = 0; attempt < WAKE_MAX_ATTEMPTS; attempt++) {
    onProgress?.(`서버 연결 중... (${attempt + 1}/${WAKE_MAX_ATTEMPTS})`);

    try {
      const healthResponse = await fetchWithTimeout(
        `${API_BASE}/health`,
        { method: "GET" },
        WAKE_TIMEOUT_MS
      );

      if (healthResponse.ok) return;

      if (healthResponse.status === 404 && (await pingLegacyServer())) {
        return;
      }

      if (!isRetryableStatus(healthResponse.status)) {
        throw await parseApiError(healthResponse, "서버 연결에 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof ExtractApiError && !error.retryable) {
        throw error;
      }
      if (!isRetryableError(error) && error?.name !== "AbortError") {
        throw error;
      }
    }

    if (attempt < WAKE_MAX_ATTEMPTS - 1) {
      await sleep(WAKE_BACKOFF_MS[attempt] ?? 12000);
    }
  }

  throw new ExtractApiError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.", {
    code: "SERVER_UNAVAILABLE",
    retryable: true,
    hint: ERROR_HINTS.SERVER_UNAVAILABLE,
  });
};

export const postExtractMd = async (formData, onProgress) => {
  let lastError = new ExtractApiError("상품 정보를 가져오지 못했습니다.", {
    code: "OPENAI_ERROR",
    retryable: true,
  });

  for (let attempt = 0; attempt < EXTRACT_MAX_ATTEMPTS; attempt++) {
    onProgress?.(`상품 정보 분석 중... (${attempt + 1}/${EXTRACT_MAX_ATTEMPTS})`);

    try {
      const response = await fetchWithTimeout(
        `${API_BASE}/extract-md`,
        { method: "POST", body: formData },
        EXTRACT_TIMEOUT_MS
      );

      if (!response.ok) {
        lastError = await parseApiError(response, `서버 오류 (${response.status})`);

        if (lastError.retryable && attempt < EXTRACT_MAX_ATTEMPTS - 1) {
          onProgress?.(`${lastError.message} — 재시도 중... (${attempt + 2}/${EXTRACT_MAX_ATTEMPTS})`);
          await sleep(EXTRACT_BACKOFF_MS[attempt] ?? 30000);
          continue;
        }

        throw lastError;
      }

      const data = await response.json();

      if (Array.isArray(data?.products)) {
        return { products: data.products };
      }

      if (!data?.result) {
        lastError = buildApiError(
          data?.error ? data : { code: "NO_RESULT", error: "서버에서 결과를 받지 못했습니다.", retryable: true },
          response.status,
          "서버에서 결과를 받지 못했습니다."
        );

        if (lastError.retryable && attempt < EXTRACT_MAX_ATTEMPTS - 1) {
          onProgress?.(`결과 없음 — 재시도 중... (${attempt + 2}/${EXTRACT_MAX_ATTEMPTS})`);
          await sleep(EXTRACT_BACKOFF_MS[attempt] ?? 30000);
          continue;
        }

        throw lastError;
      }

      return { text: data.result };
    } catch (error) {
      if (error instanceof ExtractApiError) {
        lastError = error;
        if (!error.retryable) {
          throw error;
        }
      } else {
        lastError = error;
      }

      if (attempt < EXTRACT_MAX_ATTEMPTS - 1 && (isRetryableError(error) || lastError?.retryable)) {
        onProgress?.(`연결 실패 — 재시도 중... (${attempt + 2}/${EXTRACT_MAX_ATTEMPTS})`);
        await sleep(EXTRACT_BACKOFF_MS[attempt] ?? 30000);
        continue;
      }

      if (error?.name === "AbortError") {
        throw new ExtractApiError("요청 시간이 초과되었습니다. 다시 시도해주세요.", {
          code: "SERVER_TIMEOUT",
          retryable: true,
          hint: ERROR_HINTS.SERVER_TIMEOUT,
        });
      }

      throw lastError instanceof ExtractApiError
        ? lastError
        : new ExtractApiError(formatExtractError(error), { code: "OPENAI_ERROR", retryable: true });
    }
  }

  throw lastError;
};
