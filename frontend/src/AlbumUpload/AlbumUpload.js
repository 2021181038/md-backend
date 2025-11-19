import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AlbumUpload() {
  const [groupName, setGroupName] = useState("");
  const [eventName, setEventName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [detailDescription, setDetailDescription] = useState("");
  const [albums, setAlbums] = useState([]);
  const [grouped, setGrouped] = useState([]);

  // ✅ 환율 계산 (App.js 동일 로직)
  const ceilToNearestHundred = (num) => Math.ceil(num / 100) * 100;

  const convertToYen = (rawPriceKrw) => {
    const raw = Number(rawPriceKrw);
    if (isNaN(raw) || raw <= 0) return 0;
    const methodA = ((raw + 1600) / 0.58) / 9.42;
    const methodB = raw * 0.2;
    const finalPrice = ceilToNearestHundred(Math.max(methodA, methodB)) - 10;
    return finalPrice;
  };

  // ✅ 날짜를 일본식 형식으로 표시
  const formatDateJP = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  // ✅ 상세페이지 자동 생성
  const handleGenerateDescription = () => {
    if (!groupName || !eventName || !releaseDate) {
      alert("그룹명, 이벤트명, 발매일을 모두 입력해주세요!");
      return;
    }

    const jpDate = formatDateJP(releaseDate);
    const baseText = `
【発送について】

${jpDate}より、ご注文順に順次出荷されます。できるだけ早くお届けできるよう努めます。

*「入金待ち」*の状態が続きますと、現地での商品確保ができず、ご注文がキャンセルになる場合がございます。できるだけ早い決済をお願いいたします。

関税はこちらで負担いたしますのでご安心ください。
商品はすべて100%正規品です。

📦【商品情報】
『${eventName}』${groupName} OFFICIAL ALBUM
`;

    setDetailDescription(baseText.trim());
  };

  // ✅ 상품 추가
  const handleAddAlbum = () => {
    setAlbums([
      ...albums,
      { name: "", originalPriceKrw: "", price: "", hasOption: false, optionText: "" },
    ]);
  };

  // ✅ 가격 그룹 묶기 (App.js 동일 로직)
  const groupByCustomPrice = (items) => {
    const sorted = [...items].sort((a, b) => Number(a.price) - Number(b.price));
    let remaining = [...sorted];
    const groups = [];

    while (remaining.length > 0) {
      const prices = remaining.map((item) => Number(item.price));
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
        standardPrice = Math.round(maxPrice * 0.68);
      }

      const hasStandard = group.some((item) => Number(item.price) === standardPrice);
      if (!hasStandard) {
        group.push({ name: "–", price: standardPrice.toString() });
      }

      groups.push({ standardPrice, items: group });
      const ids = new Set(group.map((g) => g.name + g.price));
      remaining = remaining.filter((item) => !ids.has(item.name + item.price));
    }

    return groups;
  };

  const handleGroup = () => {
    const result = groupByCustomPrice(albums);
    setGrouped(result);
  };

  // ✅ 엑셀 다운로드
  const handleDownloadExcelByGroup = (group, idx) => {
    const headers = [
      "option_title_1",
      "option_name_1",
      "option_title_2",
      "option_name_2",
      "option_price_yen",
      "option_quantity",
      "seller_unique_option_id",
      "external_product_hs_id",
      "q_inventory_id",
    ];

    const rows = group.items.map((item) => ({
      option_title_1: "OPTION",
      option_name_1: item.name,
      option_title_2: item.hasOption ? "TYPE" : "",
      option_name_2: item.optionText || "",
      option_price_yen: Number(item.price) - group.standardPrice,
      option_quantity: 20,
      seller_unique_option_id: "",
      external_product_hs_id: "",
      q_inventory_id: "",
    }));

    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.sheet_add_json(worksheet, rows, {
      header: headers,
      skipHeader: true,
      origin: "A5",
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Group${idx + 1}`);
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), `album_group_${idx + 1}.xlsx`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>💿 앨범 업로드 탭</h2>

      <div>
        <label>📌 그룹명: </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value.toUpperCase())}
        />
      </div>

      <div>
        <label>📌 이벤트명: </label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
      </div>

      <div>
        <label>📌 발매일: </label>
        <input
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
        />
      </div>

      <button
        className="pretty-button"
        style={{ marginTop: "10px" }}
        onClick={handleGenerateDescription}
      >
        입력 완료
      </button>

      {detailDescription && (
        <div style={{ marginTop: "20px" }}>
          <h3>📝 상세페이지 글</h3>
          <textarea
            value={detailDescription}
            readOnly
            style={{ width: "100%", height: "200px" }}
          />
        </div>
      )}

      {detailDescription && (
        <button
          className="pretty-button"
          style={{ marginTop: "20px" }}
          onClick={handleAddAlbum}
        >
          상품 추가 +
        </button>
      )}

      {/* 상품 입력 테이블 */}
      {albums.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>📋 상품명 및 가격 입력</h3>
          <table className="md-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>가격 (원화)</th>
                <th>가격 (엔화)</th>
                <th>옵션</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {albums.map((item, idx) => (
                <tr key={idx}>
                  {/* 상품명 */}
                  <td>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...albums];
                        updated[idx].name = e.target.value;
                        setAlbums(updated);
                      }}
                    />
                  </td>

                  {/* 원화 입력 */}
                  <td>
                    <input
                      type="number"
                      value={item.originalPriceKrw || ""}
                      placeholder="₩원화 입력"
                      onChange={(e) => {
                        const updated = [...albums];
                        updated[idx].originalPriceKrw = e.target.value;
                        setAlbums(updated);
                      }}
                    />
                  </td>

                  {/* 엔화 변환 */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="number"
                        value={item.price || ""}
                        placeholder="¥엔화 자동변환"
                        readOnly
                      />
                      <button
                        className="convert-btn"
                        onClick={() => {
                          const updated = [...albums];
                          const krw = updated[idx].originalPriceKrw;
                          updated[idx].price = convertToYen(krw);
                          setAlbums(updated);
                        }}
                      >
                        엔화로 변환
                      </button>
                    </div>
                  </td>

                  {/* 옵션 */}
                  <td>
                    <input
                      type="checkbox"
                      checked={item.hasOption}
                      onChange={(e) => {
                        const updated = [...albums];
                        updated[idx].hasOption = e.target.checked;
                        setAlbums(updated);
                      }}
                    />
                    {item.hasOption && (
                      <input
                        type="text"
                        placeholder="쉼표로 구분 (예: A,B,C)"
                        value={item.optionText || ""}
                        onChange={(e) => {
                          const updated = [...albums];
                          updated[idx].optionText = e.target.value;
                          setAlbums(updated);
                        }}
                      />
                    )}
                  </td>

                  {/* 삭제 */}
                  <td>
                    <button
                      onClick={() => {
                        const updated = [...albums];
                        updated.splice(idx, 1);
                        setAlbums(updated);
                      }}
                    >
                      삭제 –
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 그룹 및 엑셀 */}
          <div style={{ marginTop: "20px" }}>
            <button className="pretty-button" onClick={handleGroup}>
              가격별 그룹 만들기
            </button>
          </div>

          {grouped.map((group, idx) => (
            <div key={idx} style={{ marginTop: "10px" }}>
              <strong>
                그룹 {idx + 1} (기준가격 ¥{group.standardPrice})
              </strong>
              <button
                className="pretty-button"
                style={{ marginLeft: "10px" }}
                onClick={() => handleDownloadExcelByGroup(group, idx)}
              >
                엑셀 다운로드
              </button>
              <ul>
                {group.items.map((it, i) => (
                  <li key={i}>
                    {it.name} ({it.price})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlbumUpload;
