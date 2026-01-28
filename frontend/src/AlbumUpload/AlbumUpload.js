import React from "react";
import "./AlbumUpload.css";
import { useAlbumUpload } from "./hooks/useAlbumUpload";
import BasicInfoSection from "./components/BasicInfoSection";
import OptionSetSection from "./components/OptionSetSection";
import SingleSetSection from "./components/SingleSetSection";
import GroupResultSection from "./components/GroupResultSection";
import KeywordSection from "./components/KeywordSection";

function AlbumUpload() {
  const {
    // State
    sets,
    groupName,
    setGroupName,
    eventName,
    setEventName,
    releaseDate,
    setReleaseDate,
    detailDescription,
    popupSeller,
    setPopupSeller,
    tempProductName,
    setTempProductName,
    tempMemberCount,
    setTempMemberCount,
    tempBasePrice,
    setTempBasePrice,
    groupedData,
    mainProductName,
    isMemberSelectable,
    setIsMemberSelectable,
    isSiteSelectable,
    setIsSiteSelectable,
    hasBonus,
    setHasBonus,
    bonusAlbumName,
    setBonusAlbumName,
    memberText,
    setMemberText,
    keywords,
    albumNameEn,
    albumNameJp,
    // Handlers
    handleGenerateAll,
    handleCopyDescription,
    removeSet,
    canGroupPrices,
    updateMultiplier,
    handleMemberNameChange,
    handleConfirmMembers,
    toggleEditMode,
    createOptionSet,
    createSingleSet,
    addRowToSingleSet,
    updateSingleRow,
    handleGroupPrices,
    toggleRowHighlight,
    lockMemberNames,
    isRowHighlighted,
    calcPreviewResult,
    judgeOptionResult,
    removeRowFromSingleSet,
    handleGenerateKeywordsAlbum,
  } = useAlbumUpload();

  return (
    <div className="album-upload-wrapper">
      <BasicInfoSection
        groupName={groupName}
        setGroupName={setGroupName}
        eventName={eventName}
        setEventName={setEventName}
        releaseDate={releaseDate}
        setReleaseDate={setReleaseDate}
        isMemberSelectable={isMemberSelectable}
        setIsMemberSelectable={setIsMemberSelectable}
        isSiteSelectable={isSiteSelectable}
        setIsSiteSelectable={setIsSiteSelectable}
        hasBonus={hasBonus}
        setHasBonus={setHasBonus}
        bonusAlbumName={bonusAlbumName}
        setBonusAlbumName={setBonusAlbumName}
        handleGenerateAll={handleGenerateAll}
        mainProductName={mainProductName}
        detailDescription={detailDescription}
        handleCopyDescription={handleCopyDescription}
      />

      <div className="option-add-wrapper">
        <div className="section-box">
          <h3>멤버(종류)선택 없는 상품</h3>
          <button className="btn-primary" onClick={createSingleSet}>
            생성
          </button>
        </div>

        <div className="section-box">
          <h3>멤버(종류)선택 있는 상품</h3>
          <div className="option-input-column">
            <input
              type="text"
              placeholder="옵션1 - 앨범종류 입력"
              value={tempProductName}
              onChange={(e) => setTempProductName(e.target.value.toUpperCase())}
            />
            <input
              type="text"
              placeholder="옵션2 - 쉼표 구분, 판매처 입력"
              value={popupSeller}
              onChange={(e) => setPopupSeller(e.target.value.toUpperCase())}
            />
            <input
              type="number"
              placeholder="옵션3 - 멤버/종류 수 입력"
              value={tempMemberCount}
              onChange={(e) => setTempMemberCount(e.target.value)}
            />
            <input
              type="number"
              placeholder="원가 (₩) "
              value={tempBasePrice}
              onChange={(e) => setTempBasePrice(e.target.value)}
            />
            <button className="btn-primary" onClick={createOptionSet}>
              생성
            </button>
          </div>
        </div>
      </div>

      <div className="set-container">
        {sets.map((set) => (
          <div key={set.id} className="set-box">
            {set.type === "withOption" && (
              <OptionSetSection
                set={set}
                isRowHighlighted={isRowHighlighted}
                calcPreviewResult={calcPreviewResult}
                judgeOptionResult={judgeOptionResult}
                updateMultiplier={updateMultiplier}
                handleMemberNameChange={handleMemberNameChange}
                toggleEditMode={toggleEditMode}
                toggleRowHighlight={toggleRowHighlight}
                removeSet={removeSet}
                lockMemberNames={lockMemberNames}
                handleConfirmMembers={handleConfirmMembers}
              />
            )}

            {set.type === "single" && (
              <SingleSetSection
                set={set}
                updateSingleRow={updateSingleRow}
                addRowToSingleSet={addRowToSingleSet}
                removeRowFromSingleSet={removeRowFromSingleSet}
              />
            )}
          </div>
        ))}
      </div>

      <GroupResultSection
        groupedData={groupedData}
        sets={sets}
        canGroupPrices={canGroupPrices}
        handleGroupPrices={handleGroupPrices}
      />

      <KeywordSection
        memberText={memberText}
        setMemberText={setMemberText}
        handleGenerateKeywordsAlbum={handleGenerateKeywordsAlbum}
        keywords={keywords}
        groupName={groupName}
        albumNameEn={albumNameEn}
        albumNameJp={albumNameJp}
      />
    </div>
  );
}

export default AlbumUpload;
