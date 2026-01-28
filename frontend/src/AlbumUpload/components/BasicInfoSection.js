import React from "react";

const BasicInfoSection = ({
  groupName,
  setGroupName,
  eventName,
  setEventName,
  releaseDate,
  setReleaseDate,
  isMemberSelectable,
  setIsMemberSelectable,
  isSiteSelectable,
  setIsSiteSelectable,
  hasBonus,
  setHasBonus,
  bonusAlbumName,
  setBonusAlbumName,
  handleGenerateAll,
  mainProductName,
  detailDescription,
  handleCopyDescription,
}) => {
  return (
    <>
      <div className="section-box">
        <div className="basic-info-row">
          <div className="basic-info-field-inline">
            <label>그룹명</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value.toUpperCase())}
            />
          </div>

          <div className="basic-info-field-inline">
            <label>앨범명</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>

          <div className="basic-info-field-inline">
            <label>썸네일 기준 발송날짜</label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>

          <div className="checkbox-inline">
            <label>
              <input
                type="checkbox"
                checked={isMemberSelectable}
                onChange={(e) => setIsMemberSelectable(e.target.checked)}
              />
              멤버 선택 가능
            </label>
          </div>

          <div className="checkbox-inline">
            <label>
              <input
                type="checkbox"
                checked={isSiteSelectable}
                onChange={(e) => setIsSiteSelectable(e.target.checked)}
              />
              사이트 선택
            </label>
          </div>

          <div className="checkbox-inline" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label>
              <input
                type="checkbox"
                checked={hasBonus}
                onChange={(e) => setHasBonus(e.target.checked)}
              />
              특전 증정
            </label>

            {hasBonus && (
              <input
                type="text"
                placeholder="특전 대상 앨범명 입력"
                value={bonusAlbumName}
                onChange={(e) => setBonusAlbumName(e.target.value)}
                style={{ width: "260px" }}
              />
            )}
          </div>

          <button className="btn-primary" onClick={handleGenerateAll}>
            다음
          </button>
        </div>
      </div>

      {mainProductName && (
        <div className="section-box">
          <h3>메인상품명</h3>
          <input
            value={mainProductName}
            readOnly
            style={{ width: "100%", marginTop: "8px" }}
          />
          <button
            className="btn-secondary"
            onClick={() => navigator.clipboard.writeText(mainProductName)}
          >
            복사하기
          </button>
        </div>
      )}

      {detailDescription && (
        <div className="section-box">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px"
            }}
          >
            <h3 style={{ margin: 0 }}>상세페이지 글</h3>
          </div>
          <textarea
            value={detailDescription}
            readOnly
            style={{ width: "100%", height: "180px" }}
          />
          <button
            className="btn-secondary small"
            onClick={handleCopyDescription}
          >
            복사하기
          </button>
        </div>
      )}
    </>
  );
};

export default BasicInfoSection;

