import React from "react";
import "./MarginCalculator.css";
import { useMarginCalculator } from "./hooks/useMarginCalculator";
import FileUploadSection from "./components/FileUploadSection";
import ProductSelectionSection from "./components/ProductSelectionSection";
import ActionButtonsSection from "./components/ActionButtonsSection";
import TextExtractSection from "./components/TextExtractSection";
import SummarySection from "./components/SummarySection";
import ResultTable from "./components/ResultTable";
import TotalMarginSection from "./components/TotalMarginSection";

function MarginCalculator() {
  const {
    productNames,
    selectedNames,
    summary,
    settlementData,
    matchedSummary,
    totalMargin,
    extractedText,
    totalProxyFee,
    dutyApplied,
    proxyApplied,
    divideMap,
    setSelectedNames,
    setDutyApplied,
    setProxyApplied,
    setDivideMap,
    handleFileUpload,
    handleSettlementUpload,
    toggleSelect,
    handleSummarize,
    handleMatchSettlement,
    handleTotalMargin,
    handleExtractText,
    handleOptionChange,
    handleQtyChange,
    handleCostChange,
    handleExportCSV,
    calculateMarginForRow,
  } = useMarginCalculator();

  return (
    <div className="margin-container">
      <FileUploadSection
        handleFileUpload={handleFileUpload}
        handleSettlementUpload={handleSettlementUpload}
      />

      <ProductSelectionSection
        productNames={productNames}
        selectedNames={selectedNames}
        toggleSelect={toggleSelect}
        setSelectedNames={setSelectedNames}
      />

      <ActionButtonsSection
        selectedNames={selectedNames}
        summary={summary}
        settlementData={settlementData}
        matchedSummary={matchedSummary}
        handleSummarize={handleSummarize}
        handleMatchSettlement={handleMatchSettlement}
        handleTotalMargin={handleTotalMargin}
        handleExtractText={handleExtractText}
        setProxyApplied={setProxyApplied}
      />

      <TextExtractSection extractedText={extractedText} />

      <TotalMarginSection totalMargin={totalMargin} totalProxyFee={totalProxyFee} />

      {matchedSummary.length > 0 ? (
        <ResultTable
          matchedSummary={matchedSummary}
          calculateMarginForRow={calculateMarginForRow}
          dutyApplied={dutyApplied}
          setDutyApplied={setDutyApplied}
          proxyApplied={proxyApplied}
          setProxyApplied={setProxyApplied}
          divideMap={divideMap}
          setDivideMap={setDivideMap}
          handleOptionChange={handleOptionChange}
          handleQtyChange={handleQtyChange}
          handleCostChange={handleCostChange}
        />
      ) : (
        <SummarySection summary={summary} />
      )}

      {summary.length > 0 && (
        <button onClick={handleExportCSV} className="mc-btn mc-btn-green">
          💾 CSV로 내보내기
        </button>
      )}
    </div>
  );
}

export default MarginCalculator;
