import React from "react";
import PropTypes from "prop-types";

const FormSection = ({
  images,
  groupName,
  thumbnailShippingDate,
  eventName,
  hasBonus,
  hasAlbum,
  hasPreorder,
  preorderShippingDate,
  handleImageUpload,
  handlePaste,
  setGroupName,
  setThumbnailShippingDate,
  setEventName,
  setHasBonus,
  setHasAlbum,
  setHasPreorder,
  setPreorderShippingDate,
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

      <div className="form-row">
        <div className="form-label">📌 그룹명</div>
        <div className="form-input">
          <input
            type="text"
            placeholder="영어로 입력"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-label">📌 현장구매 발송날짜</div>
        <div className="form-input">
          <input
            type="date"
            value={thumbnailShippingDate}
            onChange={(e) => setThumbnailShippingDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-label">📌 PRE-ORDER 상품도 있어요</div>
        <div className="form-input">
          <input
            type="checkbox"
            checked={hasPreorder}
            onChange={(e) => setHasPreorder(e.target.checked)}
          />
        </div>
      </div>

      {hasPreorder && (
        <div className="form-row">
          <div className="form-label">📌 PRE-ORDER 발송날짜</div>
          <div className="form-input">
            <input
              type="date"
              value={preorderShippingDate}
              onChange={(e) => setPreorderShippingDate(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-label">📌 콘서트 / 팝업명</div>
        <div className="form-input">
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-label">📌 특전 유무</div>
        <div className="form-input">
          <input
            type="checkbox"
            checked={hasBonus}
            onChange={(e) => setHasBonus(e.target.checked)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-label">📌 앨범 특전가격 포함 x + 1장 구매 시 럭드 1장</div>
        <div className="form-input">
          <input
            type="checkbox"
            checked={hasAlbum}
            onChange={(e) => setHasAlbum(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
};

FormSection.propTypes = {
  images: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
  groupName: PropTypes.string.isRequired,
  thumbnailShippingDate: PropTypes.string.isRequired,
  eventName: PropTypes.string.isRequired,
  hasBonus: PropTypes.bool.isRequired,
  hasAlbum: PropTypes.bool.isRequired,
  hasPreorder: PropTypes.bool.isRequired,
  preorderShippingDate: PropTypes.string.isRequired,
  handleImageUpload: PropTypes.func.isRequired,
  handlePaste: PropTypes.func.isRequired,
  setGroupName: PropTypes.func.isRequired,
  setThumbnailShippingDate: PropTypes.func.isRequired,
  setEventName: PropTypes.func.isRequired,
  setHasBonus: PropTypes.func.isRequired,
  setHasAlbum: PropTypes.func.isRequired,
  setHasPreorder: PropTypes.func.isRequired,
  setPreorderShippingDate: PropTypes.func.isRequired,
};

export default FormSection;

