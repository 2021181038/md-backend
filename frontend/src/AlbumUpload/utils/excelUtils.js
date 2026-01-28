import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportGroupExcel = (group, idx, sets) => {
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

