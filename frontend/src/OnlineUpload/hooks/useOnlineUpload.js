import { useState } from "react";
import { resizeImage, chunkArray } from "../../utils/imageUtils";
import { IMAGE_CONFIG } from "../../constants/config";
import { parseExtractedText } from "../utils/textUtils";
import { groupByCustomPrice } from "../utils/groupUtils";
import { generateDescription, generateMainName } from "../utils/descriptionUtils";
import { calculateOnlinePrice } from "../../utils/priceUtils";
import { extractMD, translateMembersEn, translateMembersJp } from "../api/onlineApi";

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
  const [errorMsg, setErrorMsg] = useState("");
  const [mainName, setMainName] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [isKeywordLoading, setIsKeywordLoading] = useState(false);
  const [keywordType, setKeywordType] = useState("MD");
  const [memberText, setMemberText] = useState("");
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
      false, // hasPreorder - 온라인 업로드에서는 사용하지 않음
      "", // preorderShippingDate - 온라인 업로드에서는 사용하지 않음
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
    setErrorMsg('');
    let allResults = [];

    try {
      // 이미지 리사이즈 (병렬 처리)
      const resizedImages = await Promise.all(images.map(img => resizeImage(img, IMAGE_CONFIG.MAX_SIZE)));
      const batches = chunkArray(resizedImages, IMAGE_CONFIG.BATCH_SIZE);
      const totalBatches = batches.length;

      // 배치를 병렬로 처리 (최대 3개 동시 처리로 속도 향상)
      const MAX_CONCURRENT = 3;
      const batchPromises = [];

      for (let i = 0; i < batches.length; i += MAX_CONCURRENT) {
        const batchGroup = batches.slice(i, i + MAX_CONCURRENT);
        
        const groupPromises = batchGroup.map(async (batch) => {
          const formData = new FormData();
          batch.forEach((file) => formData.append("images", file));
          
          try {
            const raw = await extractMD(formData);
            const parsed = parseExtractedText(raw);
            return parsed;
          } catch (error) {
            console.error(`배치 처리 오류:`, error);
            // 개별 배치 실패 시 빈 배열 반환 (다른 배치는 계속 처리)
            return [];
          }
        });

        const groupResults = await Promise.all(groupPromises);
        allResults = [...allResults, ...groupResults.flat()];
        
        if (process.env.NODE_ENV === 'development') {
          const completedBatches = Math.min(i + MAX_CONCURRENT, totalBatches);
          console.log(`이미지 처리 진행: ${completedBatches}/${totalBatches} 배치 완료`);
        }
      }

      // 결과 정리 및 번호 부여
      allResults = allResults.map((item, idx) => {
        if (/^\[\d+\]/.test(item.name)) {
          return item;
        } else {
          return { ...item, name: `[${idx + 1}] ${item.name}` };
        }
      });

      setMdList(allResults);
    } catch (error) {
      console.error("에러 발생:", error);
      setErrorMsg("❌ 상품 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
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

  const handleGenerateKeywords = async () => {
    if (!keywordType) {
      alert("응원봉/앨범/MD/포카 중 하나를 선택하세요!");
      return;
    }

    if (!memberText) {
      alert("멤버명을 입력하세요!");
      return;
    }

    if (!groupName) {
      alert("그룹명을 입력하세요!");
      return;
    }

    const members = memberText
      .split(",")
      .map(m => m.trim())
      .filter(Boolean);

    if (members.length === 0) {
      alert("멤버명을 올바르게 입력하세요.");
      return;
    }

    setIsKeywordLoading(true);

    try {
      const [translatedMembersEn, translatedMembersJp, groupNameJpArr] = await Promise.all([
        translateMembersEn(members),
        translateMembersJp(members),
        translateMembersJp([groupName]),
      ]);

      if (!translatedMembersEn.length || !translatedMembersJp.length) {
        alert("키워드 생성에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      const groupNameJp = groupNameJpArr[0] || groupName;
      const groupNameEn = groupName;

      let extraKeywordEn = "";
      let extraKeywordJp = "";

      if (keywordType === "アルバム") {
        extraKeywordEn = "CD";
        extraKeywordJp = "CD";
      } else if (keywordType === "포카" || keywordType === "フォトカード") {
        extraKeywordEn = "POCA";
        extraKeywordJp = "ポカ";
      }

      const memberKeywords = members.map((_, idx) => ({
        en: translatedMembersEn[idx] || "",
        jp: translatedMembersJp[idx] || "",
        type: "member",
      }));

      const finalKeywords = [
        {
          en: `${groupNameEn} ${keywordType} ${extraKeywordEn}`.trim(),
          jp: `${groupNameJp} ${keywordType} ${extraKeywordJp}`.trim(),
          type: "main",
        },
        ...memberKeywords,
      ];

      setKeywords(finalKeywords);
    } catch (error) {
      console.error("키워드 추출 실패:", error);
      alert("키워드 생성 중 오류가 발생했습니다.");
    } finally {
      setIsKeywordLoading(false);
    }
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
    // State
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
    // Setters
    setGroupName,
    setThumbnailShippingDate,
    setEventName,
    setHasBonus,
    setHasAlbum,
    setBonusSets,
    setKeywordType,
    setMemberText,
    // Handlers
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

