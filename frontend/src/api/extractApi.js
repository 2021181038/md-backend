const API_BASE = process.env.REACT_APP_API_BASE;

const WAKE_MAX_ATTEMPTS = 6;
const WAKE_TIMEOUT_MS = 45000;
const EXTRACT_MAX_ATTEMPTS = 5;
const EXTRACT_TIMEOUT_MS = 120000;
const WAKE_BACKOFF_MS = [3000, 6000, 12000, 12000, 12000, 12000];
const EXTRACT_BACKOFF_MS = [3000, 6000, 12000, 20000, 30000];

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

const parseErrorMessage = async (response, fallback) => {
  try {
    const data = await response.json();
    if (data?.error) return data.error;
  } catch {
    // ignore JSON parse errors
  }
  return fallback;
};

const pingLegacyServer = async () => {
  const response = await fetchWithTimeout(
    `${API_BASE}/extract-md`,
    { method: "POST", body: new FormData() },
    WAKE_TIMEOUT_MS
  );

  // 서버가 깨어 있으면 이미지 없음(400) 또는 라우트 응답이 옴
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

      // 구버전 서버(/health 미배포) fallback
      if (healthResponse.status === 404 && (await pingLegacyServer())) {
        return;
      }

      if (!isRetryableStatus(healthResponse.status)) {
        throw new Error(await parseErrorMessage(healthResponse, "서버 연결에 실패했습니다."));
      }
    } catch (error) {
      if (!isRetryableError(error) && error?.name !== "AbortError") {
        throw error;
      }
    }

    if (attempt < WAKE_MAX_ATTEMPTS - 1) {
      await sleep(WAKE_BACKOFF_MS[attempt] ?? 12000);
    }
  }

  throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
};

export const postExtractMd = async (formData, onProgress) => {
  let lastError = new Error("상품 정보를 가져오지 못했습니다.");

  for (let attempt = 0; attempt < EXTRACT_MAX_ATTEMPTS; attempt++) {
    onProgress?.(`상품 정보 분석 중... (${attempt + 1}/${EXTRACT_MAX_ATTEMPTS})`);

    try {
      const response = await fetchWithTimeout(
        `${API_BASE}/extract-md`,
        { method: "POST", body: formData },
        EXTRACT_TIMEOUT_MS
      );

      if (!response.ok) {
        lastError = new Error(
          await parseErrorMessage(response, `서버 오류 (${response.status})`)
        );

        if (isRetryableStatus(response.status) && attempt < EXTRACT_MAX_ATTEMPTS - 1) {
          onProgress?.(`응답 지연 — 재시도 중... (${attempt + 2}/${EXTRACT_MAX_ATTEMPTS})`);
          await sleep(EXTRACT_BACKOFF_MS[attempt] ?? 30000);
          continue;
        }

        throw lastError;
      }

      const data = await response.json();

      if (!data?.result) {
        lastError = new Error("서버에서 결과를 받지 못했습니다.");
        if (attempt < EXTRACT_MAX_ATTEMPTS - 1) {
          onProgress?.(`결과 없음 — 재시도 중... (${attempt + 2}/${EXTRACT_MAX_ATTEMPTS})`);
          await sleep(EXTRACT_BACKOFF_MS[attempt] ?? 30000);
          continue;
        }
        throw lastError;
      }

      return data.result;
    } catch (error) {
      lastError = error;

      if (attempt < EXTRACT_MAX_ATTEMPTS - 1 && isRetryableError(error)) {
        onProgress?.(`연결 실패 — 재시도 중... (${attempt + 2}/${EXTRACT_MAX_ATTEMPTS})`);
        await sleep(EXTRACT_BACKOFF_MS[attempt] ?? 30000);
        continue;
      }

      if (error?.name === "AbortError") {
        throw new Error("요청 시간이 초과되었습니다. 다시 시도해주세요.");
      }

      throw error;
    }
  }

  throw lastError;
};
