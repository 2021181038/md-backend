import React from "react";

const SummarySection = ({ summary }) => {
  if (summary.length === 0) return null;

  return (
    <div>
      <h3>📋 옵션별 수량 합계</h3>
      <table className="margin-table">
        <thead>
          <tr>
            <th>옵션정보</th>
            <th>총 수량</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row, idx) => (
            <tr key={idx}>
              <td>{row.option}</td>
              <td>{row.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SummarySection;

