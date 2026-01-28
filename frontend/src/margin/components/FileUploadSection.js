import React from "react";

const FileUploadSection = ({ handleFileUpload, handleSettlementUpload }) => {
  return (
    <div className="upload-section">
      <div>
        <h3>📦 주문 파일 업로드</h3>
        <input type="file" accept=".csv" onChange={handleFileUpload} />
      </div>
      <div>
        <h3>📑 정산 파일 업로드</h3>
        <input type="file" accept=".csv" onChange={handleSettlementUpload} />
      </div>
    </div>
  );
};

export default FileUploadSection;

