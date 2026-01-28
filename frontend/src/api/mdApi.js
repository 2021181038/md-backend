import { resizeImage, chunkArray } from "../utils/imageUtils";
import { IMAGE_CONFIG } from "../constants/config";
import { parseMdText, assignNumbers } from "../utils/textUtils";

const API_BASE = process.env.REACT_APP_API_BASE;

// 재시도 로직이 포함된 API 호출
const fetchWithRetry = async (formData, retries = 2) => {
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

// MD 추출 (개선된 버전: 병렬 처리 및 재시도)
export const extractMd = async (images, priceMode = "offline") => {
  if (!images.length) {
    throw new Error("이미지를 업로드해주세요.");
  }

  // 이미지 리사이즈 (병렬 처리)
  const resizedImages = await Promise.all(images.map(img => resizeImage(img, IMAGE_CONFIG.MAX_SIZE)));

  // 배치로 나누기
  const batches = chunkArray(resizedImages, IMAGE_CONFIG.BATCH_SIZE);
  let allResults = [];

  // 배치를 병렬로 처리 (최대 3개 동시 처리로 속도 향상)
  const MAX_CONCURRENT = 3;

  for (let i = 0; i < batches.length; i += MAX_CONCURRENT) {
    const batchGroup = batches.slice(i, i + MAX_CONCURRENT);
    
    const groupPromises = batchGroup.map(async (batch) => {
      const formData = new FormData();
      batch.forEach((file) => formData.append("images", file));
      
      try {
        const raw = await fetchWithRetry(formData);
        const parsed = parseMdText(raw, priceMode);
        return parsed;
      } catch (error) {
        console.error(`배치 처리 오류:`, error);
        // 개별 배치 실패 시 빈 배열 반환 (다른 배치는 계속 처리)
        return [];
      }
    });

    const groupResults = await Promise.all(groupPromises);
    allResults = [...allResults, ...groupResults.flat()];
  }

  // 번호 부여
  return assignNumbers(allResults);
};

