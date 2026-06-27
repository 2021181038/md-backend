import { useState } from "react";
import { extractMd, ExtractMdError } from "../../api/mdApi";
import { formatExtractError } from "../../api/extractApi";
import { groupByCustomPrice } from "../utils/groupUtils";
import { generateDescription, generateMainName } from "../utils/descriptionUtils";
import { calculateOnlinePrice } from "../../utils/priceUtils";
import { generateAllKeywords } from "../../utils/keywordUtils";

export const useOnlineUpload = () => {
  const [images, setImages] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [thumbnailShippingDate, setThumbnailShippingDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [hasBonus, setHasBonus] = useState(false);
  const [hasAlbum, setHasAlbum] = useState(false);
  const [bonusSets, setBonusSets] = useState([{ base: "", label: "" }]);
  const [mdList, setMdList] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [mainName, setMainName] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [isKeywordLoading, setIsKeywordLoading] = useState(false);
  const [keywordType, setKeywordType] = useState("MD");
  const [keywords, setKeywords] = useState([]);

  const handleImageUpload = (e) => {
    setImages([...e.target.files]);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const newFiles = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        newFiles.push(blob);
      }
    }

    if (newFiles.length > 0) {
      setImages([...images, ...newFiles]);
    }
  };

  const handleGenerateMainName = () => {
    const result = generateMainName(
      groupName,
      thumbnailShippingDate,
      eventName,
      hasBonus
    );
    if (result) setMainName(result);
  };

  const handleGenerateDescription = () => {
    const html = generateDescription(
      thumbnailShippingDate,
      false,
      "",
      hasBonus,
      bonusSets,
      hasAlbum
    );
    if (html) setDetailDescription(html);
  };

  const handleSubmit = async () => {
    if (!images.length) {
      alert("이미지를 업로드해주세요.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setLoadingMessage("시작 중...");
    setErrorMsg("");

    try {
      const results = await extractMd(images, "online", {
        onProgress: setLoadingMessage,
      });
      setMdList(results);
    } catch (error) {
      console.error("에러 발생:", error);

      if (error instanceof ExtractMdError && error.partialResults.length > 0) {
        setMdList(error.partialResults);
      }

      setErrorMsg(`❌ ${formatExtractError(error)}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleOnetoThree = async () => {
    handleGenerateMainName();
    handleGenerateDescription();
    await handleSubmit();
  };

  const handleCopy = (text, label) => {
    if (!text) {
      alert(`${label}이(가) 없습니다.`);
      return;
    }
    navigator.clipboard.writeText(text)
      .catch((err) => {
        console.error("복사 실패:", err);
      });
  };

  const handleGroup = () => {
    const result = groupByCustomPrice(mdList);
    setGrouped(result);
  };

  const handleGenerateKeywords = () => {
    if (!keywordType) {
      alert("응원봉/앨범/MD/포카 중 하나를 선택하세요!");
      return;
    }

    if (!groupName) {
      alert("그룹명을 입력하세요!");
      return;
    }

    const keywordList = generateAllKeywords(groupName, keywordType);
    const formattedKeywords = keywordList.map(keyword => ({
      keyword: keyword,
      en: keyword,
      jp: keyword,
    }));

    setKeywords(formattedKeywords);
  };

  const updateMdItem = (idx, field, value) => {
    const newList = [...mdList];
    newList[idx][field] = value;
    setMdList(newList);
  };

  const convertToYen = (idx) => {
    const newList = [...mdList];
    const rawPrice = Number(newList[idx].price);

    if (!isNaN(rawPrice) && rawPrice > 0) {
      const finalPrice = calculateOnlinePrice(rawPrice);
      newList[idx].originalPriceKrw = rawPrice.toString();
      newList[idx].price = finalPrice.toString();
      setMdList(newList);
    } else {
      alert("숫자를 올바르게 입력해주세요!");
    }
  };

  const deleteMdItem = (idx) => {
    const newList = [...mdList];
    newList.splice(idx, 1);
    setMdList(newList);
  };

  const addMdItem = () => {
    setMdList([...mdList, { name: "", price: "", hasOption: false, optionText: "" }]);
  };

  return {
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
    loadingMessage,
    errorMsg,
    mainName,
    detailDescription,
    isKeywordLoading,
    keywordType,
    keywords,
    setGroupName,
    setThumbnailShippingDate,
    setEventName,
    setHasBonus,
    setHasAlbum,
    setBonusSets,
    setKeywordType,
    handleImageUpload,
    handlePaste,
    handleGenerateMainName,
    handleGenerateDescription,
    handleSubmit,
    handleOnetoThree,
    handleCopy,
    handleGroup,
    handleGenerateKeywords,
    updateMdItem,
    convertToYen,
    deleteMdItem,
    addMdItem,
    setMdList,
  };
};
