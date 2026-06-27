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
    <div style={{ marginTop: '30px' }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>📋 상품명 및 가격</h3>
          <p style={{ margin: "6px 0 0", color: "#666", fontSize: "14px" }}>
            현장·온라인 엔화가 함께 계산됩니다. 오른쪽에서 버전을 선택하세요.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="pretty-button"
            style={{
              backgroundColor: uploadMode === "offline" ? "#33418f" : "#777",
              width: "100px",
            }}
            onClick={() => setUploadMode("offline")}
            aria-pressed={uploadMode === "offline"}
          >
            현장
          </button>
          <button
            type="button"
            className="pretty-button"
            style={{
              backgroundColor: uploadMode === "online" ? "#33418f" : "#777",
              width: "100px",
            }}
            onClick={() => setUploadMode("online")}
            aria-pressed={uploadMode === "online"}
          >
            온라인
          </button>
        </div>
      </div>

      {mdList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>이미지를 업로드한 뒤 「가격 정보 가져오기」를 눌러주세요.</p>
        </div>
      ) : (
        <div className="md-table-container" style={{ marginTop: "16px" }}>
          <table className="md-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>가격 (원화)</th>
                <th>가격 (엔화 · {modeLabel})</th>
                <th style={{ color: 'red' }}>옵션 여부</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mdList.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ display: "flex", flexDirection: "column" }}>
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
                      <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                        상품명이 50자를 넘어요 !
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
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
                      style={{ width: "100px" }}
                    />
                    <button
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
                  <input
                    type="checkbox"
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
                        width: `${(item.optionText?.length || 1) * 10}px`,
                        maxWidth: "100%",
                      }}
                    />
                  )}
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      const newList = [...mdList];
                      newList.splice(idx, 1);
                      setMdList(newList);
                    }}
                  >
                    상품 삭제 –
                  </button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px", marginBottom: "15px" }}>
        <button className="plus-button" onClick={addEmptyProduct}>
          상품 추가 +
        </button>
      </div>
    </div>
  );
};

export default ProductTableSection;
