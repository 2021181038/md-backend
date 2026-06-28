import React from "react";
import PropTypes from "prop-types";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "upload", label: "MD 업로드" },
    { id: "album", label: "앨범 업로드" },
    { id: "margin", label: "마진 계산기" },
    { id: "order", label: "주문 정리" },
  ];

  return (
    <nav className="tab-bar" role="tablist" aria-label="메인 메뉴">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-pill tab-${tab.id}${activeTab === tab.id ? " active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
          aria-label={`${tab.label} 탭으로 전환`}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

TabNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default TabNavigation;
