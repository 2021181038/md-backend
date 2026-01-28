import { useState, useEffect } from "react";
import { extractMd } from "../api/mdApi";
import { generateMainName, generateDescription } from "../utils/descriptionUtils";
import { groupByCustomPrice } from "../utils/priceUtils";
import { convertKrwToYenOffline, convertKrwToYenOnline } from "../utils/priceUtils";
import { extractImagesFromClipboard } from "../utils/imageUtils";

export const useUploadTab = () => {
  const [groupName, setGroupName] = useState('');
  const [eventName, setEventName] = useState('');
  const [hasBonus, setHasBonus] = useState(false);
  const [images, setImages] = useState([]);
  const [mdList, setMdList] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [thumbnailShippingDate, setThumbnailShippingDate] = useState('');
  const [mainName, setMainName] = useState('');
  const [detailDescription, setDetailDescription] = useState('');
  const [keywordType, setKeywordType] = useState('');
  const [memberText, setMemberText] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [isKeywordLoading, setIsKeywordLoading] = useState(false);
  const [bonusSets, setBonusSets] = useState([{ base: "", label: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasAlbum, setHasAlbum] = useState(false);
  const [hasPreorder, setHasPreorder] = useState(false);
  const [preorderShippingDate, setPreorderShippingDate] = useState('');

  useEffect(() => {
    if (bonusSets.length === 1 && bonusSets[0].base) {
      // 특전 조건 변경 시 처리
    }
  }, [bonusSets]);

  const handleImageUpload = (e) => {
    setImages([...e.target.files]);
  };

  const handlePaste = (e) => {
    const newFiles = extractImagesFromClipboard(e.clipboardData);
    if (newFiles.length > 0) {
      setImages([...images, ...newFiles]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const results = await extractMd(images, "offline");
      setMdList(results);
    } catch (error) {
      console.error("에러 발생:", error);
      setErrorMsg("❌ 상품 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMainName = () => {
    const result = generateMainName(groupName, thumbnailShippingDate, eventName, hasBonus);
    setMainName(result);
  };

  const handleGenerateDescription = () => {
    const result = generateDescription(
      thumbnailShippingDate,
      preorderShippingDate,
      hasBonus,
      hasPreorder,
      hasAlbum,
      bonusSets
    );
    setDetailDescription(result);
  };

  const handleOnetoThree = async () => {
    handleGenerateMainName();
    handleGenerateDescription();
    await handleSubmit();
  };

  const handleGroup = () => {
    const result = groupByCustomPrice(mdList);
    setGrouped(result);
  };

  const handleCopy = (text, label) => {
    if (!text) {
      alert(`${label}이(가) 없습니다.`);
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => {})
      .catch((err) => {
        console.error("복사 실패:", err);
      });
  };

  const convertToYen = (idx, priceMode = "offline") => {
    const newList = [...mdList];
    const rawPrice = Number(newList[idx].price);

    if (!isNaN(rawPrice) && rawPrice > 0) {
      let finalPrice;

      if (priceMode === "online") {
        finalPrice = convertKrwToYenOnline(rawPrice);
      } else {
        finalPrice = convertKrwToYenOffline(rawPrice);
      }

      newList[idx].originalPriceKrw = rawPrice.toString();
      newList[idx].price = finalPrice.toString();
      setMdList(newList);
    } else {
      alert("숫자를 올바르게 입력해주세요!");
    }
  };

  return {
    groupName,
    setGroupName,
    eventName,
    setEventName,
    hasBonus,
    setHasBonus,
    images,
    setImages,
    mdList,
    setMdList,
    grouped,
    setGrouped,
    thumbnailShippingDate,
    setThumbnailShippingDate,
    mainName,
    setMainName,
    detailDescription,
    setDetailDescription,
    keywordType,
    setKeywordType,
    memberText,
    setMemberText,
    keywords,
    setKeywords,
    isKeywordLoading,
    setIsKeywordLoading,
    bonusSets,
    setBonusSets,
    isLoading,
    setIsLoading,
    errorMsg,
    setErrorMsg,
    hasAlbum,
    setHasAlbum,
    hasPreorder,
    setHasPreorder,
    preorderShippingDate,
    setPreorderShippingDate,
    handleImageUpload,
    handlePaste,
    handleSubmit,
    handleGenerateMainName,
    handleGenerateDescription,
    handleOnetoThree,
    handleGroup,
    handleCopy,
    convertToYen,
  };
};

