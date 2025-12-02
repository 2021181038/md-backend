//구매자 추가 모달 (심플 디자인 버전)
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

function AddAgentModal({
  closeModal,
  selectedEvent,
  eventOrders,
  setAgents,
  refreshCurrentEvent,
}) {
  const [newAgent, setNewAgent] = useState({
    contact_type: "",
    nickname: "",
    status: "",
    manager: "",
    fee: "",
  });

  const [optionQtyMap, setOptionQtyMap] = useState({});

  // 저장
  const handleSave = async () => {
    if (!selectedEvent) return alert("먼저 이벤트를 선택해주세요!");

    if (
      !newAgent.contact_type.trim() ||
      !newAgent.nickname.trim() ||
      !newAgent.status.trim() ||
      !newAgent.manager.trim()
    ) {
      return alert("⚠️ 모든 필드를 입력해주세요!");
    }

    const filledOptions = Object.entries(optionQtyMap)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([option_name, qty]) => ({
        option_name,
        qty: Number(qty),
        received: false,
      }));

    if (filledOptions.length === 0) {
      return alert("⚠️ 최소 1개 이상의 수량을 입력해주세요.");
    }

    const newEntry = {
      event_name: selectedEvent,
      contact_type: newAgent.contact_type,
      nickname: newAgent.nickname,
      status: newAgent.status,
      manager: newAgent.manager,
      fee: newAgent.fee.trim() === "" ? 0 : Number(newAgent.fee),
      is_received: false,
      items: filledOptions,
    };

    const { data, error } = await supabase
      .from("agents")
      .insert([newEntry])
      .select();

    if (error) return alert("❌ 저장 실패!");

    // orders 반영
    for (const { option_name, qty } of filledOptions) {
      const { data: target } = await supabase
        .from("orders")
        .select("id, needed_qty, proxy_qty")
        .eq("event_name", selectedEvent)
        .eq("option_name", option_name)
        .maybeSingle();

      if (target) {
        const newNeeded = target.needed_qty - qty;
        const newProxy = (target.proxy_qty ?? 0) + qty;

        await supabase
          .from("orders")
          .update({
            needed_qty: newNeeded,
            proxy_qty: newProxy,
            quantity: newNeeded,
          })
          .eq("id", target.id);
      }
    }

    setAgents((prev) => [...prev, data[0]]);
    await refreshCurrentEvent();
    handleClose();
  };

  const handleClose = () => {
    setNewAgent({
      contact_type: "",
      nickname: "",
      status: "",
      manager: "",
      fee: "",
    });
    setOptionQtyMap({});
    closeModal();
  };

  return (
    <div className="modal-overlay simple">
      <div className="modal-container simple">
        <h2 className="modal-title">구매자 추가</h2>

        {/* 기본 정보 */}
        <div className="form-section">
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

          <label>닉네임</label>
          <input
            type="text"
            value={newAgent.nickname}
            onChange={(e) =>
              setNewAgent({ ...newAgent, nickname: e.target.value })
            }
          />

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

          <label>수고비(₩)</label>
          <input
            type="number"
            value={newAgent.fee}
            placeholder="선택 입력 !!! 꼭 입력 안해도 돼"
            onChange={(e) =>
              setNewAgent({ ...newAgent, fee: e.target.value })
            }
          />
        </div>

        <h3 className="modal-subtitle">구매 옵션</h3>

        <div className="option-list">
          {eventOrders.map((item, idx) => (
            <div className="option-item" key={idx}>
              <span>{item.option_name}</span>
              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                min="0"
                value={optionQtyMap[item.option_name] || ""}
                placeholder="0"
                onChange={(e) =>
                  setOptionQtyMap((prev) => ({
                    ...prev,
                    [item.option_name]: e.target.value,
                  }))
                }
              />
            </div>
          ))}
        </div>

        <div className="modal-actions">
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
