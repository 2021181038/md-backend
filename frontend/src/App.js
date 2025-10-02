import React, { useState ,useEffect} from 'react';
import './App.css';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function App() {
  const [groupName, setGroupName] = useState('');
  const [eventName, setEventName] = useState('');
  const [hasBonus, setHasBonus] = useState(false);
  const [images, setImages] = useState([]);
  const [mdList, setMdList] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [tempOptionValues, setTempOptionValues] = useState({});
  const [thumbnailShippingDate, setThumbnailShippingDate] = useState('');
  const [mainName, setMainName] = useState('');
  const [detailDescription, setDetailDescription] = useState('');
  const [keywordType, setKeywordType] = useState(''); 
  const [memberText, setMemberText] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [bonusSets, setBonusSets] = useState([
  { base: "", label: "" }   // base = 기준 숫자, label = 특전 이름
]);

  useEffect(() => {
  // 조건이 하나만 있는 경우 (label 없음 → 기본 방식)
  if (bonusSets.length === 1 && bonusSets[0].base) {
    const base = Number(bonusSets[0].base);
    setDetailDescription(prev => {
      return prev; // 여기서는 글만 수정 안 하고, UI에서 보여주는 부분 처리
    });
  }
}, [bonusSets]);

  const handleDownloadExcelByGroup = (group, groupIdx) => {
  const rows = [];
  const hasAnyOptions = group.items.some(item => item.hasOption && item.optionText);

  group.items.forEach((item) => {
    if (item.hasOption && item.optionText) {
      const members = item.optionText.split(",").map(m => m.trim()).filter(Boolean);
      members.forEach((member) => {
        rows.push({
          option_title_1: "OPTION",
          option_name_1: item.name,
          option_title_2: hasAnyOptions ? "TYPE" : "",   
          option_name_2: hasAnyOptions ? member : "",   
          option_title_3: "",
          option_name_3: "",
          option_price_yen: Number(item.price) - group.standardPrice, // ✅ 차액
          option_quantity: item.name === "–" ? 0 : 20,
          seller_unique_option_id: "",
          external_product_hs_id: "",
          q_inventory_id: ""
        });
      });
    } else {
      rows.push({
        option_title_1: "OPTION",
        option_name_1: item.name,
        option_title_2: hasAnyOptions ? "TYPE" : "",   // ✅ 없으면 비우기
        option_name_2: hasAnyOptions ? "-" : "", 
        option_title_3: "",
        option_name_3: "",
        option_price_yen: Number(item.price) - group.standardPrice,
        option_quantity: item.name === "–" ? 0 : 20,
        seller_unique_option_id: "",
        external_product_hs_id: "",
        q_inventory_id: ""
      });
    }
  });

  rows.sort((a, b) => {
    const numA = parseInt(a.option_name_1.match(/^\[(\d+)\]/)?.[1] || 9999, 10);
    const numB = parseInt(b.option_name_1.match(/^\[(\d+)\]/)?.[1] || 9999, 10);
    return numA - numB;
  });

  // ✅ 워크북 생성
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

  const worksheet = XLSX.utils.aoa_to_sheet([headers]);

  // ✅ 2) 데이터는 A5부터 넣기 (2~4행 공백)
  // header 옵션으로 컬럼 매핑을 고정하고 skipHeader로 데이터에선 헤더 미출력
  XLSX.utils.sheet_add_json(worksheet, rows, {
    header: headers,
    skipHeader: true,
    origin: "A5"      // ← 여기서 5행부터 시작
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Group${groupIdx + 1}`);

  // ✅ 파일 저장 (그룹 번호 포함)
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([excelBuffer], { type: "application/octet-stream" }),
    `group_${groupIdx + 1}_qoo10_optiondownitem.xlsx`
  );
};
  const API_BASE = process.env.REACT_APP_API_BASE;
  const ceilToNearestHundred = (num) => Math.ceil(num / 100) * 100;
  const handleOptionValueChange = (idx, newValue) => {
  setTempOptionValues({ ...tempOptionValues, [idx]: newValue });
  };
  const handleCopy = (text, label) => {
  if (!text) {
    alert(`${label}이(가) 없습니다.`);
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => {
    })
    .catch((err) => {
      console.error("복사 실패:", err);
    });
  };
  const handleGenerateMainName = () => {
  if (!groupName || !thumbnailShippingDate || !eventName) {
    alert("그룹명, 발송날짜, 콘서트명을 모두 입력해주세요.");
    return;
  }

  const dateText = formatThumbnailDate(thumbnailShippingDate); 
  const bonusText = hasBonus ? "[特典贈呈]" : "";

  const result = `[${groupName}][${dateText}発送][現地購入]${bonusText}${eventName} OFFICIAL MD`;
  setMainName(result);
  };
  const toggleOptionForItem = (itemIdx, optIdx) => {  
    const updatedList = [...mdList];
    const item = updatedList[itemIdx];
    if (!item.options) item.options = [];

    if (item.options.includes(optIdx)) {
      item.options = item.options.filter(i => i !== optIdx);
    } else {
      item.options.push(optIdx);
    }
    setMdList(updatedList);
  };
  // 가격 묶는 코드 
  const groupByCustomPrice = (items) => {
    const sorted = [...items].sort((a, b) => Number(a.price) - Number(b.price));
    let remaining = [...sorted];
    const groups = [];

    while (remaining.length > 0) {
      const prices = remaining.map(item => Number(item.price));
      const min = Math.min(...prices);
      const standardPrice =  min * 2;
      const lowerBound = standardPrice * 0.5;
      const upperBound = standardPrice * 1.5;
      const group = remaining.filter(item => {
        const p = Number(item.price);
        return p >= lowerBound && p <= upperBound;
      });

      if (group.length === 0) {
        group.push(remaining[0]);
      }

      const hasStandard = group.some(item => Number(item.price) === standardPrice);
      if (!hasStandard) {
        group.push({ 
          name: "–", 
          price: standardPrice.toString() ,
          quantity: 0
        });
      }

      groups.push({ standardPrice, items: group });

      const ids = new Set(group.map(g => g.name + g.price));
      remaining = remaining.filter(item => !ids.has(item.name + item.price));
    }

    return groups;
  };
  // 가격 묶는 코드 버튼 누르기
  const handleGroup = () => {
    const result = groupByCustomPrice(mdList); 
    setGrouped(result);
  };
  const formatThumbnailDate = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};
  //상세설명글
  const handleGenerateDescription = () => {
  if (!thumbnailShippingDate) {
    alert("발송 날짜를 입력해주세요.");
    return;
  }

  const dateText = formatThumbnailDate(thumbnailShippingDate); 

  let baseText = `
  【発送について】

  ${dateText}より、ご注文順に順次出荷されます。できるだけ早くお届けできるよう努めます。

  *「入金待ち」*の状態が続きますと、現地での商品確保ができず、ご注文がキャンセルになる場合がございます。できるだけ早い決済をお願いいたします。

  関税はこちらで負担いたしますのでご安心ください。

  商品はすべて100%正規品です。

  迅速な配送のため、現地で商品を順次確保して発送しております。そのため、ご購入いただいた商品は予約配送に切り替わることはありません。現地の状況に合わせて順次スピーディーに購入し、配送を進めておりますのでご安心ください。
  `;

  if (hasBonus && bonusSets.length > 0) {
    baseText += `

  🎁【特典情報】

  購入金額に応じて、以下のように公式特典を差し上げます。
  `;

    if (bonusSets.length === 1 && bonusSets[0].base) {
      // 특전 1개일 때
      const base = Number(bonusSets[0].base);
      baseText += `\n${base * 2000 - 100}円以上 : 公式特典1枚`;
      baseText += `\n${base * 4000 - 200}円以上 : 公式特典2枚`;
      baseText += `\n${base * 6000 - 300}円以上 : 公式特典3枚 (以降も金額に応じて自動追加となります。)`;
    } else if (bonusSets.length > 1) {
      // 특전 여러 개일 때
      bonusSets.forEach((set) => {
        if (set.base && set.label) {
          const base = Number(set.base);
          baseText += `\n${base * 2000 - 100}円ごとに ${set.label} 1枚ずつ支給 (以降も金額に応じて自動追加となります。)`;
        }
      });

      // 예시 문구 추가 (2개 이상일 때만)
      const maxBase = Math.max(...bonusSets.map(s => Number(s.base)));
      const maxSet = bonusSets.find(s => Number(s.base) === maxBase);
      baseText += `\n例: ${maxBase * 2000 - 100}円の場合 → `;
      bonusSets.forEach((set, idx) => {
        baseText += `${set.label} ${Math.floor((maxBase * 2000 - 100) / (set.base * 2000 - 100))}枚`;
        if (idx !== bonusSets.length - 1) baseText += " + ";
      });
    }

    baseText += `

  ✔️送料を除く決済金額が対象となります。
  ✔️重複なく発送いたします。
    `;
  }

  baseText += `

  ご不明な点やご希望がございましたら、いつでもお気軽にお問い合わせください ^^
  `;

  setDetailDescription(baseText.trim());
};

  const handleImageUpload = (e) => {
    setImages([...e.target.files]);
  };
  const handleSubmit = async () => {
    if (!images.length) {
      alert("이미지를 업로드해주세요.");
      return;
    }

    const formData = new FormData();
    images.forEach((file, i) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(`${API_BASE}/extract-md`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const raw = data.result;

      const lines = raw.split("\n").filter(line => line.trim() !== "");
      const parsed = lines.map((line) => {
        let match;
        match = line.match(/\[(\d+)\]\s*(.+?)\s+([\d,]+)\s*(\u20a9|WON|\uC6D0|\u5186)?\s*$/i);
        if (match) {
          const rawPrice = Number(match[3].replace(/[^\d]/g, ""));
          const methodA = ((rawPrice + 1600) / 0.58) / 9.42;
          const methodB = rawPrice * 0.2;
          const finalPrice = ceilToNearestHundred(Math.max(methodA, methodB)) - 10;

          return {
            name: `[${match[1]}] ${match[2].trim().replace(/[-\u2013:]+$/, "")}`,
            price: finalPrice.toString(),
          };
        }

        match = line.match(/^(.+?)\s*[₩\u20a9](\d[\d,]*)/);
        if (match) {
          const rawPrice = Number(match[2].replace(/[^\d]/g, ""));
          const methodA = ((rawPrice + 1600) / 0.58) / 9.42;
          const methodB = rawPrice * 0.2;
          const finalPrice = ceilToNearestHundred(Math.max(methodA, methodB));

          return {
            name: match[1].trim().replace(/[-\u2013:]+$/, ""),
            price: finalPrice.toString(),
            options: []  
          };
        }

        return { name: line.trim(), price: "", options: [] };  
      });
      const hasAnyNumber = parsed.some(item => /^\[\d+\]/.test(item.name));
    if (!hasAnyNumber) {
      parsed = parsed.map((item, idx) => ({
        ...item,
        name: `[${idx + 1}] ${item.name}`
      }));
    }
      setMdList(parsed);
    } catch (error) {
      console.error("에러 발생:", error);
      alert("서버 연결에 실패했어요.");
    }
  };
  const handleOnetoThree = async () => {
  // 1. 상품명 만들기
  handleGenerateMainName();
  // 2. 상세페이지 글 만들기
  handleGenerateDescription();
  // 3. GPT 상품명/가격 추출하기
  await handleSubmit();
};
  const handleGenerateKeywords = async () => { 
  if (!keywordType) {
    alert("응원봉/앨범/MD 중 하나를 선택하세요!");
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
    // 영어 변환 요청
    const enRes = await fetch(`${API_BASE}/translate-members-en`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members }),
    });
    const { translatedMembersEn } = await enRes.json();

    // 일본어 변환 요청
    const jpRes = await fetch(`${API_BASE}/translate-members-jp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members }),
    });
    const { translatedMembersJp } = await jpRes.json();

    const groupNameEn = translatedMembersEn[0] || groupName;
    const groupNameJp = translatedMembersJp[0] || groupName;

    const result = members.map((_, idx) => ({
      en: translatedMembersEn[idx] || "",
      jp: translatedMembersJp[idx] || "",
      type: "member"
    }));

  // 그룹명 + 키워드타입 추가
  const finalKeywords = [
    { en: `${groupNameEn} ${keywordType}`, jp: `${groupNameJp} ${keywordType}`, type: "main" },
  ...result
  ];

  setKeywords(finalKeywords);

  } catch (error) {
    console.error("키워드 추출 실패:", error);
    alert("GPT 요청 실패");
  }
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

  return (
    <div style={{ padding: '20px' }}>
    {/* 기본정보입력 */}
      <h2>상품 등록</h2>
      <div>
        <label>📌 상세 이미지 업로드: </label>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
      </div>

      {/* 붙여넣기 지원 영역 */}
      <div
        onPaste={handlePaste}
        style={{
          border: "2px dashed gray",
          padding: "20px",
          marginTop: "10px",
          textAlign: "center"
        }}
      >
        네모박스 한 번 클릭 후 이미지를 여기에 복사붙여넣기
      </div>

      {/* 업로드된 이미지 미리보기 */}
      <div style={{ marginTop: "10px" }}>
        {images.map((img, idx) => (
          <p key={idx}>{img.name || `clipboard-image-${idx}`}</p>
        ))}
      </div>

      {/* 그룹명   */}
      <div>
        <label>📌 그룹명: </label>
        <input type="text" placeholder = "영어로 입력" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
      </div>

      {/* 썸네일기준발송날짜   */}
      <div>
        <label>📌 썸네일 기준 발송날짜: </label>
        <input
          type="date"
          value={thumbnailShippingDate}
          onChange={(e) => setThumbnailShippingDate(e.target.value)}
        />
      </div>

      {/* 콘서트/팝업명   */}
      <div>
        <label>📌 콘서트/팝업명: </label>
        <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
      </div>

      {/* 특전유무   */}
      <div>
        <label>📌 특전 유무: </label>
        <input type="checkbox" checked={hasBonus} onChange={(e) => setHasBonus(e.target.checked)} />
      </div>

      {/* 상세이미지 특전 조건 입력 UI */}
      {hasBonus && (
  <div style={{ marginTop: '0px', marginBottom: '10px' }}>
    <h3>🎁 특전조건 입력</h3>

    {bonusSets.map((set, idx) => (
      <div key={idx} style={{ marginBottom: "10px" }}>
        <label>기준 숫자: </label>
        <input
          type="number"
          value={set.base}
          onChange={(e) => {
            const newSets = [...bonusSets];
            newSets[idx].base = e.target.value;
            setBonusSets(newSets);
          }}
          placeholder="예: 5"
          style={{ width: "100px", marginLeft: "8px" }}
        />

        {/* ✅ 특전 이름 입력은 2개 이상일 때만 보여주기 */}
        {bonusSets.length > 1 && (
          <>
            <label style={{ marginLeft: "10px" }}>특전 이름: </label>
            <input
              type="text"
              value={set.label}
              onChange={(e) => {
                const newSets = [...bonusSets];
                newSets[idx].label = e.target.value;
                setBonusSets(newSets);
              }}
              placeholder="예: FRAGILE ver."
              style={{ width: "200px", marginLeft: "8px" }}
            />
          </>
        )}

        {/* ✅ 예시 문구는 마지막 줄에서만 보여주기 */}
        {bonusSets.length > 1 && idx === bonusSets.length - 1 && (
          <span style={{ marginLeft: "15px", color: "blue" }}>
            {(() => {
              const validSets = bonusSets.filter(s => s.base && s.label);
              if (validSets.length > 1) {
                const maxBase = Math.max(...validSets.map(s => Number(s.base)));
                const maxPrice = maxBase * - 100;
                return `例: ${maxPrice}円の場合 → ` + 
                  validSets.map(s => {
                    const count = Math.floor(maxPrice / (s.base * 2000 - 100));
                    return `${s.label} ${count}枚`;
                  }).join(" + ");
              }
              return null;
            })()}
          </span>
        )}
      </div>
    ))}

    <button
      type="button"
      onClick={() => setBonusSets([...bonusSets, { base: "", label: "" }])}
    >
      특전 추가 +
    </button>
    {bonusSets.length > 1 && (
      <button
        type="button"
        onClick={() => setBonusSets(bonusSets.slice(0, -1))}
        style={{ marginLeft: "10px", color: "red" }}
      >
        특전 삭제 -
      </button>
    )}
    {bonusSets.length === 1 && bonusSets[0].base && (
      <div>
        <p>{bonusSets[0].base * 2000 - 100}円以上 : 公式特典1枚</p>
        <p>{bonusSets[0].base * 4000 - 200}円以上 : 公式特典2枚</p>
        <p>{bonusSets[0].base * 6000 - 300}円以上 : 公式特典3枚 (以降も…)</p>
      </div>
    )}

  </div>
)}
      <hr />
      {/* 메인상품명 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '10px' }}>
        <button 
            className="pretty-button" 
            style={{ marginTop: '20px' }}
            onClick={handleOnetoThree}
            >
            위에 모두 입력 후 눌러주세요
        </button>

      {/* 메인상품명 */}
      {mainName && (
        <div style={{ marginTop: '0px' }}>
          <h3>📝 메인상품명 </h3>
          <textarea
            value={mainName}
            readOnly
            style={{ width: '100%', height: '60px', fontSize: '16px' }}
          />
          <button 
            className="COPY-button" 
            style={{ marginTop: '8px' }}
            onClick={() => handleCopy(mainName, "메인 상품명")}
          >
            복사하기
          </button>
        </div>
      )}

      {/* 생성된 상세 설명 출력 */}
      {detailDescription && (
        <div style={{ marginTop: '0px', marginBottom:'5px' }}>
          <h3>📝 상세페이지 글</h3>
          <textarea
            value={detailDescription}
            readOnly
            style={{ width: '100%', height: '200px', fontSize: '14px' }}
          />
          <button 
            className="COPY-button" 
            style={{ marginTop: '8px' }}
            onClick={() => handleCopy(detailDescription, "상세페이지 글")}
          >
            복사하기
          </button>
        </div>
      )}
    </div>
      {/* 추출 결과 */}
      {mdList.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>📋 상품명 및 가격</h3>
          <h3>상품 추가 시 가격은 ₩원화₩를 기준으로 입력하기</h3>
          <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>상품명</th>
                <th>가격 (엔화)</th>
                <th style={{ color: 'red' }}>옵션 여부</th>
              </tr>
            </thead>
            <tbody>
              {mdList.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const newList = [...mdList];
                        newList[idx].name = e.target.value;
                        setMdList(newList);
                      }}
                      style={{ width: '400px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => {
                        const newList = [...mdList];
                        newList[idx].price = e.target.value; // 입력값 그대로 반영
                        setMdList(newList);
                      }}
                      onBlur={(e) => {
                        const newList = [...mdList];
                        const rawPrice = Number(e.target.value);
                        if (!isNaN(rawPrice) && rawPrice > 0) {
                          const methodA = ((rawPrice + 1600) / 0.58) / 9.42;
                          const methodB = rawPrice * 0.2;
                          const finalPrice = ceilToNearestHundred(Math.max(methodA, methodB)) - 10;
                          newList[idx].price = finalPrice.toString();
                          setMdList(newList);
                        }
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.hasOption || false}
                      onChange={(e) => {
                        const newList = [...mdList];
                        newList[idx].hasOption = e.target.checked;
                        setMdList(newList);
                        }}
                    />
                    {item.hasOption && (
                    <input
                      type="text"
                      placeholder="쉼표로 구분 (예: 한나, 유나, 현서)"
                      value={item.optionText || ""}
                      onChange={(e) => {
                        const newList = [...mdList];
                        newList[idx].optionText = e.target.value;
                        setMdList(newList);
                      }}
                      style={{ 
                        fontSize: "14px",
                        border: "1px solid #ccc",
                        padding: "3px",
                        // ✅ 글자 수에 따라 width 자동 조절
                        width: `${(item.optionText?.length || 1) * 10}px`,
                        minWidth: "150px",  // 너무 작아지지 않게 최소 너비
                        maxWidth: "100%",   // 화면 넘치지 않게 최대 제한
                       }}
                    />
                  )}
                  </td>
                  <td>
                    <button
                      style={{ color: "red" }}
                      onClick={() => {
                        const newList = [...mdList];
                        newList.splice(idx, 1);
                        setMdList(newList);
                      }}
                    >
                      상품 삭제 –
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
          </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" , marginBottom:"15px"}}>
          <button
            className="plus-button"
            onClick={() => {
              setMdList([...mdList, { name: "", price: "", hasOption: false, optionText: "" }]);
            }}
          >
            상품 추가 +
          </button>
          
          <button 
            className="pretty-button" 
            onClick={handleGroup}
          >
            가격별 그룹 만들기
          </button>
        </div>
      {/* 그룹 가격 묶기  */}
      {grouped.map((group, idx) => {     
        const sortedItems = [...group.items].sort((a, b) => {
          if (a.name === "–") return 1;   // "-" 는 뒤로
          if (b.name === "–") return -1;
          const numA = parseInt(a.name.match(/^\[(\d+)\]/)?.[1] || 0, 10);
          const numB = parseInt(b.name.match(/^\[(\d+)\]/)?.[1] || 0, 10);
          return numA - numB;
        });

        return (
          
          <div key={idx} style={{ marginBottom: '15px' }}>
            <strong>그룹 {idx + 1} (기준가격: ¥{group.standardPrice} 참고가격 :¥{group.standardPrice*1.3} )</strong>
            
          {/* ✅ 그룹별 엑셀 다운로드 버튼 */}
      <button
        className="xlsx-button"
        style={{ marginLeft: '10px' }}
        onClick={() => handleDownloadExcelByGroup(group, idx)}
      >
        그룹 {idx + 1} 엑셀 다운로드
      </button>

            <ul>
              {sortedItems.map((item, i) => {
                const diff = Number(item.price) - group.standardPrice;
                const diffText = diff === 0 ? '0' : (diff > 0 ? `+${diff}` : `${diff}`);
                return (
                <li 
                  key={i}
                  style={{ color: item.hasOption ? 'red' : 'black' }}
                  >
                    {item.name} : {diffText}
                    </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {/* 🔎 검색 키워드 추출 섹션 (그룹이 생성된 후에만 표시) */}
      {grouped.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>🔎 검색 키워드 추출</h3>

        {/* 체크박스 */}
        <div>
          <label>
            <input 
              type="radio" 
              name="keywordType" 
              value="ペンライト" 
              checked={keywordType === "ペンライト"} 
              onChange={(e) => setKeywordType(e.target.value)} 
            /> 응원봉
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input 
              type="radio" 
              name="keywordType" 
              value="アルバム" 
              checked={keywordType === "アルバム"} 
              onChange={(e) => setKeywordType(e.target.value)} 
            /> 앨범
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input 
              type="radio" 
              name="keywordType" 
              value="MD" 
              checked={keywordType === "MD"} 
              onChange={(e) => setKeywordType(e.target.value)} 
            /> MD
          </label>
        </div>

        {/* 멤버명 입력 */}
        <div style={{ marginTop: '10px' }}>
          <textarea
            placeholder="멤버명을 쉼표로 구분해 입력하세요 (예: 리쿠, 쇼타, 유타) + 4명까지만 입력 가능합니다."
            value={memberText}
            onChange={(e) => {
                const value = e.target.value;
                const members = value.split(",").map(m => m.trim()).filter(Boolean);
                if (members.length <= 4) {
                setMemberText(value);
                } else {
                alert("최대 4명까지만 입력할 수 있다!");
                }
            }}
            style={{ width: '100%', height: '60px' }}
          />
        </div>

    <button 
      className="pretty-button" 
      style={{ marginTop: '10px' }}
      onClick={handleGenerateKeywords}
    >
      생성하기
    </button>

    {/* 결과 출력 */}
    {keywords.length > 0 && (
  <div style={{ marginTop: '15px' }}>
    <h4>검색키워드</h4>
    <ul>
      {keywords.map((kw, idx) => (
        <li key={idx} style={{ marginBottom: '10px' }}>
          {kw.type === "main" ? (
            // 메인 키워드 → EN/JP 각각 복사 버튼
            <>
              <div>
                {kw.en}
                <button
                  className="COPY-button"
                  style={{ marginLeft: '10px' }}
                  onClick={() => handleCopy(kw.en, "영어 키워드")}
                >
                  복사하기
                </button>
              </div>
              <div>
                {kw.jp}
                <button
                  className="COPY-button"
                  style={{ marginLeft: '10px' }}
                  onClick={() => handleCopy(kw.jp, "일본어 키워드")}
                >
                  복사하기
                </button>
              </div>
            </>
          ) : (
            // 멤버 키워드 → EN/JP 각각 복사 버튼
            <>
              <div>
                {kw.en}
                <button
                  className="COPY-button"
                  style={{ marginLeft: '10px' }}
                  onClick={() => handleCopy(kw.en, "영어 키워드")}
                >
                  복사하기
                </button>
              </div>
              <div>
                {kw.jp}
                <button
                  className="COPY-button"
                  style={{ marginLeft: '10px' }}
                  onClick={() => handleCopy(kw.jp, "일본어 키워드")}
                >
                  복사하기
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  </div>
)}

  </div>
)}
    </div>  
  );
}
export default App;