import React from "react";
import { convertSingleToYen } from "../../utils/priceUtils";

const SingleSetSection = ({
  set,
  updateSingleRow,
  addRowToSingleSet,
  removeRowFromSingleSet,
}) => {
  return (
    <>
      <h3>옵션 X</h3>
      <table className="set-table">
        <thead>
          <tr>
            <th>상품명(OPTION)</th>
            <th>가격(₩)</th>
            <th>가격(¥)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {set.rows.map((row, idx) => (
            <tr key={idx}>
              <td>
                <input
                  value={row.productName}
                  onChange={(e) =>
                    updateSingleRow(set.id, idx, "productName", e.target.value.toUpperCase())
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={row.priceKrw}
                  onChange={(e) =>
                    updateSingleRow(set.id, idx, "priceKrw", e.target.value)
                  }
                />
                <button
                  className="btn-yen"
                  onClick={() =>
                    updateSingleRow(set.id, idx, "priceYen", convertSingleToYen(row.priceKrw))
                  }
                >
                  엔화변환
                </button>
              </td>
              <td>{row.priceYen}</td>
              <td>
                <button
                  className="btn-delete"
                  onClick={() => removeRowFromSingleSet(set.id, idx)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn-secondary"
        onClick={() => addRowToSingleSet(set.id)}
      >
        행 추가 +
      </button>
    </>
  );
};

export default SingleSetSection;

