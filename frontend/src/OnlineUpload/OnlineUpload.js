import React from "react";
import { useOnlineUpload } from "./hooks/useOnlineUpload";
import FormSection from "./components/FormSection";
import BonusSection from "./components/BonusSection";
import MainNameSection from "./components/MainNameSection";
import DescriptionSection from "./components/DescriptionSection";
import ProductTableSection from "./components/ProductTableSection";
import GroupSection from "./components/GroupSection";
import KeywordSection from "./components/KeywordSection";

function OnlineUpload() {
  const {
    images,
    groupName,
    thumbnailShippingDate,
    eventName,
    hasBonus,
    hasAlbum,
    bonusSets,
    mdList,
    grouped,
    isLoading,
    errorMsg,
    mainName,
    detailDescription,
    isKeywordLoading,
    keywordType,
    memberText,
    keywords,
    setGroupName,
    setThumbnailShippingDate,
    setEventName,
    setHasBonus,
    setHasAlbum,
    setBonusSets,
    setKeywordType,
    setMemberText,
    handleImageUpload,
    handlePaste,
    handleOnetoThree,
    handleCopy,
    handleGroup,
    handleGenerateKeywords,
    updateMdItem,
    convertToYen,
    deleteMdItem,
    addMdItem,
  } = useOnlineUpload();

  return (
    <div style={{ padding: "20px" }}>
      <h2>온라인 업로드</h2>

      <FormSection
        images={images}
        groupName={groupName}
        thumbnailShippingDate={thumbnailShippingDate}
        eventName={eventName}
        hasBonus={hasBonus}
        hasAlbum={hasAlbum}
        handleImageUpload={handleImageUpload}
        handlePaste={handlePaste}
        setGroupName={setGroupName}
        setThumbnailShippingDate={setThumbnailShippingDate}
        setEventName={setEventName}
        setHasBonus={setHasBonus}
        setHasAlbum={setHasAlbum}
      />

      {hasBonus && (
        <BonusSection bonusSets={bonusSets} setBonusSets={setBonusSets} />
      )}

      <hr />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '10px' }}>
        <button
          className="pretty-button"
          style={{ marginTop: '20px' }}
          onClick={handleOnetoThree}
        >
          위에 모두 입력 후 눌러주세요
        </button>

        {isLoading && (
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <div className="spinner"></div>
            <p>상품 정보를 불러오는 중입니다...</p>
          </div>
        )}

        {errorMsg && (
          <div style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}
      </div>

      <MainNameSection mainName={mainName} handleCopy={handleCopy} />

      <DescriptionSection detailDescription={detailDescription} />

      <ProductTableSection
        mdList={mdList}
        updateMdItem={updateMdItem}
        convertToYen={convertToYen}
        deleteMdItem={deleteMdItem}
        addMdItem={addMdItem}
      />

      <GroupSection grouped={grouped} handleGroup={handleGroup} />

      <KeywordSection
        keywordType={keywordType}
        setKeywordType={setKeywordType}
        memberText={memberText}
        setMemberText={setMemberText}
        isKeywordLoading={isKeywordLoading}
        handleGenerateKeywords={handleGenerateKeywords}
        keywords={keywords}
        handleCopy={handleCopy}
      />
    </div>
  );
}

export default OnlineUpload;
