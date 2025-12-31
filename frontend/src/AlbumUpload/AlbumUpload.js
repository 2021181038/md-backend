import React, { useState } from "react";
import "./AlbumUpload.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// 끝 두 자리를 90으로 맞추기
const applyEnding90 = (yen) => {
  return Math.floor(yen / 100) * 100 + 90;
};

// 원화 → 엔화
const convertToYen = (krw) => {
  if (!krw || Number(krw) <= 0) return 0;
  let yen = Math.round(Number(krw) / 9.32);
  return applyEnding90(yen);
};

// 옵션 X 전용 엔화 변환 (×1.6 적용)
const convertSingleToYen = (krw) => {
  if (!krw || Number(krw) <= 0) return 0;
  let yen = Math.round(Number(krw) / 9.42);
  yen = Math.round(yen * 1.6);
  return Math.floor(yen / 100) * 100 + 90;
};

  const isRowHighlighted = (row, total) => {
  if (row.isHighlighted !== null) {
    return row.isHighlighted;
  }
  return getRowHighlight(row.rank, total);
};

const calcPreviewResult = (set) => {
  const memberCount = set.rows.length;
  const purchaseCost = Number(set.basePrice) * memberCount;
  const highlightedRows = set.rows.filter(r =>
  isRowHighlighted(r, set.rows.length)
);

  const expectedSales = highlightedRows.reduce(
    (acc, r) => acc + Number(r.priceKrw || 0),
    0
  );
  return { purchaseCost, expectedSales };
};

const getRowHighlight = (rank, total) => {
  const upper = Math.round(total * 0.25); 
  const lower = upper; 

  const middleStart = upper + 1;
  const middleEnd = total - lower;
  const middleCount = middleEnd - middleStart + 1;
  const middleHalf = Math.floor(middleCount / 2);

  if (rank <= upper) return true; 
  if (rank >= total - lower + 1) {
    return rank < total - lower + 1 + lower / 2;
  }
  if (rank >= middleStart && rank < middleStart + middleHalf) return true;

  return false;
};

const getMultiplier = (rank, total) => {
  const upper = Math.round(total * 0.25);
  const lower = upper;

  if (rank === 1) return 2.4;
  if (rank <= upper) return 2.2;
  if (rank > total - lower) return 1.3;
  return 1.6;
};
const formatDateJP = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const API_BASE = process.env.REACT_APP_API_BASE;


function AlbumUpload() {
  const [sets, setSets] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [eventName, setEventName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [popupSeller, setPopupSeller] = useState("");
  const [tempProductName, setTempProductName] = useState("");
  const [tempMemberCount, setTempMemberCount] = useState("");
  const [tempBasePrice, setTempBasePrice] = useState("");
  const [tempSingleName, setTempSingleName] = useState("");
  const [tempSinglePrice, setTempSinglePrice] = useState("");
  const [groupedData, setGroupedData] = useState([]);
  const [mainProductName, setMainProductName] = useState("");
  const [isMemberSelectable, setIsMemberSelectable] = useState(false);
  const [isSiteSelectable, setIsSiteSelectable] = useState(false);  
  const [hasBonus, setHasBonus] = useState(false);
  const [bonusAlbumName, setBonusAlbumName] = useState("");
  const [rawKeywords, setRawKeywords] = useState("");
  const [isKeywordLoading, setIsKeywordLoading] = useState(false);
  const [generatedKeywords, setGeneratedKeywords] = useState("");
  const [keywordType, setKeywordType] = useState("アルバム");
  const [memberText, setMemberText] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [albumNameEn, setAlbumNameEn] = useState("");
const [albumNameJp, setAlbumNameJp] = useState("");



  const handleGenerateMainProductName = () => {
  const result = generateMainProductName();
  if (result) setMainProductName(result);
};
  const handleGenerateKeywordsByGPT = async () => {
  if (!rawKeywords.trim()) {
    alert("키워드를 입력해주세요.");
    return;
  }

  setIsKeywordLoading(true);

  try {
    const res = await fetch(
      "https://md-backend-blond.vercel.app/generate-album-keywords",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: rawKeywords,
        }),
      }
    );

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    setGeneratedKeywords(data.result);
  } catch (e) {
    alert("키워드 생성 실패");
  } finally {
    setIsKeywordLoading(false);
  }
};

const handleGenerateKeywordsAlbum = async () => {
  if (!keywordType) {
    alert("키워드 타입이 없습니다.");
    return;
  }

  if (!memberText) {
    alert("멤버명을 입력하세요!");
    return;
  }

  const members = memberText
    .split(",")
    .map(m => m.trim())
    .filter(Boolean);

  try {
    // EN
    const enRes = await fetch(`${API_BASE}/translate-members-en`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members }),
    });
    const { translatedMembersEn } = await enRes.json();

    // JP
    const jpRes = await fetch(`${API_BASE}/translate-members-jp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members }),
    });
    const { translatedMembersJp } = await jpRes.json();

    // 그룹명 JP
    const groupRes = await fetch(`${API_BASE}/translate-members-jp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members: [groupName] }),
    });
    const { translatedMembersJp: groupNameJpArr } = await groupRes.json();
    const groupNameJp = groupNameJpArr[0] || groupName;

    let extraKeywordEn = "";
    let extraKeywordJp = "";
    if (keywordType === "アルバム") {
      extraKeywordEn = "CD";
      extraKeywordJp = "CD";
    } else if (keywordType === "フォトカード") {
      extraKeywordEn = "POCA";
      extraKeywordJp = "ポカ";
    }

    const albumNameEn = eventName;
// ⭐ 앨범명 JP만 번역
const albumJpRes = await fetch(`${API_BASE}/translate-members-jp`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ members: [eventName] }),
});
const { translatedMembersJp: [albumNameJp] } = await albumJpRes.json();

setAlbumNameEn(albumNameEn);
setAlbumNameJp(albumNameJp);



    const result = members.map((_, idx) => ({
      en: translatedMembersEn[idx] || "",
      jp: translatedMembersJp[idx] || "",
      type: "member"
    }));

    const finalKeywords = [
  {
    en: `${groupName} ${albumNameEn} ${extraKeywordEn}`.trim(),
    jp: `${groupNameJp} ${albumNameJp} ${extraKeywordJp}`.trim(),
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


  const judgeOptionResult = (rows, purchaseCost, expectedSales) => {
  if (rows.length === 1) return "가능 !";
  return expectedSales > purchaseCost
    ? "가능 !"
    : "불가능 ! 가격 조정 다시 하세요";
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

  const generateMainProductName = () => {
  if (!groupName || !eventName || !releaseDate) {
    alert("그룹명 / 발송날짜 / 앨범명을 모두 입력해주세요");
    return "";
  }

  const dateText = formatDateJP(releaseDate);
  return `[${groupName.toUpperCase()}][${dateText}発送]` +
       `${isMemberSelectable ? "[メンバー選択]" : ""}` +
       `${isSiteSelectable ? "[サイトを選択]" : ""}` +
       `${hasBonus ? "[特典贈呈]" : ""}` +
       `${eventName}`;

};

  const handleGenerateAll = () => {
  handleGenerateMainProductName(); 
  handleGenerateDescription();     
};


  const handleGenerateDescription = () => {
    if (hasBonus && !bonusAlbumName) {
  alert("특전 대상 앨범명을 입력해주세요");
  return;
}
  if (!groupName || !eventName || !releaseDate) {
    alert("그룹명 / 발송날짜 / 앨범명을 모두 입력해주세요");
    return;
  }

  const jpDate = formatDateJP(releaseDate);
  const bonusText = hasBonus && bonusAlbumName
  ? `
  <h3 style="margin-bottom:14px;">🎁【特典情報】</h3>

  <p>
    <b>${bonusAlbumName}</b>のご購入枚数に応じて、以下の公式特典をお付けいたします。
  </p>

  <p>
    ・1枚ご購入：公式特典 1枚<br/>
    ・2枚ご購入：公式特典 2枚<br/>
    ※以降もご購入枚数に応じて、自動的に特典が追加されます。
  </p>

  <div style="height:16px;"></div>
`
  : "";


  const text = `
    <div style="text-align:center; font-size:14px; line-height:1.9;">

${bonusText}

<h3 style="margin-bottom:14px;">【発送について】</h3>

  <p>
    <b>${jpDate}</b>より、ご注文順に順次発送予定です。<br/>
    できる限り早くお届けできるよう努めてまいります。
  </p>

  <p style="margin-top:18px;">
    <span style="background-color:#0000ff; color:#ffffff; padding:4px 8px;">
      ※音盤商品につき、取引先への入荷が遅れた場合、
    </span>
    <br/>
    <span style="background-color:#0000ff; color:#ffffff; padding:4px 8px;">
      当店からの発送が<strong>1〜2週間程度遅延</strong>する可能性がございます。
    </span>
  </p>

  <p style="margin-top:18px;">
    <span style="background-color:#ff0000; color:#ffffff; padding:5px 10px; font-weight:bold;">
      本商品は予約商品のため、
    </span>
    <br/>
    <span style="background-color:#ff0000; color:#ffffff; padding:5px 10px; font-weight:bold;">
      ご注文確定後のキャンセル・返金はお受けできません。
    </span>
  </p>

  <p style="margin-top:18px;">
      あらかじめご了承のうえ、ご注文くださいますようお願いいたします。
  </p>

  <p style="margin-top:22px;">
      当店でご購入いただいたすべてのアルバムは、
    <br/>
      <strong>HANTEOチャート／GAONチャート／CIRCLEチャート</strong>に100％反映され、
    <br/>
    初動チャートにも100％反映されます。
  </p>

  <p style="margin-top:18px;">
    また、バージョン別のアルバムを複数枚ご購入いただいた場合、可能な限り<strong>同一バージョンが重複しないよう</strong>発送いたします。
  </p>

  <p>
    ラッキードローフォトカードにつきましても、複数枚ご購入の場合は、できる限り重複しないように発送いたします。
  </p>

  <p style="margin-top:20px;">
    ※「入金待ち」の状態が続いた場合、現地での商品確保ができず、ご注文がキャンセルとなる可能性がございます。
  </p>

  <p style="margin-top:18px;">
    関税は当店が負担いたしますので、ご安心ください。<br/>
    商品はすべて<strong>100％正規品（公式商品）</strong>です。
  </p>

  <p style="margin-top:20px;">
    ご不明な点がございましたら、いつでもお気軽にお問い合わせください。 たくさんのご関心をお待ちしております。^^
  </p>

</div>

`;


setDetailDescription(text);

};
  /* --------------------------------------------------------
      옵션 있는 상품 세트 생성
  --------------------------------------------------------- */
  const updateMultiplier = (setId, rowIndex, value) => {
  setSets(prev =>
    prev.map(s => {
      if (s.id !== setId) return s;

      const updatedRows = s.rows.map((r, i) => {
        if (i !== rowIndex) return r;

        // ⭐ 빈 값이면 숫자 계산 안 함
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


  const handleCopyDescription = async () => {
  if (!detailDescription) {
    alert("복사할 상세페이지 글이 없습니다.");
    return;
  }

  try {
    await navigator.clipboard.writeText(detailDescription); // ⭐ 이 줄이 빠져있었음
  } catch (err) {
    alert("복사에 실패했습니다. 브라우저를 확인해주세요.");
  }
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

      // 배수 합계
      const multiplierSum = s.rows.reduce((acc, r) => acc + Number(r.multiplier), 0);

      // 상위/중위/하위 구분 위한 기준
      const upperCount = Math.round(memberCount * 0.25);
      const lowerCount = upperCount;

      // 연한 초록색 그룹 = 상위 + 하위 그룹
      const highlightedRows = s.rows.filter(r =>
        getRowHighlight(r.rank, s.rows.length)
      );

      // 매입액
      const purchaseCost = Number(s.basePrice) * memberCount;

      // 예상매출
      const expectedSales = highlightedRows.reduce(
        (acc, r) => acc + Number(r.priceKrw),
        0
      );

      // ⭐ 새로운 가능 / 불가능 기준
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
        purchaseCost: 0,     // ⭐ 추가
        expectedSales: 0,    // ⭐ 추가
        memberLocked: false,  
      };


    setSets((prev) => [...prev, newSet]);

    // 입력창 초기화
    setTempProductName("");
    setTempMemberCount("");
    setTempBasePrice("");
    setPopupSeller("");
  };

  /* --------------------------------------------------------
      옵션 없는 상품 세트 생성
  --------------------------------------------------------- */

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

  /* --------------------------------------------------------
      옵션 없는 박스 내부 행 추가
  --------------------------------------------------------- */

  const addRowToSingleSet = (setId) => {
    setSets((prev) =>
      prev.map((s) =>
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

  /* --------------------------------------------------------
      옵션 없는 행 업데이트 시 엔화 자동 계산
  --------------------------------------------------------- */

  const updateSingleRow = (setId, idx, field, value) => {
    setSets((prev) =>
      prev.map((s) => {
        if (s.id !== setId) return s;

        const updated = [...s.rows];
        updated[idx] = { ...updated[idx], [field]: value };

        return { ...s, rows: updated };
      })
    );
  };

  /* --------------------------------------------------------
      모든 세트 상품을 하나의 배열로 병합
  --------------------------------------------------------- */

  const collectAllItems = () => {
    let all = [];

    sets.forEach((set) => {
      if (set.type === "withOption") {
        set.rows.forEach((r) => {
          all.push({
            name: `${set.productName} - ${r.memberName || "?"}`,
            price: Number(r.priceYen),
            hasOption: true,
          });
        });
      } else {
        set.rows.forEach((r) => {
          all.push({
            name: r.productName,
            price: Number(r.priceYen),
            hasOption: false,
          });
        });
      }
    });

    return all;
  };

    /* --------------------------------------------------------
      가격 그룹 묶기 로직 (App.js 그대로)
  --------------------------------------------------------- */

  const groupByCustomPrice = (items) => {
  const sorted = [...items].sort((a, b) => Number(a.price) - Number(b.price));
  let remaining = [...sorted];
  const groups = [];

  // ⭐ 옵션 상품이 어느 그룹에 들어갔는지 기록
  const optionGroupMap = {};

  while (remaining.length > 0) {
    const prices = remaining.map((i) => Number(i.price));
    const min = Math.min(...prices);

    const rawStandard = min * 2;
    const lowerBound = rawStandard * 0.5;
    const upperBound = rawStandard * 1.5;

    const group = remaining.filter((item) => {
      const p = Number(item.price);
      return p >= lowerBound && p <= upperBound;
    });

    /* ===============================
       ⭐ 여기서 즉시 검사
    =============================== */
    for (const item of group) {
      if (!item.hasOption) continue;

      const baseName = item.name.split(" - ")[0];

      if (!(baseName in optionGroupMap)) {
        // 처음 등장 → 현재 그룹 index 기록
        optionGroupMap[baseName] = groups.length;
      } else if (optionGroupMap[baseName] !== groups.length) {
        // ❌ 다른 그룹으로 들어가려는 순간
        const memberName = item.name.split(" - ")[1] || item.name;
        alert(`${memberName} 가격을 조정해야해요. 같은 앨범이 하나의 그룹으로 묶이지 않아요`);
        return null; // ⭐ 즉시 중단
      }
    }
    /* =============================== */

    let standardPrice;
    if (group.length === 1) {
      standardPrice = Number(group[0].price);
    } else {
      const maxPrice = Math.max(...group.map((g) => Number(g.price)));
      let raw = Math.round(maxPrice * 0.68);
      standardPrice = Math.ceil(raw / 100) * 100 - 10;
    }

    const hasStandard = group.some(
      (item) => Number(item.price) === standardPrice
    );

    if (!hasStandard) {
      group.push({
        name: "–",
        price: standardPrice.toString(),
        hasOption: false,
        isDummy: true, 
      });
    }

    const updatedGroup = group.map((item) => {
      const diff = Number(item.price) - standardPrice;
      const diffText = diff >= 0 ? `+${diff}` : `${diff}`;

      return {
        ...item,
        displayName: `${item.name} ${diffText}`,
        diffFromStandard: diff,
      };
    });

    const sortedGroup = [...updatedGroup].sort(
      (a, b) => a.name.localeCompare(b.name, "ko")
    );

    groups.push({ standardPrice, items: sortedGroup });

    const ids = new Set(group.map((g) => g.name + g.price));
    remaining = remaining.filter((item) => !ids.has(item.name + item.price));
  }

  return groups;
};


  /* --------------------------------------------------------
      그룹 만들기 버튼
  --------------------------------------------------------- */
  const handleGroupPrices = () => {

    if (!canGroupPrices()) {
    alert("옵션 상품의 멤버명 입력을 먼저 완료해주세요.");
    return;
  }
  const all = collectAllItems();
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
        return; // ⭐ 여기서 함수 자체 종료
      }
    }
  }

  setGroupedData(groups);
};



  /* --------------------------------------------------------
      그룹별 엑셀 다운로드
  --------------------------------------------------------- */

 const exportGroupExcel = (group, idx) => {
  const rows = [];

  if (!group || !Array.isArray(group.items)) {
    alert("엑셀로 추출할 데이터가 없습니다.");
    return;
  }

  // 옵션2 판매처 (쉼표 구분)
  const findSellersByProductName = (productName) => {
  const set = sets.find(
    s => s.type === "withOption" && s.productName === productName
  );
  return set?.seller
    ? set.seller.split(",").map(s => s.trim()).filter(Boolean)
    : [];
};


  group.items.forEach(item => {
    const diff = item.diffFromStandard ?? 0;

    // =========================
    // 옵션 ❌ (옵션 없는 상품)
    // =========================
    if (!item.hasOption) {
      rows.push({
        option_title_1: "OPTION",
        option_name_1: item.name,

        option_title_2: "TYPE",
        option_name_2: "-",

        option_title_3: "MEMBER",
        option_name_3: "-",

        option_price_yen: diff,
        option_quantity: item.isDummy ? 0 : 5,


        seller_unique_option_id: "",
        external_product_hs_id: "",
        q_inventory_id: ""
      });
      return;
    }

    // =========================
    // 옵션 ⭕ (옵션 있는 상품)
    // =========================
    // item.name 예: "JEWEL VER - RIKU"
    const [productName, memberName] = item.name.split(" - ");
const sellers = findSellersByProductName(productName);

sellers.forEach(seller => {
  rows.push({
    option_title_1: "OPTION",
    option_name_1: productName,

    option_title_2: "TYPE",
    option_name_2: seller,

    option_title_3: "MEMBER",
    option_name_3: memberName,

    option_price_yen: diff,
    option_quantity: item.isDummy ? 0 : 5,


    seller_unique_option_id: "",
    external_product_hs_id: "",
    q_inventory_id: ""
  });
});

  });

  if (rows.length === 0) {
    alert("엑셀로 추출할 데이터가 없습니다.");
    return;
  }
  // ⭐ D열(option_name_2) 기준 내림차순 정렬
rows.sort((a, b) =>
  String(b.option_name_2 || "").localeCompare(
    String(a.option_name_2 || ""),
    "ja"
  )
);

  // Qoo10 엑셀 헤더
  const headers = [
    "option_title_1",
    "option_name_1",
    "option_title_2",
    "option_name_2",
    "option_title_3",
    "option_name_3",
    "option_price_yen",
    "option_quantity",
    "seller_unique_option_id",
    "external_product_hs_id",
    "q_inventory_id"
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers]);
XLSX.utils.sheet_add_json(ws, rows, {
  header: headers,
  skipHeader: true,
  origin: "A5"   // ⭐ 5행부터 데이터 시작
});


  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Group${idx + 1}`);

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array"
  });

  saveAs(
    new Blob([buffer], { type: "application/octet-stream" }),
    `album_group_${idx + 1}_qoo10_optiondownitem.xlsx`
  );
};




  /* --------------------------------------------------------
      렌더링 시작
  --------------------------------------------------------- */

  return (
    
    <div className="album-upload-wrapper">
      <div className="section-box">

  <div className="basic-info-row">
  <div className="basic-info-field-inline">
    <label>그룹명</label>
    <input
      type="text"
      value={groupName}
      onChange={(e) => setGroupName(e.target.value.toUpperCase())}
    />
  </div>

  <div className="basic-info-field-inline">
    <label>앨범명</label>
    <input
      type="text"
      value={eventName}
      onChange={(e) => setEventName(e.target.value)}
    />
  </div>

  <div className="basic-info-field-inline">
    <label>썸네일 기준 발송날짜</label>
    <input
      type="date"
      value={releaseDate}
      onChange={(e) => setReleaseDate(e.target.value)}
    />
  </div>

  <div className="checkbox-inline">
  <label>
    <input
      type="checkbox"
      checked={isMemberSelectable}
      onChange={(e) => setIsMemberSelectable(e.target.checked)}
    />
    멤버 선택 가능
  </label>
</div>

<div className="checkbox-inline">
  <label>
    <input
      type="checkbox"
      checked={isSiteSelectable}
      onChange={(e) => setIsSiteSelectable(e.target.checked)}
    />
    사이트 선택
  </label>
</div>

<div className="checkbox-inline" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <label>
    <input
      type="checkbox"
      checked={hasBonus}
      onChange={(e) => setHasBonus(e.target.checked)}
    />
    특전 증정
  </label>

  {hasBonus && (
    <input
      type="text"
      placeholder="특전 대상 앨범명 입력"
      value={bonusAlbumName}
      onChange={(e) => setBonusAlbumName(e.target.value)}
      style={{ width: "260px" }}
    />
  )}
</div>




  <button className="btn-primary" onClick={handleGenerateAll}>
  다음
</button>


</div>


  {mainProductName && (
    <>
    <div className="section-box">
    <h3>메인상품명</h3>
      <input
        value={mainProductName}
        readOnly
        style={{ width: "100%", marginTop: "8px" }}
      />

      <button
        className="btn-secondary"
        onClick={() => navigator.clipboard.writeText(mainProductName)}
      >
        복사하기
      </button>
      </div>
    </>
  )}


</div>
      {detailDescription && (
  <div className="section-box">
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px"
      }}
    >
      <h3 style={{ margin: 0 }}>상세페이지 글</h3>
    </div>

    <textarea
      value={detailDescription}
      readOnly
      style={{ width: "100%", height: "180px" }}
    />
    <button
        className="btn-secondary small"
        onClick={handleCopyDescription}
      >
        복사하기
      </button>
  </div>
)}


      <div className="option-add-wrapper">

        {/* --------------------------- 옵션 없는 상품 입력 --------------------------- */}
      <div className="section-box">
        <h3>멤버(종류)선택 없는 상품</h3>

        <button className="btn-primary" onClick={createSingleSet}>
          생성
        </button>
      </div>
      {/* --------------------------- 옵션 있는 상품 입력 --------------------------- */}
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


      {/* --------------------------- 생성된 세트들 --------------------------- */}
      <div className="set-container">
        {sets.map((set) => (
          <div key={set.id} className="set-box">

            {/* 옵션 있는 상품 세트 */}
            {set.type === "withOption" && (
              <>
                <div className="set-header">
  <h3 className="set-title">옵션 O - {set.productName}</h3>

  <button
    className="set-remove-btn"
    onClick={() => removeSet(set.id)}
    aria-label="옵션 삭제"
  >
    ✕
  </button>
</div>

                    <div className="set-edit-area">
  {!set.editing ? (
    <button
      className="edit-btn edit-btn-edit"
      onClick={() => toggleEditMode(set.id)}
    >
      수정하기
    </button>
  ) : (
    <button
      className="edit-btn edit-btn-save"
      onClick={() => toggleEditMode(set.id)}
    >
      수정완료
    </button>
  )}
</div>

                    {/* ⭐ 여기! */}
{set.editing && (
  <div
    style={{
      fontSize: "14px",
      color: "#ff5fa2",
      margin: "6px 0"
    }}
  >
    👉 초록색으로 만들 행을 클릭하세요
  </div>
)}


                  <div className="seller-line">
                    판매처 : <strong>{set.seller}</strong>
                  </div>
                <table className="set-table">
                  <thead>
                    <tr>
                      <th>등수</th>
                      <th>배수</th>
                      <th>멤버명</th>
                      <th>가격(원)</th>
                      <th>가격(¥)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {set.rows.map((r, idx) => (
                      <tr
                        key={idx}
                        className={isRowHighlighted(r, set.rows.length) ? "row-highlight" : ""}
                        style={{
                          cursor: set.editing ? "pointer" : "default"
                        }}
                        onClick={() => {
                          if (!set.editing) return;

                          setSets(prev =>
                            prev.map(s => {
                              if (s.id !== set.id) return s;

                              return {
                                ...s,
                                rows: s.rows.map((row, i) =>
                                  i === idx
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
                        }}
                      >
                        <td>{r.rank}</td>
                        <td>
                          {set.editing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={r.multiplier}
                              onWheel={(e) => e.target.blur()}
                              onClick={(e) => e.stopPropagation()}  
                              onChange={(e) => {
                                const v = e.target.value;

                                // ⭐ 완전히 지웠을 때
                                if (v === "") {
                                  updateMultiplier(set.id, idx, "");
                                  return;
                                }

                                const num = parseFloat(v);
                                if (!isNaN(num)) {
                                  updateMultiplier(set.id, idx, num);
                                }
                              }}
                            />

                              ) : (
                                r.multiplier
                              )}
                            </td>
                        <td>
                          {set.editing ? (
                            // 수정 모드 → 무조건 인풋 활성화
                            <input
                              className="member-input"
                              value={r.memberName}
                              onChange={(e) => handleMemberNameChange(set.id, idx, e.target.value.toUpperCase())}
                              onClick={(e) => e.stopPropagation()} 
                            />
                          ) : set.memberLocked ? (
                            // 수정모드 X + 입력 완료됨 → 텍스트 표시
                            <div className="member-display">{r.memberName}</div>
                          ) : (
                            // 수정모드 X + 입력 완료 안됨 → 인풋 표시
                            <input
                              className="member-input"
                              value={r.memberName}
                              onChange={(e) => handleMemberNameChange(set.id, idx, e.target.value.toUpperCase())}
                              onClick={(e) => e.stopPropagation()} 
                            />
                          )}
                        </td>
                        <td>{r.priceKrw}</td>
                        <td>{r.priceYen}</td>
                      </tr>
                    ))}

                  </tbody>
                  
                </table>
                {(() => {
                  const { purchaseCost, expectedSales } = calcPreviewResult(set);
                                  const previewResult =
                    set.rows.length === 1
                      ? "가능 !"
                      : expectedSales > purchaseCost
                      ? "가능 !"
                      : "불가능 !";
                  return (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px",
                        background: "#fcffe3ff",
                        borderRadius: "6px",
                        fontSize: "14px"
                      }}
                    >
                      <div>🧾 매입액 : {purchaseCost.toLocaleString()}원</div>
                      <div>💰 예상 매출 : {expectedSales.toLocaleString()}원</div>
                      <div
                        style={{
                          marginTop: "6px",
                          fontWeight: "700",
                          color: previewResult === "가능 !" ? "green" : "red"
                        }}
                      >
                        {previewResult}
                      </div>
                    </div>
                  );
                })()}
                        <button
                        className="btn-primary"
                        onClick={() => {
                          // 1) 멤버명 입력 잠금
                          setSets(prev =>
                            prev.map(s =>
                              s.id === set.id ? { ...s, memberLocked: true } : s
                            )
                          );

                          // 2) 가능/불가능 계산 실행
                          handleConfirmMembers(set.id);
                        }}
                      >
                        멤버명 입력 완료
                      </button>

              </>
            )}


            {/* 옵션 없는 상품 세트 */}
            {set.type === "single" && (
              <>
                <h3>옵션 X</h3>

                <table className="set-table">
                  <thead>
                    <tr>
                      <th>상품명(OPTION)</th>
                      <th>가격(₩)</th>
                      <th>가격(¥)</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
  {set.rows.map((row, idx) => (
    <tr key={idx}>
      <td>
        <input
          value={row.productName}
          onChange={(e) =>
            updateSingleRow(set.id, idx, "productName", e.target.value.toUpperCase())
          }
        />
      </td>

      <td>
        <input
          type="number"
          value={row.priceKrw}
          onChange={(e) =>
            updateSingleRow(set.id, idx, "priceKrw", e.target.value)
          }
        />
        <button
          className="btn-yen"
          onClick={() =>
            updateSingleRow(set.id, idx, "priceYen", convertSingleToYen(row.priceKrw))
          }
        >
          엔화변환
        </button>
      </td>

      <td>{row.priceYen}</td>

      <td>
        <button
          className="btn-delete"
          onClick={() =>
            setSets((prev) =>
              prev.map((s) =>
                s.id === set.id
                  ? {
                      ...s,
                      rows: s.rows.filter((_, rI) => rI !== idx),
                    }
                  : s
              )
            )
          }
        >
          삭제
        </button>
      </td>
    </tr>
  ))}
  
</tbody>

                </table>
                

                <button
                  className="btn-secondary"
                  onClick={() => addRowToSingleSet(set.id)}
                >
                  행 추가 +
                </button>
              </>
            )}
          </div>
        ))}
      </div>

              {/* --------------------------- 가격 그룹 묶기 --------------------------- */}
        <div style={{ marginTop: "16px", textAlign: "left" }}>
          <button
            className="btn-primary"
            onClick={handleGroupPrices}
            disabled={!canGroupPrices()}
            style={{
              opacity: canGroupPrices() ? 1 : 0.5,
              cursor: canGroupPrices() ? "pointer" : "not-allowed"
            }}
          >
            가격대별 그룹 만들기
          </button>

          {/* 🔽 disabled 상태 안내 문구 */}
          {!canGroupPrices() && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "13px",
                color: "#d9534f",
                fontWeight: "500"
              }}
            >
              ⚠️ 옵션O 상품의 <b>멤버명 입력 완료</b> 버튼을 모두 눌러주세요
            </div>
          )}
        </div>


      {/* --------------------------- 그룹 출력 --------------------------- */}
      {groupedData.length > 0 && (
        <div className="group-result-area">
          <h2>📦 가격대별 그룹 결과</h2>

          {groupedData.map((group, idx) => {
            const reference = Math.ceil((group.standardPrice * 1.3) / 100) * 100 - 10;

            return (
              <div key={idx} className="group-box">
                <div className="group-header">
                  <strong>그룹 {idx + 1}</strong>
                  <span>기준가격: ¥{group.standardPrice}</span>
                  <span>참고가격: ¥{reference}</span>

                  <button
                    className="xlsx-button"
                    onClick={() => exportGroupExcel(group, idx)}
                  >
                    그룹 {idx + 1} 엑셀 다운로드
                  </button>
                </div>

                <ul className="group-item-list">
                  {group.items.map((item, i) => (
                    <li key={i} className={item.hasOption ? "option-item" : ""}>
                      {item.displayName}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-box">
        <h3>🔍 검색 키워드 (앨범)</h3>

        <input
  type="text"
  placeholder="멤버명 (콤마 구분)"
  value={memberText}
  onChange={(e) => setMemberText(e.target.value)}
/>

<button onClick={handleGenerateKeywordsAlbum}>
  검색 키워드 생성
</button>

{keywords.length > 0 && (
  <div style={{ marginBottom: "16px" }}>

    {(() => {
      const main = keywords.find(k => k.type === "main");
      if (!main) return null;
      const groupEn = groupName; 
      const albumEn = albumNameEn; 
      const albumJp = albumNameJp; 
      const extraEn = "CD";
      const groupJp = main.jp.split(" ")[0];

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>

  {/* 그룹명 */}
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <strong style={{ width: "70px" }}>그룹명</strong>
    <span style={{ flex: 1 }}>{groupEn}</span>

    <button
    className="btn-secondary small"
    onClick={() => navigator.clipboard.writeText(groupJp)}
  >
    JP
  </button>
  </div>

  {/* 앨범명 */}
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <strong style={{ width: "70px" }}>앨범명</strong>
    <span style={{ flex: 1 }}>{albumEn}</span>
    <button
      className="btn-secondary small"
      onClick={() => navigator.clipboard.writeText(albumJp)}
    >
      JP
    </button>
  </div>

  {/* CD */}
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <strong style={{ width: "70px" }}>앨범</strong>
    <span style={{ flex: 1 }}>CD</span>

    <button
      className="btn-secondary small"
      onClick={() => navigator.clipboard.writeText("CD")}
    >
      EN
    </button>
  </div>

</div>
      );
    })()}
  </div>
)}

{keywords.length > 0 && (
  <div style={{ marginTop: "12px" }}>
    {keywords
  .filter(k => k.type === "member")
  .map((k, idx) => (
      <div
        key={idx}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 0",
          borderBottom: "1px solid #eee",
          fontSize: "14px"
        }}
      >
        {/* 키워드 텍스트 */}
        <div style={{ flex: 1 }}>
          <div>
            <strong>[EN]</strong> {k.en}
          </div>
          <div style={{ color: "#666", marginTop: "2px" }}>
            <strong>[JP]</strong> {k.jp}
          </div>
        </div>

        {/* 복사 버튼 */}
        <button
          className="btn-secondary small"
          onClick={() => navigator.clipboard.writeText(k.en)}
        >
          EN
        </button>

        <button
          className="btn-secondary small"
          onClick={() => navigator.clipboard.writeText(k.jp)}
        >
          JP
        </button>
      </div>
    ))}
  </div>
)}


      </div>
      


    </div>

    
  );
}

export default AlbumUpload;
