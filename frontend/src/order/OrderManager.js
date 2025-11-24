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

  // ----------------------------------------------------
  // 이벤트 목록 불러오기
  // ----------------------------------------------------
  const fetchEventList = useCallback(async () => {
    const { data, error } = await supabase
      .from("events")
      .select("event_name, last_saved_time")
      .order("created_at", { ascending: false });

    if (!error) setEventList(data);
  }, []);

  // ----------------------------------------------------
  // 이벤트 상세 (orders + agents) 불러오기
  // ----------------------------------------------------
  const fetchEventDetails = useCallback(async (eventName) => {
    if (!eventName) return;

    const [ordersRes, agentsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .eq("event_name", eventName)
        .order("order_index"),
      supabase.from("agents").select("*").eq("event_name", eventName),
    ]);

    if (!ordersRes.error) {
      const cleaned = ordersRes.data.map((row) => ({
        ...row,
        needed_qty: row.needed_qty ?? row.quantity,
        proxy_qty: row.proxy_qty ?? 0,
        received_qty: row.received_qty ?? 0,
      }));

      setEventOrders(cleaned);
    }

    if (!agentsRes.error) setAgents(agentsRes.data);
  }, []);

  // ----------------------------------------------------
  // 첫 로딩 시 이벤트 목록 불러오기
  // ----------------------------------------------------
  useEffect(() => {
    fetchEventList();
  }, [fetchEventList]);

  // ----------------------------------------------------
  // 이벤트 선택 시 상세 정보 불러오기
  // ----------------------------------------------------
  useEffect(() => {
    fetchEventDetails(selectedEvent);
  }, [selectedEvent, fetchEventDetails]);

  // ----------------------------------------------------
  // 최신 정보 새로고침
  // ----------------------------------------------------
  const refreshCurrentEvent = async () => {
    if (selectedEvent) await fetchEventDetails(selectedEvent);
  };

  // ----------------------------------------------------
  // UI 렌더
  // ----------------------------------------------------
  return (
    <div className="order-manager-container">
      
      {/* 이벤트 목록 */}
      <EventList
        eventList={eventList}
        selectedEvent={selectedEvent}
        setSelectedEvent={(ev) => {
          setHighlightedOptions([]); // 선택 변경 시 강조 제거
          setSelectedEvent(ev);
        }}
        fetchEventList={fetchEventList}
        openUploadModal={() => setModal({ ...modal, upload: true })}
        openMergeModal={() => setModal({ ...modal, merge: true })}
      />

      {/* 마진 업로드 버튼 */}
      <div className="hide-on-mobile" style={{ textAlign: "left", marginTop: "10px" }}>
        <button
          className="mc-btn mc-btn-green"
          onClick={() => setModal({ ...modal, margin: true })}
        >
          마진 업로드
        </button>
      </div>

      {/* 좌측: 주문내역  우측: 구매자 목록 */}
      <div className="order-main-section">

        <OrderTable
          selectedEvent={selectedEvent}
          eventOrders={eventOrders}
          setEventOrders={setEventOrders}
          refreshCurrentEvent={refreshCurrentEvent}
          highlightedOptions={highlightedOptions}
          setHighlightedOptions={setHighlightedOptions}
          agents={agents}
        />

        <AgentList
          selectedEvent={selectedEvent}
          agents={agents}
          setAgents={setAgents}
          eventOrders={eventOrders}
          setEventOrders={setEventOrders}
          refreshCurrentEvent={refreshCurrentEvent}
          openAddAgentModal={() => setModal({ ...modal, addAgent: true })}
        />
      </div>

      {/* 모달들 */}
      {modal.upload && (
        <UploadEventModal
          closeModal={() => setModal({ ...modal, upload: false })}
          fetchEventList={fetchEventList}
        />
      )}

      {modal.merge && (
        <MergeEventModal
          closeModal={() => setModal({ ...modal, merge: false })}
          eventList={eventList}
          selectedEvent={selectedEvent}
          refreshCurrentEvent={refreshCurrentEvent}
          setHighlightedOptions={setHighlightedOptions}
        />
      )}

      {modal.addAgent && (
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
