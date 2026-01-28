import { IMAGE_CONFIG } from '../constants/config';

/**
 * 이미지를 지정된 최대 크기로 리사이즈
 * 비율을 유지하면서 크기를 조정하고 Blob으로 반환
 * @param {File} file - 리사이즈할 이미지 파일
 * @param {number} maxSize - 최대 크기 (픽셀, 기본값: IMAGE_CONFIG.MAX_SIZE)
 * @returns {Promise<Blob>} 리사이즈된 이미지 Blob
 */
export const resizeImage = (file, maxSize = IMAGE_CONFIG.MAX_SIZE) => {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => resolve(blob), file.type, IMAGE_CONFIG.QUALITY);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * 배열을 지정된 크기의 청크로 분할
 * @param {Array} arr - 분할할 배열
 * @param {number} size - 각 청크의 크기 (기본값: IMAGE_CONFIG.BATCH_SIZE)
 * @returns {Array<Array>} 청크로 분할된 배열
 */
export const chunkArray = (arr, size = IMAGE_CONFIG.BATCH_SIZE) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

/**
 * 클립보드 데이터에서 이미지 파일 추출
 * @param {DataTransfer} clipboardData - 클립보드 데이터 전송 객체
 * @returns {Array<File>} 추출된 이미지 파일 배열
 */
export const extractImagesFromClipboard = (clipboardData) => {
  const items = clipboardData.items;
  const newFiles = [];

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const blob = items[i].getAsFile();
      newFiles.push(blob);
    }
  }

  return newFiles;
};

