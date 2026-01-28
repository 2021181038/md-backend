const API_BASE = process.env.REACT_APP_API_BASE;

// 재시도 로직이 포함된 extractMD 함수
export const extractMD = async (formData, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/extract-md`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // 5xx 에러는 재시도, 4xx 에러는 즉시 실패
        if (response.status >= 500 && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // 지수 백오프
          continue;
        }
        throw new Error(`서버 오류 (status: ${response.status})`);
      }

      const data = await response.json();

      if (!data?.result) {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error("서버에서 결과를 받지 못했습니다.");
      }

      return data.result;
    } catch (error) {
      // 네트워크 에러나 기타 에러는 재시도
      if (attempt < retries && (error.name === 'TypeError' || error.message.includes('fetch'))) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
};

export const translateMembersEn = async (members) => {
  const res = await fetch(`${API_BASE}/translate-members-en`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ members }),
  });
  const data = await res.json();
  return data.translatedMembersEn || [];
};

export const translateMembersJp = async (members) => {
  const res = await fetch(`${API_BASE}/translate-members-jp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ members }),
  });
  const data = await res.json();
  return data.translatedMembersJp || [];
};

