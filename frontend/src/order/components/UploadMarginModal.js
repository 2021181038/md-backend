// UploadMarginModal.js
import React, { useState } from "react";
import Papa from "papaparse";
import { supabase } from "../supabaseClient";

function UploadMarginModal({ closeModal, selectedEvent, refreshCurrentEvent }) {
  const [marginData, setMarginData] = useState([]);
  const [preview, setPreview] = useState([]);

  // ✅ CSV 업로드
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      encoding: "UTF-8",
      complete: (result) => {
        const data = result.data
          .filter((row) => row["옵션정보"] && row["마진"])
          .map((row) => ({
            option_name: row["옵션정보"].trim(),
            margin: Number(row["마진"]),
          }));

        setMarginData(data);
        setPreview(data.slice(0, 10)); // 미리보기 10개만 보여줌
      },
    });
  };

  const handleSave = async () => {
  if (!selectedEvent) {
    alert("이벤트를 먼저 선택해주세요!");
    return;
  }

  if (marginData.length === 0) {
    alert("마진 데이터가 비어 있습니다. CSV를 업로드해주세요!");
    return;
  }

  // ✅ CSV 데이터 준비
  const insertData = marginData.map((m) => ({
    event_name: selectedEvent,
    option_name: m.option_name,
    margin: Number(m.margin) || 0,
  }));

  try {
    // ✅ 기존 마진 데이터 삭제
    const { error: deleteError } = await supabase
      .from("margins")
      .delete()
      .eq("event_name", selectedEvent);

    if (deleteError) throw deleteError;

    // ✅ 새 데이터 삽입
    const { error } = await supabase
      .from("margins")
      .insert(insertData);

    if (error) {
      console.error(error);
      alert("❌ 저장 실패!");
      return;
    }

    alert("✅ 마진 정보가 저장되었습니다!");

    // ✅ 반영 즉시 화면 새로고침 (OrderTable의 총 마진 갱신)
    if (refreshCurrentEvent) await refreshCurrentEvent();

    // ✅ 모달 닫기
    closeModal();
  } catch (err) {
    console.error(err);
    alert("저장 중 오류가 발생했습니다 ❌");
  }
};



  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>💰 마진 CSV 업로드</h3>
        </div>

        <div className="modal-body">
          <input type="file" accept=".csv" onChange={handleFileUpload} />

          {preview.length > 0 && (
            <>
              <h4 style={{ marginTop: "10px" }}>📋 미리보기 (상위 10개)</h4>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>옵션정보</th>
                    <th>마진</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.option_name}</td>
                      <td>{row.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="modal-footer-fixed">
          <button className="mc-btn mc-btn-blue" onClick={handleSave}>
            저장하기
          </button>
          <button className="mc-btn" onClick={closeModal}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadMarginModal;
