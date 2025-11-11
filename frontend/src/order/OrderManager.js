import React, { useState, useEffect, useCallback } from "react";
import "./OrderManager.css";
import { supabase } from "./supabaseClient";

import EventList from "./components/EventList";
import OrderTable from "./components/OrderTable";
import AgentList from "./components/AgentList";
import AddAgentModal from "./components/AddAgentModal";
import UploadEventModal from "./components/UploadEventModal";
import MergeEventModal from "./components/MergeEventModal";
import UploadMarginModal from "./components/UploadMarginModal";

function OrderManager() {
  const [eventList, setEventList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventOrders, setEventOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [modal, setModal] = useState({
  upload: false,
  merge: false,
  addAgent: false,
  margin: false, 
});
const [highlightedOptions, setHighlightedOptions] = useState([]);

  // ✅ 이벤트 목록 불러오기
  const fetchEventList = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("event_name, last_saved_time")
      .order("created_at", { ascending: false });
    if (!error) setEventList(data);
  }, []);

  // ✅ 이벤트 상세 불러오기 (orders + agents)
const fetchEventDetails = useCallback(async (eventName) => {
  if (!eventName) return;
  const [ordersRes, agentsRes] = await Promise.all([
    supabase.from("orders").select("*").eq("event_name", eventName).order("order_index"),
    supabase.from("agents").select("*").eq("event_name", eventName),
  ]);

  if (!ordersRes.error) {
    const cleanedOrders = ordersRes.data.map((row) => ({
      ...row,
      needed_qty: row.quantity,  // ✅ quantity → 구매필요 수량으로 인식
      received_qty: row.received_qty ?? 0, // ✅ 기본값 0
    }));
    setEventOrders(cleanedOrders);
  }

  if (!agentsRes.error) setAgents(agentsRes.data);
}, []);


  // ✅ 새로고침 하기 전까지는 다시 작동 안함 
  useEffect(() => {
    fetchEventList();
  }, [fetchEventList]);

  // ✅ 이벤트 변경 시 다시 작동함
  useEffect(() => {
    fetchEventDetails(selectedEvent);
  }, [selectedEvent, fetchEventDetails]);

  //무언가 바뀐게 있을 때 바뀐걸 기준으로 최신 데이터를 다시 불러옴
  const refreshCurrentEvent = async () => {
    if (selectedEvent) await fetchEventDetails(selectedEvent);
  };

  return (
    <div className="order-manager-container">
      {/* 부모 컴포넌트(orderManager)가 자식 컴포넌트들에게 props를 넘겨주는 것임 */}
      {/* 상단: 이벤트 목록 */}
      <EventList
        eventList={eventList} //전체 이벤트 목록
        selectedEvent={selectedEvent} //현재 선택된 이벤트명
        setSelectedEvent={setSelectedEvent} //선택된 이벤트를 바꿀 때 사용하는 상태 업데이트 함수
        fetchEventList={fetchEventList} //이벤트 삭제,추가할 경우 최신 목록 갱신을 위해 사용
        openUploadModal={() => setModal({ ...modal, upload: true })} //새 이벤트 등록 버튼 누를 경우, 모달을 여는 함수
        openMergeModal={() => setModal({ ...modal, merge: true })} //기존 이벤트 병합 버튼 누를 경우, 모달을 여는 함수
      />
      {/* 마진 업로드 버튼 */}
      <div style={{ textAlign: "left", marginTop: "10px" }}>
        <button
          className="mc-btn mc-btn-green"
          onClick={() => setModal({ ...modal, margin: true })}
        >
          마진 업로드
        </button>
      </div>

      {/* 본문: 주문 내역(왼쪽) + 대리구매리스트(오른쪽) */}
      <div className="order-main-section">
        <OrderTable
          selectedEvent={selectedEvent} //현재 선택된 이벤트 이름
          eventOrders={eventOrders} //그 이벤트의 주문 내역
          setEventOrders={setEventOrders} //수량 수정 시, 주문 내역 상태 업데이트 하는 함수
          refreshCurrentEvent={refreshCurrentEvent} //저장이나 삭제 후 최신 데이터 불러오기
          highlightedOptions={highlightedOptions}
          setHighlightedOptions={setHighlightedOptions}
          agents={agents}
        />
        <AgentList
        selectedEvent={selectedEvent} //현재 선택된 이벤트 이름
        agents={agents} //그 이벤트의 대리 구매자 목록
        setAgents={setAgents} //대리 구매자 목록 상태 변경 함수
        eventOrders={eventOrders} //수량 조정이나 수령 완료 시 함께 반영되는 현재 주문 내역
        setEventOrders={setEventOrders} //주문 내역 상태 업데이트 함수
        refreshCurrentEvent={refreshCurrentEvent} //수령 완료 후, 최신 상태로 새로고침하는 함수
        openAddAgentModal={() => setModal({ ...modal, addAgent: true })} //구매자 추가 버튼 눌렀을 때 모달 여는 함수
      />

      </div>

      {/* 모달 */}
      {modal.upload && (
        //새 이벤트 등록 
        <UploadEventModal
          closeModal={() => setModal({ ...modal, upload: false })}
          fetchEventList={fetchEventList}
        />
      )}
      {modal.merge && (
        //기존 이벤트 병합
        <MergeEventModal
          closeModal={() => setModal({ ...modal, merge: false })}
          eventList={eventList}
          selectedEvent={selectedEvent}
          refreshCurrentEvent={refreshCurrentEvent}
          setHighlightedOptions={setHighlightedOptions}
        />
      )}
      {modal.addAgent && (
        //구매자 추가
        <AddAgentModal
          closeModal={() => setModal({ ...modal, addAgent: false })}
          selectedEvent={selectedEvent}
          eventOrders={eventOrders}
          setAgents={setAgents}
          refreshCurrentEvent={refreshCurrentEvent}
        />
      )}

      {modal.margin && (
        <UploadMarginModal
          closeModal={() => setModal({ ...modal, margin: false })}
          selectedEvent={selectedEvent}
          refreshCurrentEvent={refreshCurrentEvent}
        />
      )}

    </div>
  );
}

export default OrderManager;
