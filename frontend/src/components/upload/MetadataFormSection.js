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
    <section className="ui-card">
      <h2 className="ui-card-title">상품 정보</h2>
      <p className="ui-card-desc">메인상품명과 상세페이지 글 생성에 사용됩니다.</p>

      <div className="ui-field">
        <label className="ui-label" htmlFor="group-name">그룹명</label>
        <input
          id="group-name"
          type="text"
          className="ui-input"
          placeholder="영어로 입력"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value.toUpperCase())}
        />
      </div>

      <div className="ui-field">
        <label className="ui-label" htmlFor="shipping-date">발송날짜</label>
        <input
          id="shipping-date"
          type="date"
          className="ui-input"
          value={thumbnailShippingDate}
          onChange={(e) => setThumbnailShippingDate(e.target.value)}
        />
      </div>

      <div className="ui-field">
        <label className="ui-label" htmlFor="event-name">콘서트 / 팝업명</label>
        <input
          id="event-name"
          type="text"
          className="ui-input"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
      </div>

      <div className="toggle-row">
        <span className="toggle-label">특전 유무</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={hasBonus}
            onChange={(e) => setHasBonus(e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
      </div>

      <div className="toggle-row">
        <span className="toggle-label">앨범 특전가격 포함 x + 1장 구매 시 럭드 1장</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={hasAlbum}
            onChange={(e) => setHasAlbum(e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
      </div>
    </section>
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
