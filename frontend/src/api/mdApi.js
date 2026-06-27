import { resizeImage, chunkArray } from "../utils/imageUtils";
import { IMAGE_CONFIG } from "../constants/config";
import { parseMdResponse, assignNumbers } from "../utils/textUtils";
import { wakeServer, postExtractMd } from "./extractApi";

export class ExtractMdError extends Error {
  constructor(message, { failedBatches = [], partialResults = [] } = {}) {
    super(message);
    this.name = "ExtractMdError";
    this.failedBatches = failedBatches;
    this.partialResults = partialResults;
  }
}

export const extractMd = async (images, priceMode = "offline", options = {}) => {
  const { onProgress } = options;

  if (!images.length) {
    throw new Error("이미지를 업로드해주세요.");
  }

  onProgress?.("서버 준비 중...");
  await wakeServer(onProgress);

  onProgress?.("이미지 준비 중...");
  const resizedImages = await Promise.all(
    images.map((img) => resizeImage(img, IMAGE_CONFIG.MAX_SIZE))
  );

  const batches = chunkArray(resizedImages, IMAGE_CONFIG.BATCH_SIZE);
  const allResults = [];
  const failedBatches = [];

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchLabel = `${batchIndex + 1}/${batches.length}`;

    onProgress?.(`이미지 ${batchLabel} 처리 중...`);

    const formData = new FormData();
    batch.forEach((file) => formData.append("images", file));

    try {
      const raw = await postExtractMd(formData, (message) => {
        onProgress?.(`이미지 ${batchLabel} — ${message}`);
      });
      const parsed = parseMdResponse(raw, priceMode);

      if (!parsed.length) {
        failedBatches.push(batchLabel);
        continue;
      }

      allResults.push(...parsed);
    } catch (error) {
      console.error(`배치 ${batchLabel} 처리 오류:`, error);
      failedBatches.push(batchLabel);
    }
  }

  const numberedResults = assignNumbers(allResults);

  if (failedBatches.length > 0) {
    const failedText = failedBatches.join(", ");

    if (numberedResults.length > 0) {
      throw new ExtractMdError(
        `일부 이미지(${failedText})에서 상품 정보를 가져오지 못했습니다. 인식된 ${numberedResults.length}개 항목은 표시됩니다.`,
        { failedBatches, partialResults: numberedResults }
      );
    }

    throw new Error(
      `이미지(${failedText})에서 상품 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.`
    );
  }

  if (!numberedResults.length) {
    throw new Error("인식된 상품이 없습니다. 이미지가 선명한지 확인 후 다시 시도해주세요.");
  }

  return numberedResults;
};
