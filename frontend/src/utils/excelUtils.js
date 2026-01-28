import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// 그룹별 엑셀 다운로드
export const downloadGroupExcel = (group, groupIdx) => {
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
          option_price_yen: Number(item.price) - group.standardPrice,
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
        option_title_2: hasAnyOptions ? "TYPE" : "",
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

  XLSX.utils.sheet_add_json(worksheet, rows, {
    header: headers,
    skipHeader: true,
    origin: "A5"
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Group${groupIdx + 1}`);

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([excelBuffer], { type: "application/octet-stream" }),
    `group_${groupIdx + 1}_qoo10_optiondownitem.xlsx`
  );
};

