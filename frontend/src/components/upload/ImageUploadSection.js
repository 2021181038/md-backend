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
    <section className="ui-card">
      <h2 className="ui-card-title">상세 이미지 업로드</h2>
      <p className="ui-card-desc">상품 이미지를 업로드하거나 붙여넣은 뒤 가격 정보를 가져오세요.</p>

      <div className="ui-field">
        <input
          id="md-image-upload"
          className="ui-file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
        <label htmlFor="md-image-upload" className="ui-file-label">
          파일 선택
        </label>
      </div>

      <div
        tabIndex={0}
        onPaste={handlePaste}
        className="upload-dropzone"
        role="textbox"
        aria-label="이미지 붙여넣기 영역"
      >
        네모 박스를 클릭한 후 이미지를 여기에 복사·붙여넣기
      </div>

      {images.length > 0 && (
        <div className="upload-file-list">
          {images.map((img, idx) => (
            <p key={idx} className="upload-file-item">
              {img.name || `clipboard-image-${idx}`}
            </p>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: "16px" }}
        onClick={onFetchPrices}
        disabled={isLoading}
      >
        가격 정보 가져오기
      </button>

      {isLoading && (
        <div className="loading-block">
          <div className="spinner" />
          <p>{loadingMessage || "상품 정보를 불러오는 중입니다..."}</p>
        </div>
      )}

      {errorMsg && <div className="error-banner">{errorMsg}</div>}
    </section>
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
