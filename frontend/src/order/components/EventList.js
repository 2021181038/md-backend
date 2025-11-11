//이벤트 목록 + 삭제
import React from "react";
import { supabase } from "../supabaseClient";

function EventList({
  eventList,
  selectedEvent,
  setSelectedEvent,
  fetchEventList,
  openUploadModal,
  openMergeModal,
}) {
  // ✅ 이벤트 삭제 핸들러
  const handleDelete = async (eventName, e) => {
    e.stopPropagation();
    if (
      window.confirm(`'${eventName}' 이벤트를 정말 삭제하시겠습니까?`) &&
      window.confirm(`'${eventName}' 진짜로 삭제하시겠습니까?`)
    ) {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("event_name", eventName);

      if (error) {
        console.error(error);
        alert("삭제 중 오류 발생!");
        return;
      }

      alert("이벤트가 삭제되었습니다 ✅");
      await fetchEventList();

      if (selectedEvent === eventName) {
        setSelectedEvent(null);
      }
    }
  };

  return (
    <div className="event-list-section">
      <div
        className="order-right-header hide-on-mobile"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h2>🧾 저장된 이벤트 목록</h2>
        <div 
        className="hide-on-mobile"
        style={{ display: "flex", gap: "8px" }}>
          <button className="mc-btn mc-btn-blue" onClick={openUploadModal}>
            + 새 이벤트 등록
          </button>

          <button className="mc-btn mc-btn-green" onClick={openMergeModal}>
            ↔ 기존 이벤트 병합
          </button>
          
        </div>
      </div>

      {eventList.length > 0 ? (
        <ul className="product-list">
          {eventList.map((ev, idx) => (
            <li
              key={idx}
              onClick={() => setSelectedEvent(ev.event_name)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor:
                  selectedEvent === ev.event_name ? "#e6f0ff" : "white",
                padding: "6px 10px",
                borderRadius: "6px",
                marginBottom: "4px",
              }}
            >
              <span>{ev.event_name}</span>

              <button
                className="mc-btn"
                style={{
                  backgroundColor: "#ac554cff",
                  color: "white",
                  fontSize: "12px",
                  borderRadius: "6px",
                  width: "70px",
                  padding: "4px 0",
                }}
                onClick={(e) => handleDelete(ev.event_name, e)}
              >
                삭제하기
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="placeholder-text">아직 저장된 이벤트가 없습니다.</p>
      )}
    </div>
  );
}

export default EventList;
