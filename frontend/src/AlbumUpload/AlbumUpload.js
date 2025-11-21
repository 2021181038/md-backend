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
  const handleGenerateDescription = () => {
  if (!groupName || !eventName || !releaseDate) {
    alert("그룹명 / 발송날짜 / 앨범명을 모두 입력해주세요");
    return;
  }

  const jpDate = formatDateJP(releaseDate);

  const text = `
【発送について】

${jpDate}より、ご注文順に順次出荷されます。できるだけ早くお届けできるよう努めます。

*「入金待ち」*の状態が続きますと、現地での商品確保ができず、ご注文がキャンセルになる場合がございます。

関税はこちらで負担いたしますのでご安心ください。
商品はすべて100%正規品です。

📦【商品情報】
『${eventName}』${groupName} OFFICIAL ALBUM
  `;

  setDetailDescription(text.trim());
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
        r.rank <= upperCount || r.rank > memberCount - lowerCount
      );

      // 예상매출 = 초록색 행 priceKrw 합
      const expectedSales = highlightedRows.reduce(
        (acc, r) => acc + Number(r.priceKrw),
        0
      );

      // 매입액 = basePrice × 멤버수
      const purchaseCost = Number(s.basePrice) * memberCount;

      // 가능/불가능 판정
      const result = multiplierSum >= memberCount ? "가능 !" : "불가능 !";

      return {
        ...s,
        optionCheckResult: result,
        purchaseCost,
        expectedSales,
      };
    })
  );
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

      const updatedGroup = group.map((item) => ({
        ...item,
        diffFromStandard: Number(item.price) - standardPrice,
      }));

      groups.push({ standardPrice, items: updatedGroup });

      const ids = new Set(group.map((g) => g.name + g.price));
      remaining = remaining.filter((item) => !ids.has(item.name + item.price));
    }

    return groups;
  };

  /* --------------------------------------------------------
      그룹 만들기 버튼
  --------------------------------------------------------- */
  const handleGroupPrices = () => {
    const all = collectAllItems();
    if (all.length === 0) {
      alert("상품이 없습니다!");
      return;
    }
    const g = groupByCustomPrice(all);
    setGroupedData(g);
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
    <label>썸네일 기준 발송날짜</label>
    <input
      type="date"
      value={releaseDate}
      onChange={(e) => setReleaseDate(e.target.value)}
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

  <button className="pretty-button" onClick={setDetailDescription}>
    상세페이지 글 생성
  </button>

</div>

</div>
      {detailDescription && (
  <div className="section-box">
    <h3>📝 상세페이지 글</h3>
    <textarea
      value={detailDescription}
      readOnly
      style={{ width: "100%", height: "180px" }}
    />
  </div>
)}

      <div className="option-add-wrapper">
      {/* --------------------------- 옵션 있는 상품 입력 --------------------------- */}
      <div className="section-box">
        <h3>옵션 있는 상품 추가</h3>

        <input
          type="text"
          placeholder="상품명(OPTION)"
          value={tempProductName}
          onChange={(e) => setTempProductName(e.target.value)}
        />

        <input
          type="text"
          placeholder="판매처(TYPE)-쉼표 구분"
          value={popupSeller}
          onChange={(e) => setPopupSeller(e.target.value)}
        />

        <input
          type="number"
          placeholder="옵션 개수 or 멤버 수"
          value={tempMemberCount}
          onChange={(e) => setTempMemberCount(e.target.value)}
        />

        <input
          type="number"
          placeholder="원가 (원화)"
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
                          onClick={() => toggleEditMode(set.id)}
                        >
                          수정완료
                        </button>
                      )}

                    </div>

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
      <div className="section-box">
        <h3>가격 그룹 묶기</h3>

        <button className="btn-primary" onClick={handleGroupPrices}>
          가격대별 그룹 만들기
        </button>
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
                    <li
                      key={i}
                      className={item.hasOption ? "option-item" : ""}
                    >
                      {item.name}
                      <span style={{ marginLeft: "10px" }}>
                        {item.diffFromStandard >= 0
                          ? `+${item.diffFromStandard}`
                          : item.diffFromStandard}
                      </span>
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
