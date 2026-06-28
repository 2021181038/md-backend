import React from "react";
import "./OrderManager.css";
import { useOrderManager } from "./hooks/useOrderManager";

import EventList from "./components/EventList";
import OrderTable from "./components/OrderTable";
import UploadEventModal from "./components/UploadEventModal";
import MergeEventModal from "./components/MergeEventModal";
import UploadMarginModal from "./components/UploadMarginModal";

function OrderManager() {
  const {
    eventList,
    selectedEvent,
    eventOrders,
    highlightedOptions,
    modal,
    setEventOrders,
    setHighlightedOptions,
    setSelectedEvent,
    refreshCurrentEvent,
    loadEventList,
    openModal,
    closeModal,
  } = useOrderManager();

  return (
    <div className="order-manager-container">
      <EventList
        eventList={eventList}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        fetchEventList={loadEventList}
        openUploadModal={() => openModal("upload")}
        openMergeModal={() => openModal("merge")}
      />

      <div className="hide-on-mobile" style={{ textAlign: "left", marginTop: "10px" }}>
        <button
          className="mc-btn mc-btn-green"
          onClick={() => openModal("margin")}
        >
          마진 업로드
        </button>
      </div>

      <div className="order-main-section">
        <OrderTable
          selectedEvent={selectedEvent}
          eventOrders={eventOrders}
          setEventOrders={setEventOrders}
          refreshCurrentEvent={refreshCurrentEvent}
          highlightedOptions={highlightedOptions}
          setHighlightedOptions={setHighlightedOptions}
        />
      </div>

      {modal.upload && (
        <UploadEventModal
          closeModal={() => closeModal("upload")}
          fetchEventList={loadEventList}
        />
      )}

      {modal.merge && (
        <MergeEventModal
          closeModal={() => closeModal("merge")}
          eventList={eventList}
          selectedEvent={selectedEvent}
          refreshCurrentEvent={refreshCurrentEvent}
          setHighlightedOptions={setHighlightedOptions}
        />
      )}

      {modal.margin && (
        <UploadMarginModal
          closeModal={() => closeModal("margin")}
          selectedEvent={selectedEvent}
          refreshCurrentEvent={refreshCurrentEvent}
        />
      )}
    </div>
  );
}

export default OrderManager;
