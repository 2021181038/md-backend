import React from "react";
import { getPriceForMode, setPriceForMode } from "../../utils/textUtils";

const ProductTableSection = ({
  mdList,
  setMdList,
  convertToYen,
  uploadMode,
  setUploadMode,
  addEmptyProduct,
}) => {
  const modeLabel = uploadMode === "online" ? "온라인" : "현장";

  return (
    <div>
      <div className="ui-card-header">
        <div>
          <h2 className="ui-card-title">상품명 및 가격</h2>
          <p className="ui-card-desc">
            현장·온라인 엔화가 함께 계산됩니다. 오른쪽에서 버전을 선택하세요.
          </p>
        </div>

        <div className="segment-control" role="group" aria-label="가격 버전 선택">
          <button
            type="button"
            className={uploadMode === "offline" ? "active" : ""}
            onClick={() => setUploadMode("offline")}
            aria-pressed={uploadMode === "offline"}
          >
            현장
          </button>
          <button
            type="button"
            className={uploadMode === "online" ? "active" : ""}
            onClick={() => setUploadMode("online")}
            aria-pressed={uploadMode === "online"}
          >
            온라인
          </button>
        </div>
      </div>

      {mdList.length === 0 ? (
        <div className="empty-state">
          이미지를 업로드한 뒤 「가격 정보 가져오기」를 눌러주세요.
        </div>
      ) : (
        <div className="md-table-container">
          <table className="md-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>가격 (원화)</th>
                <th>가격 (엔화 · {modeLabel})</th>
                <th>옵션 여부</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mdList.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <input
                      type="text"
                      className="md-input-name"
                      value={item.name}
                      onChange={(e) => {
                        const newList = [...mdList];
                        newList[idx].name = e.target.value;
                        setMdList(newList);
                      }}
                    />
                    {item.name.length > 50 && (
                      <div className="field-error">
                        상품명이 50자를 넘어요 !
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                    <input
                      type="number"
                      className="md-input-price"
                      placeholder="₩원화"
                      value={item.originalPriceKrw || ""}
                      onChange={(e) => {
                        const newList = [...mdList];
                        newList[idx].originalPriceKrw = e.target.value;
                        setMdList(newList);
                      }}
                    />
                    <button
                      type="button"
                      className="convert-btn"
                      onClick={() => convertToYen(idx)}
                    >
                      엔화 계산
                    </button>
                  </div>
                </td>
                <td>
                  <input
                    type="number"
                    className="md-input-price"
                    placeholder="¥엔화"
                    value={getPriceForMode(item, uploadMode)}
                    onChange={(e) => {
                      const newList = [...mdList];
                      newList[idx] = setPriceForMode(newList[idx], uploadMode, e.target.value);
                      setMdList(newList);
                    }}
                  />
                </td>
                <td>
                  <div className="option-cell">
                    <input
                      type="checkbox"
                      className="option-checkbox"
                      checked={item.hasOption || false}
                      onChange={(e) => {
                        const newList = [...mdList];
                        newList[idx].hasOption = e.target.checked;
                        setMdList(newList);
                      }}
                    />
                    {item.hasOption && (
                      <input
                        type="text"
                        className="md-input-option"
                        placeholder="쉼표로 구분 (예: 한나, 유나, 현서)"
                        value={item.optionText || ""}
                        onChange={(e) => {
                          const newList = [...mdList];
                          newList[idx].optionText = e.target.value;
                          setMdList(newList);
                        }}
                        style={{
                          width: `${Math.max(item.optionText?.length || 1, 12) * 10}px`,
                        }}
                      />
                    )}
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => {
                      const newList = [...mdList];
                      newList.splice(idx, 1);
                      setMdList(newList);
                    }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="btn-row">
        <button type="button" className="btn-secondary" onClick={addEmptyProduct}>
          상품 추가 +
        </button>
      </div>
    </div>
  );
};

export default ProductTableSection;
