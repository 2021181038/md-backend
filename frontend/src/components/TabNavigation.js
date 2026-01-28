import React from "react";
import PropTypes from "prop-types";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "upload", label: "현장구매 업로드" },
    { id: "online", label: "온라인 업로드" },
    { id: "album", label: "앨범 업로드" },
    { id: "margin", label: "마진 계산기" },
    { id: "order", label: "주문 정리" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        marginBottom: "20px",
        borderBottom: "2px solid #ddd",
        paddingBottom: "10px"
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`pretty-button tab-${tab.id}`}
          style={{
            backgroundColor: activeTab === tab.id ? "#33418f" : "#777",
            width: "150px"
          }}
          onClick={() => setActiveTab(tab.id)}
          aria-label={`${tab.label} 탭으로 전환`}
          aria-pressed={activeTab === tab.id}
          role="tab"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

TabNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default TabNavigation;

