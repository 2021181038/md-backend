import { useState } from "react";
import { convertToYen, convertSingleToYen } from "../../utils/priceUtils";
import { getMultiplier, getRowHighlight } from "../utils/highlightUtils";
import { isRowHighlighted, calcPreviewResult } from "../utils/rowUtils";
import { generateMainProductName, generateDescription } from "../utils/productUtils";
import { collectAllItems, groupByCustomPrice, judgeOptionResult } from "../utils/groupUtils";
import { translateMembersEn, translateMembersJp } from "../api/albumApi";

export const useAlbumUpload = () => {
  const [sets, setSets] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [eventName, setEventName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [popupSeller, setPopupSeller] = useState("");
  const [tempProductName, setTempProductName] = useState("");
  const [tempMemberCount, setTempMemberCount] = useState("");
  const [tempBasePrice, setTempBasePrice] = useState("");
  const [groupedData, setGroupedData] = useState([]);
  const [mainProductName, setMainProductName] = useState("");
  const [isMemberSelectable, setIsMemberSelectable] = useState(false);
  const [isSiteSelectable, setIsSiteSelectable] = useState(false);
  const [hasBonus, setHasBonus] = useState(false);
  const [bonusAlbumName, setBonusAlbumName] = useState("");
  const [memberText, setMemberText] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [albumNameEn, setAlbumNameEn] = useState("");
  const [albumNameJp, setAlbumNameJp] = useState("");

  const handleGenerateMainProductName = () => {
    const result = generateMainProductName(
      groupName,
      eventName,
      releaseDate,
      isMemberSelectable,
      isSiteSelectable,
      hasBonus
    );
    if (result) setMainProductName(result);
  };

  const handleGenerateDescription = () => {
    const text = generateDescription(
      groupName,
      eventName,
      releaseDate,
      hasBonus,
      bonusAlbumName
    );
    if (text) setDetailDescription(text);
  };

  const handleGenerateAll = () => {
    handleGenerateMainProductName();
    handleGenerateDescription();
  };

  const handleGenerateKeywordsAlbum = async () => {
    if (!memberText) {
      alert("멤버명을 입력하세요!");
      return;
    }

    const members = memberText
      .split(",")
      .map(m => m.trim())
      .filter(Boolean);

    try {
      const translatedMembersEn = await translateMembersEn(members);
      const translatedMembersJp = await translateMembersJp(members);
      const groupNameJpArr = await translateMembersJp([groupName]);
      const groupNameJp = groupNameJpArr[0] || groupName;

      const extraKeywordEn = "CD";
      const extraKeywordJp = "CD";

      const albumNameEnValue = eventName;
      const albumNameJpArr = await translateMembersJp([eventName]);
      const albumNameJpValue = albumNameJpArr[0] || eventName;

      setAlbumNameEn(albumNameEnValue);
      setAlbumNameJp(albumNameJpValue);

      const result = members.map((_, idx) => ({
        en: translatedMembersEn[idx] || "",
        jp: translatedMembersJp[idx] || "",
        type: "member"
      }));

      const finalKeywords = [
        {
          en: `${groupName} ${albumNameEnValue} ${extraKeywordEn}`.trim(),
          jp: `${groupNameJp} ${albumNameJpValue} ${extraKeywordJp}`.trim(),
          type: "main"
        },
        ...result
      ];

      setKeywords(finalKeywords);
    } catch (error) {
      console.error("키워드 추출 실패:", error);
      alert("키워드 생성 실패");
    }
  };

  const removeSet = (setId) => {
    if (!window.confirm("이 옵션 상품을 삭제할까요?")) return;
    setSets(prev => prev.filter(s => s.id !== setId));
  };

  const canGroupPrices = () => {
    const optionSets = sets.filter(s => s.type === "withOption");
    if (optionSets.length === 0) return true;
    return optionSets.every(s => s.memberLocked);
  };

  const updateMultiplier = (setId, rowIndex, value) => {
    setSets(prev =>
      prev.map(s => {
        if (s.id !== setId) return s;

        const updatedRows = s.rows.map((r, i) => {
          if (i !== rowIndex) return r;

          if (value === "") {
            return {
              ...r,
              multiplier: "",
            };
          }

          const mul = value;
          const newKrw = Math.round(Number(s.basePrice) * mul);
          const newYen = convertToYen(newKrw);

          return {
            ...r,
            multiplier: mul,
            priceKrw: newKrw,
            priceYen: newYen,
          };
        });

        return { ...s, rows: updatedRows };
      })
    );
  };

  const handleMemberNameChange = (setId, rowIndex, value) => {
    setSets(prev =>
      prev.map(s =>
        s.id === setId
          ? {
              ...s,
              rows: s.rows.map((r, i) =>
                i === rowIndex ? { ...r, memberName: value } : r
              ),
            }
          : s
      )
    );
  };

  const handleConfirmMembers = (setId) => {
    setSets(prev =>
      prev.map(s => {
        if (s.id !== setId) return s;

        const memberCount = s.rows.length;
        const highlightedRows = s.rows.filter(r =>
          getRowHighlight(r.rank, s.rows.length)
        );

        const purchaseCost = Number(s.basePrice) * memberCount;
        const expectedSales = highlightedRows.reduce(
          (acc, r) => acc + Number(r.priceKrw),
          0
        );

        const result = judgeOptionResult(
          s.rows,
          purchaseCost,
          expectedSales
        );

        return {
          ...s,
          optionCheckResult: result,
          purchaseCost,
          expectedSales,
        };
      })
    );
  };

  const toggleEditMode = (setId) => {
    setSets(prev =>
      prev.map(s =>
        s.id === setId ? { ...s, editing: !s.editing } : s
      )
    );
  };

  const createOptionSet = () => {
    const N = Number(tempMemberCount);
    const base = Number(tempBasePrice);

    if (!tempProductName || !N || !base) {
      alert("상품명, 멤버수, 원가를 모두 입력해주세요!");
      return;
    }

    const rows = [];
    for (let r = 1; r <= N; r++) {
      const mul = getMultiplier(r, N);
      const priceKrw = Math.round(base * mul);
      const priceYen = convertToYen(priceKrw);

      rows.push({
        rank: r,
        multiplier: mul,
        memberName: "",
        priceKrw,
        priceYen,
        isHighlighted: null,
      });
    }

    const newSet = {
      id: Date.now(),
      type: "withOption",
      productName: tempProductName,
      seller: popupSeller,
      basePrice: base,
      rows,
      editing: false,
      optionCheckResult: "",
      purchaseCost: 0,
      expectedSales: 0,
      memberLocked: false,
    };

    setSets((prev) => [...prev, newSet]);

    setTempProductName("");
    setTempMemberCount("");
    setTempBasePrice("");
    setPopupSeller("");
  };

  const createSingleSet = () => {
    const newSet = {
      id: Date.now(),
      type: "single",
      rows: [
        {
          productName: "",
          priceKrw: "",
          priceYen: "",
        },
      ],
    };

    setSets((prev) => [...prev, newSet]);
  };

  const addRowToSingleSet = (setId) => {
    setSets(prev =>
      prev.map(s =>
        s.id === setId
          ? {
              ...s,
              rows: [
                ...s.rows,
                { productName: "", priceKrw: "", priceYen: "" },
              ],
            }
          : s
      )
    );
  };

  const updateSingleRow = (setId, idx, field, value) => {
    setSets(prev =>
      prev.map(s => {
        if (s.id !== setId) return s;

        const updated = [...s.rows];
        updated[idx] = { ...updated[idx], [field]: value };

        if (field === "priceKrw" && value) {
          updated[idx].priceYen = convertSingleToYen(value);
        }

        return { ...s, rows: updated };
      })
    );
  };

  const handleGroupPrices = () => {
    if (!canGroupPrices()) {
      alert("옵션 상품의 멤버명 입력을 먼저 완료해주세요.");
      return;
    }

    const all = collectAllItems(sets);
    if (all.length === 0) {
      alert("상품이 없습니다!");
      return;
    }

    const groups = groupByCustomPrice(all);
    if (!groups) return;

    const optionGroupMap = {};
    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      for (let i = 0; i < group.items.length; i++) {
        const item = group.items[i];
        if (!item.hasOption) continue;

        const baseName = item.name.split(" - ")[0];
        if (!optionGroupMap[baseName]) {
          optionGroupMap[baseName] = g;
        } else if (optionGroupMap[baseName] !== g) {
          const memberName = item.name.split(" - ")[1] || item.name;
          alert(`${memberName} 가격을 조정해야해요. 같은 상품은 하나의 그룹에 묶이게!`);
          return;
        }
      }
    }

    setGroupedData(groups);
  };

  const handleCopyDescription = async () => {
    if (!detailDescription) {
      alert("복사할 상세페이지 글이 없습니다.");
      return;
    }

    try {
      await navigator.clipboard.writeText(detailDescription);
    } catch (err) {
      alert("복사에 실패했습니다. 브라우저를 확인해주세요.");
    }
  };

  const toggleRowHighlight = (setId, rowIndex) => {
    setSets(prev =>
      prev.map(s => {
        if (s.id !== setId) return s;

        return {
          ...s,
          rows: s.rows.map((row, i) =>
            i === rowIndex
              ? {
                  ...row,
                  isHighlighted:
                    row.isHighlighted === null
                      ? !getRowHighlight(row.rank, s.rows.length)
                      : !row.isHighlighted,
                }
              : row
          ),
        };
      })
    );
  };

  const lockMemberNames = (setId) => {
    setSets(prev =>
      prev.map(s =>
        s.id === setId ? { ...s, memberLocked: true } : s
      )
    );
  };

  const removeRowFromSingleSet = (setId, idx) => {
    setSets((prev) =>
      prev.map((s) =>
        s.id === setId
          ? {
              ...s,
              rows: s.rows.filter((_, rI) => rI !== idx),
            }
          : s
      )
    );
  };

  return {
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
    handleGenerateMainProductName,
    handleGenerateDescription,
    handleGenerateKeywordsAlbum,
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
    removeRowFromSingleSet,
    isRowHighlighted,
    calcPreviewResult,
    judgeOptionResult,
    setSets,
  };
};

