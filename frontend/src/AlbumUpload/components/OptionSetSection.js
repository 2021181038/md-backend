import React from "react";

const OptionSetSection = ({
  set,
  isRowHighlighted,
  calcPreviewResult,
  judgeOptionResult,
  updateMultiplier,
  handleMemberNameChange,
  toggleEditMode,
  toggleRowHighlight,
  removeSet,
  lockMemberNames,
  handleConfirmMembers,
}) => {
  const { purchaseCost, expectedSales } = calcPreviewResult(set);
  const previewResult =
    set.rows.length === 1
      ? "가능 !"
      : expectedSales > purchaseCost
      ? "가능 !"
      : "불가능 !";

  return (
    <>
      <div className="set-header">
        <h3 className="set-title">옵션 O - {set.productName}</h3>
        <button
          className="set-remove-btn"
          onClick={() => removeSet(set.id)}
          aria-label="옵션 삭제"
        >
          ✕
        </button>
      </div>

      <div className="set-edit-area">
        {!set.editing ? (
          <button
            className="edit-btn edit-btn-edit"
            onClick={() => toggleEditMode(set.id)}
          >
            수정하기
          </button>
        ) : (
          <button
            className="edit-btn edit-btn-save"
            onClick={() => toggleEditMode(set.id)}
          >
            수정완료
          </button>
        )}
      </div>

      {set.editing && (
        <div
          style={{
            fontSize: "14px",
            color: "#ff5fa2",
            margin: "6px 0"
          }}
        >
          👉 초록색으로 만들 행을 클릭하세요
        </div>
      )}

      <div className="seller-line">
        판매처 : <strong>{set.seller}</strong>
      </div>

      <table className="set-table">
        <thead>
          <tr>
            <th>등수</th>
            <th>배수</th>
            <th>멤버명</th>
            <th>가격(원)</th>
            <th>가격(¥)</th>
          </tr>
        </thead>
        <tbody>
          {set.rows.map((r, idx) => (
            <tr
              key={idx}
              className={isRowHighlighted(r, set.rows.length) ? "row-highlight" : ""}
              style={{
                cursor: set.editing ? "pointer" : "default"
              }}
              onClick={() => {
                if (set.editing) {
                  toggleRowHighlight(set.id, idx);
                }
              }}
            >
              <td>{r.rank}</td>
              <td>
                {set.editing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={r.multiplier}
                    onWheel={(e) => e.target.blur()}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") {
                        updateMultiplier(set.id, idx, "");
                        return;
                      }
                      const num = parseFloat(v);
                      if (!isNaN(num)) {
                        updateMultiplier(set.id, idx, num);
                      }
                    }}
                  />
                ) : (
                  r.multiplier
                )}
              </td>
              <td>
                {set.editing ? (
                  <input
                    className="member-input"
                    value={r.memberName}
                    onChange={(e) => handleMemberNameChange(set.id, idx, e.target.value.toUpperCase())}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : set.memberLocked ? (
                  <div className="member-display">{r.memberName}</div>
                ) : (
                  <input
                    className="member-input"
                    value={r.memberName}
                    onChange={(e) => handleMemberNameChange(set.id, idx, e.target.value.toUpperCase())}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </td>
              <td>{r.priceKrw}</td>
              <td>{r.priceYen}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "#fcffe3ff",
          borderRadius: "6px",
          fontSize: "14px"
        }}
      >
        <div>🧾 매입액 : {purchaseCost.toLocaleString()}원</div>
        <div>💰 예상 매출 : {expectedSales.toLocaleString()}원</div>
        <div
          style={{
            marginTop: "6px",
            fontWeight: "700",
            color: previewResult === "가능 !" ? "green" : "red"
          }}
        >
          {previewResult}
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={() => {
          lockMemberNames(set.id);
          handleConfirmMembers(set.id);
        }}
      >
        멤버명 입력 완료
      </button>
    </>
  );
};

export default OptionSetSection;

