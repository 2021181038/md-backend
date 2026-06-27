import React from "react";
import PropTypes from "prop-types";

const MetadataFormSection = ({
  groupName,
  thumbnailShippingDate,
  eventName,
  hasBonus,
  hasAlbum,
  setGroupName,
  setThumbnailShippingDate,
  setEventName,
  setHasBonus,
  setHasAlbum,
}) => {
  return (
    <div className="form-section">
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
        <div className="form-label">📌 발송날짜</div>
        <div className="form-input">
          <input
            type="date"
            value={thumbnailShippingDate}
            onChange={(e) => setThumbnailShippingDate(e.target.value)}
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

MetadataFormSection.propTypes = {
  groupName: PropTypes.string.isRequired,
  thumbnailShippingDate: PropTypes.string.isRequired,
  eventName: PropTypes.string.isRequired,
  hasBonus: PropTypes.bool.isRequired,
  hasAlbum: PropTypes.bool.isRequired,
  setGroupName: PropTypes.func.isRequired,
  setThumbnailShippingDate: PropTypes.func.isRequired,
  setEventName: PropTypes.func.isRequired,
  setHasBonus: PropTypes.func.isRequired,
  setHasAlbum: PropTypes.func.isRequired,
};

export default MetadataFormSection;
