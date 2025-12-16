import React, { useState } from "react";
import "./AlbumUpload.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// 끝 두 자리를 90으로 맞추기
const applyEnding90 = (yen) => {
  return Math.floor(yen / 100) * 100 + 90;
};

// 원화 → 엔화 (공통 방식)
const convertToYen = (krw) => {
  if (!krw || Number(krw) <= 0) return 0;
  let yen = Math.round(Number(krw) / 9.42);
  return applyEnding90(yen);
};

const getRowHighlight = (rank, total) => {
  const upper = Math.round(total * 0.25); // 상위그룹
  const lower = upper; // 하위그룹

  const middleStart = upper + 1;
  const middleEnd = total - lower;
  const middleCount = middleEnd - middleStart + 1;

  const middleHalf = Math.floor(middleCount / 2);

  if (rank <= upper) return true; // 상위 전부

  if (rank >= total - lower + 1) {
    // 하위그룹 절반만
    return rank < total - lower + 1 + lower / 2;
  }

  // 중위그룹 절반만
  if (rank >= middleStart && rank < middleStart + middleHalf) return true;

  return false;
};

const recalcOptionResult = (set) => {
  const memberCount = set.rows.length;

  const upperCount = Math.round(memberCount * 0.25);
  const lowerCount = upperCount;

  const highlightedRows = set.rows.filter(
    r => getRowHighlight(r.rank, set.rows.length)
  );

  const expectedSales = highlightedRows.reduce(
    (acc, r) => acc + Number(r.priceKrw),
    0
  );

  const purchaseCost = Number(set.basePrice) * memberCount;

  return {
    expectedSales,
    purchaseCost,
  };
};


// 옵션 있는 상품 배수 계산 (상/중/하 그룹 규칙)
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
  const canGroupPrices = () => {
    const optionSets = sets.filter(s => s.type === "withOption");

    if (optionSets.length === 0) return true;

    return optionSets.every(s => s.memberLocked);
  };

  const handleGenerateDescription = () => {
  if (!groupName || !eventName || !releaseDate) {
    alert("그룹명 / 발송날짜 / 앨범명을 모두 입력해주세요");
    return;
  }

  const jpDate = formatDateJP(releaseDate);

  const text = `
    <div style="text-align:center; font-size:14px; line-height:1.9;">

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

        const mul = Number(value);
        const newKrw = Math.round(Number(s.basePrice) * mul);  // ⭐ 세트의 basePrice 사용
        const newYen = convertToYen(newKrw);

        return {
          ...r,
          multiplier: mul,
          priceKrw: newKrw,
          priceYen: newYen,
        };
      });

      return {
        ...s,
        rows: updatedRows,
      };
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
      const result = expectedSales > purchaseCost ? "가능 !" : "불가능 !";



      return {
        ...s,
        optionCheckResult: result,
        purchaseCost,
        expectedSales,
      };
    })
  );
};

  const getMultiplierSum = (set) => {
  return set.rows.reduce((sum, r) => sum + Number(r.multiplier), 0);
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
        alert(`${memberName} 가격을 조정해야해요.`);
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
    const rows = group.items.map((item) => ({
      option_title_1: "OPTION",
      option_name_1: item.name,
      option_price_yen: item.price,
      diff_from_standard: item.diffFromStandard,
    }));

    const headers = [
      "option_title_1",
      "option_name_1",
      "option_price_yen",
      "diff_from_standard",
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.sheet_add_json(ws, rows, {
      header: headers,
      skipHeader: true,
      origin: "A2",
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Group${idx + 1}`);

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `group_${idx + 1}.xlsx`
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

  <button className="pretty-button" onClick={handleGenerateDescription}>
  상세페이지 글 생성
</button>


</div>

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
      <h3 style={{ margin: 0 }}>📝 상세페이지 글</h3>
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
      {/* --------------------------- 옵션 있는 상품 입력 --------------------------- */}
      <div className="section-box">
        <h3>옵션 있는 상품 추가</h3>

        <input
          type="text"
          placeholder="옵션1"
          value={tempProductName}
          onChange={(e) => setTempProductName(e.target.value)}
        />

        <input
          type="text"
          placeholder="옵션2 - 쉼표 구분"
          value={popupSeller}
          onChange={(e) => setPopupSeller(e.target.value)}
        />

        <input
          type="number"
          placeholder="옵션3-멤버/종류 수 입력"
          value={tempMemberCount}
          onChange={(e) => setTempMemberCount(e.target.value)}
        />

        <input
          type="number"
          placeholder="원가(₩)"
          value={tempBasePrice}
          onChange={(e) => setTempBasePrice(e.target.value)}
        />

        <button className="btn-primary" onClick={createOptionSet}>
          생성
        </button>
      </div>

      {/* --------------------------- 옵션 없는 상품 입력 --------------------------- */}
      <div className="section-box">
        <h3>옵션 없는 상품 추가</h3>

        <button className="btn-primary" onClick={createSingleSet}>
          생성
        </button>
      </div>
      </div>


      {/* --------------------------- 생성된 세트들 --------------------------- */}
      <div className="set-container">
        {sets.map((set) => (
          <div key={set.id} className="set-box">

            {/* 옵션 있는 상품 세트 */}
            {set.type === "withOption" && (
              <>
                <h3>옵션 O - {set.productName}</h3>
                    <div className="set-edit-area">
                      <button
                        className="btn-primary small"
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
                          onClick={() => {
                            // 1️⃣ 기준값 검사 (배수 합 조건)
                            const multiplierSum = getMultiplierSum(set);
                            const requiredSum = Number((1.6 * set.rows.length).toFixed(1));

                            if (multiplierSum < requiredSum) {
                              alert(`배수의 합이 ${requiredSum} 이 되어야합니다`);
                              return;
                            }

                            // 2️⃣ 매입액 계산
                            const memberCount = set.rows.length;
                            const purchaseCost = Number(set.basePrice) * memberCount;

                            // 3️⃣ 예상매출 계산 (초록색 행 기준)
                            const upperCount = Math.round(memberCount * 0.25);
                            const lowerCount = upperCount;

                            const highlightedRows = set.rows.filter(
                              r => getRowHighlight(r.rank, set.rows.length)
                            );

                            const expectedSales = highlightedRows.reduce(
                              (acc, r) => acc + Number(r.priceKrw),
                              0
                            );

                            // 4️⃣ 가능 / 불가능 재판정 ⭐⭐⭐
                            const result = expectedSales > purchaseCost ? "가능 !" : "불가능 ! 가격 조정 다시 하세요";

                            // 5️⃣ state 반영
                            setSets(prev =>
                              prev.map(s =>
                                s.id === set.id
                                  ? {
                                      ...s,
                                      editing: false,
                                      purchaseCost,
                                      expectedSales,
                                      optionCheckResult: result,
                                    }
                                  : s
                              )
                            );
                          }}
                        >
                          수정완료
                        </button>

                      )}

                    </div>

                  <div className="seller-line">
                    OPTION 2 : <strong>{set.seller}</strong>
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
                        className={
                          getRowHighlight(r.rank, set.rows.length) ? "row-highlight" : ""
                        }
                      >

                        <td>{r.rank}</td>
                        <td>
                          {set.editing ? (
                            <input
                              type="number"
                              value={r.multiplier}
                              onChange={(e) => updateMultiplier(set.id, idx, e.target.value)}
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
      onChange={(e) => handleMemberNameChange(set.id, idx, e.target.value)}
    />
  ) : set.memberLocked ? (
    // 수정모드 X + 입력 완료됨 → 텍스트 표시
    <div className="member-display">{r.memberName}</div>
  ) : (
    // 수정모드 X + 입력 완료 안됨 → 인풋 표시
    <input
      className="member-input"
      value={r.memberName}
      onChange={(e) => handleMemberNameChange(set.id, idx, e.target.value)}
    />
  )}
</td>



                        <td>{r.priceKrw}</td>
                        <td>{r.priceYen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {set.optionCheckResult && (
  <div className="option-check-result">
    <div
      style={{
        fontWeight: "700",
        color: set.optionCheckResult === "가능 !" ? "green" : "red",
        marginBottom: "6px"
      }}
    >
      {set.optionCheckResult}
    </div>

    {/* ⭐ 가능일 때만 숫자 출력 */}
    {set.optionCheckResult === "가능 !" && (
      <div style={{ fontSize: "14px" }}>
        <div>매입액 : {Number(set.purchaseCost).toLocaleString()}원</div>
        <div>예상매출 : {Number(set.expectedSales).toLocaleString()}원</div>
        <div>** 초록색 행이 다 팔렸을 때 기준 매출이에요.</div>
      </div>
    )}
  </div>
)}


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
            updateSingleRow(set.id, idx, "productName", e.target.value)
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
            updateSingleRow(set.id, idx, "priceYen", convertToYen(row.priceKrw))
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
    </div>
  );
}

export default AlbumUpload;
