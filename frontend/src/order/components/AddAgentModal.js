//구매자 추가 모달
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function AddAgentModal({ closeModal, selectedEvent, eventOrders, setAgents, refreshCurrentEvent }) {
  //새로 구매자 추가할 때 저장할 기본 정보
  const [newAgent, setNewAgent] = useState({
    contact_type: "",
    nickname: "",
    status: "",
    manager: "",
  });
  //구매자의 옵션명, 수량 정보
  const [optionQtyMap, setOptionQtyMap] = useState({});

  // 저장버튼 눌렀을 때
  const handleSave = async () => {
    if (!selectedEvent) {
      alert("먼저 이벤트를 선택해주세요!");
      return;
    }

    if (
      !newAgent.contact_type.trim() ||
      !newAgent.nickname.trim() ||
      !newAgent.status.trim() ||
      !newAgent.manager.trim()
    ) {
      alert("⚠️ 모든 필드를 입력해주세요!");
      return;
    }

    // ✅ 수량이 1 이상인 옵션만 추출
    const filledOptions = Object.entries(optionQtyMap)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([option_name, qty]) => ({
        option_name,
        qty: Number(qty),
        received: false,
      }));

    if (filledOptions.length === 0) {
      alert("⚠️ 최소 한 개 이상의 수량을 입력해주세요.");
      return;
    }

    // ✅ 확인 팝업
    const confirmList = filledOptions
      .map((f) => `・${f.option_name} 수량 ${f.qty}`)
      .join("\n");

    const confirmed = window.confirm(
      `🧾 아래 내용이 맞나요?\n\n${confirmList}\n\n확인을 누르면 저장됨.`
    );
    if (!confirmed) return;

    // ✅ Supabase 저장
const newEntry = {
  event_name: selectedEvent,
  contact_type: newAgent.contact_type,
  nickname: newAgent.nickname,
  status: newAgent.status,
  manager: newAgent.manager,
  is_received: false,
  items: filledOptions,
};

const { data, error } = await supabase.from("agents").insert([newEntry]).select();
if (error) {
  console.error(error);
  alert("❌ 저장 실패!");
  return;
}

// 🔥 [추가 부분 시작] — orders 테이블 반영
for (const { option_name, qty } of filledOptions) {
  const { data: target } = await supabase
    .from("orders")
    .select("id, needed_qty, proxy_qty")
    .eq("event_name", selectedEvent)
    .eq("option_name", option_name)
    .maybeSingle();

  if (target) {
    const newNeeded = Math.max(0, (target.needed_qty ?? 0) - qty);
    const newProxy = (target.proxy_qty ?? 0) + qty;

    await supabase
      .from("orders")
      .update({
        needed_qty: newNeeded,
        proxy_qty: newProxy,
        quantity: newNeeded, // 호환용
      })
      .eq("id", target.id);
  }
}
// 🔥 [추가 부분 끝]

// ✅ UI 반영
setAgents((prev) => [...prev, data[0]]);
await refreshCurrentEvent(); // 🔥 화면 새로고침
handleClose();

  };
  //입력했던 내용들 초기화
  const handleClose = () => {
    setNewAgent({
      contact_type: "",
      nickname: "",
      status: "",
      manager: "",
    });
    setOptionQtyMap({});
    closeModal();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>＋ 구매자 추가</h3>
        </div>

        <div className="modal-body">
          {/* 기본 정보 입력 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label>연락수단</label>
              <select
                value={newAgent.contact_type}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, contact_type: e.target.value })
                }
              >
                <option value="">선택</option>
                <option value="KKT">KKT</option>
                <option value="번개장터">번개장터</option>
                <option value="X">X</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div>
              <label>닉네임</label>
              <input
                type="text"
                value={newAgent.nickname}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, nickname: e.target.value })
                }
              />
            </div>

            <div>
              <label>상태</label>
              <select
                value={newAgent.status}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, status: e.target.value })
                }
              >
                <option value="">선택</option>
                <option value="입금전">입금전</option>
                <option value="입금완료">입금완료</option>
                <option value="배송완료">배송완료</option>
              </select>
            </div>

            <div>
              <label>담당자</label>
              <select
                value={newAgent.manager}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, manager: e.target.value })
                }
              >
                <option value="">선택</option>
                <option value="성한나">성한나</option>
                <option value="강유나">강유나</option>
                <option value="손현서">손현서</option>
              </select>
            </div>
          </div>

          {/* 구매 목록 */}
          <div style={{ marginTop: "18px" }}>
            <label>구매 목록</label>
            {eventOrders.length > 0 ? (
              eventOrders.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "6px",
                    backgroundColor: idx % 2 === 0 ? "#c6e2ff92" : "#ffffff",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span style={{ flex: 1 }}>{item.option_name}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="수량"
                    value={optionQtyMap[item.option_name] || ""}
                    style={{
                      width: "80px",
                      height: "40px",
                      textAlign: "center",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      padding: "3px 0",
                    }}
                    onChange={(e) =>
                      setOptionQtyMap((prev) => ({
                        ...prev,
                        [item.option_name]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))
            ) : (
              <p className="placeholder-text">좌측 주문 내역이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="modal-footer-fixed">
          <button className="mc-btn mc-btn-blue" onClick={handleSave}>
            저장
          </button>
          <button className="mc-btn" onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddAgentModal;
