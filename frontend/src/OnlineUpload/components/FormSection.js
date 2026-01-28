import React from "react";
import PropTypes from "prop-types";

const FormSection = ({
  images,
  groupName,
  thumbnailShippingDate,
  eventName,
  hasBonus,
  hasAlbum,
  handleImageUpload,
  handlePaste,
  setGroupName,
  setThumbnailShippingDate,
  setEventName,
  setHasBonus,
  setHasAlbum,
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
            aria-label="상세 이미지 업로드"
          />
        </div>
      </div>

      <div 
        onPaste={handlePaste} 
        className="upload-box"
        role="button"
        tabIndex={0}
        aria-label="이미지 붙여넣기 영역"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.execCommand('paste');
          }
        }}
      >
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
            aria-label="그룹명 입력"
            aria-describedby="group-name-help"
          />
          <span id="group-name-help" className="sr-only">영어로 그룹명을 입력하세요</span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-label">📌 발송날짜</div>
        <div className="form-input">
          <input
            type="date"
            value={thumbnailShippingDate}
            onChange={(e) => setThumbnailShippingDate(e.target.value)}
            aria-label="발송 날짜 선택"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-label">📌 콘서트 / 팝업명</div>
        <div className="form-input">
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            aria-label="콘서트 또는 팝업명 입력"
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
            aria-label="특전 유무"
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
            aria-label="앨범 특전가격 포함 x + 1장 구매 시 럭드 1장"
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
  handleImageUpload: PropTypes.func.isRequired,
  handlePaste: PropTypes.func.isRequired,
  setGroupName: PropTypes.func.isRequired,
  setThumbnailShippingDate: PropTypes.func.isRequired,
  setEventName: PropTypes.func.isRequired,
  setHasBonus: PropTypes.func.isRequired,
  setHasAlbum: PropTypes.func.isRequired,
};

export default FormSection;

