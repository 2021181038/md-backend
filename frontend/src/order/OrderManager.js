import React from "react";
import "./OrderManager.css";
import { useOrderManager } from "./hooks/useOrderManager";

import EventList from "./components/EventList";
import OrderTable from "./components/OrderTable";
import AgentList from "./components/AgentList";
import AddAgentModal from "./components/AddAgentModal";
import UploadEventModal from "./components/UploadEventModal";
import MergeEventModal from "./components/MergeEventModal";
import UploadMarginModal from "./components/UploadMarginModal";
import AddOptionModal from "./components/AddOptionModal";

function OrderManager() {
  const {
    eventList,
    selectedEvent,
    eventOrders,
    agents,
    highlightedOptions,
    modal,
    setEventOrders,
    setAgents,
    setHighlightedOptions,
    setSelectedEvent,
    refreshCurrentEvent,
    loadEventList,
    openModal,
    closeModal,
    setModal,
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
          agents={agents}
        />

        <AgentList
          selectedEvent={selectedEvent}
          agents={agents}
          setAgents={setAgents}
          eventOrders={eventOrders}
          setEventOrders={setEventOrders}
          refreshCurrentEvent={refreshCurrentEvent}
          openAddAgentModal={() => openModal("addAgent")}
          openAddOptionModal={(agent) => {
            setModal((prev) => ({ ...prev, addOption: agent }));
          }}
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

      {modal.addAgent && (
        <AddAgentModal
          closeModal={() => closeModal("addAgent")}
          selectedEvent={selectedEvent}
          eventOrders={eventOrders}
          setAgents={setAgents}
          refreshCurrentEvent={refreshCurrentEvent}
        />
      )}

      {modal.margin && (
        <UploadMarginModal
          closeModal={() => closeModal("margin")}
          selectedEvent={selectedEvent}
          refreshCurrentEvent={refreshCurrentEvent}
        />
      )}

      {modal.addOption && (
        <AddOptionModal
          closeModal={() => closeModal("addOption")}
          agent={modal.addOption}
          eventOrders={eventOrders}
          setEventOrders={setEventOrders}
          setAgents={setAgents}
          selectedEvent={selectedEvent}
        />
      )}
    </div>
  );
}

export default OrderManager;
