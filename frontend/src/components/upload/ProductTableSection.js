import React from "react";
import { convertKrwToYenOffline } from "../../utils/priceUtils";

const ProductTableSection = ({ mdList, setMdList, convertToYen }) => {
  return (
    <div style={{ marginTop: '30px' }}>
      <h3>📋 상품명 및 가격</h3>
      <h3>상품 추가 시 가격은 ₩원화₩를 기준으로 입력하기</h3>
      {mdList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>상품을 추가하려면 아래 버튼을 클릭하세요.</p>
        </div>
      ) : (
        <div className="md-table-container">
          <table className="md-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>가격 (원화)</th>
                <th>가격 (엔화)</th>
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
                <td>{item.originalPriceKrw ? `₩${item.originalPriceKrw}` : '-'}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                    <input
                      type="number"
                      className="md-input-price"
                      placeholder="₩원화 입력"
                      value={item.price}
                      onChange={(e) => {
                        const newList = [...mdList];
                        newList[idx].price = e.target.value;
                        setMdList(newList);
                      }}
                    />
                    <button
                      className="convert-btn"
                      onClick={() => convertToYen(idx, "offline")}
                    >
                      엔화로 변환
                    </button>
                  </div>
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
        <button
          className="plus-button"
          onClick={() => {
            setMdList([...mdList, { name: "", price: "", hasOption: false, optionText: "" }]);
          }}
        >
          상품 추가 +
        </button>
      </div>
    </div>
  );
};

export default ProductTableSection;

