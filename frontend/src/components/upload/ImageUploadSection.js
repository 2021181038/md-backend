import React from "react";
import PropTypes from "prop-types";

const ImageUploadSection = ({
  images,
  handleImageUpload,
  handlePaste,
  onFetchPrices,
  isLoading,
  loadingMessage,
  errorMsg,
}) => {
  return (
    <div className="form-section">
      <div className="form-row">
        <div className="form-label">📌 상세 이미지 업로드</div>
        <div className="form-input">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <div onPaste={handlePaste} className="upload-box">
        네모 박스를 클릭한 후 이미지를 여기에 복사·붙여넣기
      </div>

      <div style={{ marginTop: "10px" }}>
        {images.map((img, idx) => (
          <p key={idx}>{img.name || `clipboard-image-${idx}`}</p>
        ))}
      </div>

      <button
        type="button"
        className="pretty-button"
        style={{ marginTop: "20px" }}
        onClick={onFetchPrices}
        disabled={isLoading}
      >
        가격 정보 가져오기
      </button>

      {isLoading && (
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <div className="spinner"></div>
          <p>{loadingMessage || "상품 정보를 불러오는 중입니다..."}</p>
        </div>
      )}

      {errorMsg && (
        <div style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
};

ImageUploadSection.propTypes = {
  images: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
  handleImageUpload: PropTypes.func.isRequired,
  handlePaste: PropTypes.func.isRequired,
  onFetchPrices: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadingMessage: PropTypes.string.isRequired,
  errorMsg: PropTypes.string.isRequired,
};

export default ImageUploadSection;
