import React, { useState } from 'react';
import './App.css';

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
  const [bonusConditions, setBonusConditions] = useState([
  { price: "9900", text: "公式特典1枚" },
  { price: "11800", text: "公式特典2枚" },
  { price: "17700", text: "公式特典3枚（以降も金額に応じて自動追加となります。）" }
]);
  const [keywordType, setKeywordType] = useState(''); 
  const [memberText, setMemberText] = useState('');
  const [keywords, setKeywords] = useState([]);


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

      const rawStandard = min * 2;
      const standardPrice = Math.ceil(rawStandard / 100) * 100;

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
        group.push({ name: "–", price: standardPrice.toString() });
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

    if (hasBonus && bonusConditions.length > 0) {
      baseText += `

  🎁【特典情報】

  購入金額に応じて、以下のように公式特典を差し上げます。
  `;

      bonusConditions.forEach(cond => {
        if (cond.price && cond.text) {
          baseText += `\n${cond.price}円以上:${cond.text}`;
        }
      });

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
          const finalPrice = ceilToNearestHundred(Math.max(methodA, methodB));

          return {
            name: `[${match[1]}] ${match[2].trim().replace(/[-\u2013:]+$/, "")}`,
            price: finalPrice.toString(),
          };
        }

        match = line.match(/^(.+?)\s+\u20a9([\d,]+)/);
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

  const members = memberText.split(",").map(m => m.trim()).filter(Boolean);

  try {
    const response = await fetch(`${API_BASE}/translate-members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members }),
    });

    const data = await response.json();
    const translated = data.translatedMembers || [];

    const result = [keywordType, ...translated];
    setKeywords(result);
  } catch (error) {
    console.error("키워드 추출 실패:", error);
    alert("GPT 요청 실패");
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

      <div>
        <label>📌 그룹명: </label>
        <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
      </div>

      <div>
        <label>📌 썸네일 기준 발송날짜: </label>
        <input
          type="date"
          value={thumbnailShippingDate}
          onChange={(e) => setThumbnailShippingDate(e.target.value)}
        />
      </div>

      <div>
        <label>📌 콘서트/팝업명: </label>
        <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
      </div>

      <div>
        <label>📌 특전 유무: </label>
        <input type="checkbox" checked={hasBonus} onChange={(e) => setHasBonus(e.target.checked)} />
      </div>
      {/* 상세이미지 특전 조건 입력 UI */}
      {hasBonus && (
        <div style={{ marginTop: '0px', marginBottom:'10px' }}>
          <h3>🎁 특전조건 입력</h3>
          <h5>9900엔 이상 공식혜택 1장 이렇게 되어있음. 조건이 복잡해지면 따로 입력하거나 파파고 ㄱㄱ</h5>
          {bonusConditions.map((cond, idx) => (
            <div key={idx} style={{ marginBottom: '5px' }}>
              <input
                type="number"
                value={cond.price}
                onChange={(e) => {
                  const newConds = [...bonusConditions];
                  newConds[idx].price = e.target.value;
                  setBonusConditions(newConds);
                }}
                style={{ width: '100px', marginRight: '8px' }}
              /> 円以上 :
              <input
                type="text"
                value={cond.text}
                onChange={(e) => {
                  const newConds = [...bonusConditions];
                  newConds[idx].text = e.target.value;
                  setBonusConditions(newConds);
                }}
                style={{ width: '250px', marginLeft: '8px' }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setBonusConditions([...bonusConditions, { price: "", text: "" }])
            }
            style={{ marginTop: '5px' }}
          >
            조건 추가 +
          </button>
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
          <h3>📋 상품명 및 가격 * 맞는지 꼭 확인해보기</h3>
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
                        newList[idx].price = e.target.value;
                        setMdList(newList);
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
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
          <button 
            className="pretty-button" 
            style={{ marginTop: '20px', marginBottom:'10px' }} 
            onClick={handleGroup}
          >
            가격별 그룹 만들기
          </button>
        </div>
      )}
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
            
            {/* 그룹별 복사 버튼 */}
          <button
            className="COPY-button"
            style={{ marginLeft: '10px' }}
            onClick={() => {
              const names = sortedItems.map(item => item.name).join(" , ");
              handleCopy(names, `그룹 ${idx + 1} 상품명`);
            }}
          >
            그룹 {idx + 1} 복사하기
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
        placeholder="멤버명을 쉼표로 구분해 입력하세요 (예: 리쿠, 쇼타, 유타) + 9개까지만 입력 가능합니다."
        value={memberText}
        onChange={(e) => {
            const value = e.target.value;
            const members = value.split(",").map(m => m.trim()).filter(Boolean);
            if (members.length <= 9) {
            setMemberText(value);
            } else {
            alert("최대 9명까지만 입력할 수 있다!");
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
            <li key={idx} style={{ marginBottom: '5px' }}>
              {kw}
              <button
                className="COPY-button"
                style={{ marginLeft: '10px' }}
                onClick={() => handleCopy(kw, "검색 키워드")}
              >
                복사하기
              </button>
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

console.log("✅ API_BASE:", process.env.REACT_APP_API_BASE);

export default App;