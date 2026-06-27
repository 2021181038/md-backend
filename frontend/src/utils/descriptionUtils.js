import { formatThumbnailDate } from "./dateUtils";

const BONUS_MULTIPLIER = { offline: 2000, online: 1600 };
export const getBonusMultiplier = (uploadMode = "offline") =>
  BONUS_MULTIPLIER[uploadMode] || BONUS_MULTIPLIER.offline;

const PURCHASE_LABEL = { offline: "現地購入", online: "PRE-ORDER" };
const BONUS_SHIPPING_NOTE = {
  offline: "特典はオフラインバージョン特典のみで発送されます。",
  online: "特典はオンライン版の特典のみで発送されます。",
};

// 메인 상품명 생성
export const generateMainName = (
  groupName,
  thumbnailShippingDate,
  eventName,
  hasBonus,
  uploadMode = "offline"
) => {
  if (!groupName || !thumbnailShippingDate || !eventName) {
    alert("그룹명, 발송날짜, 콘서트명을 모두 입력해주세요.");
    return "";
  }

  const dateText = formatThumbnailDate(thumbnailShippingDate);
  const bonusText = hasBonus ? "[特典贈呈]" : "";
  const purchaseLabel = PURCHASE_LABEL[uploadMode] || PURCHASE_LABEL.offline;

  return `[${groupName.toUpperCase()}][${dateText}発送][${purchaseLabel}]${bonusText}${eventName} OFFICIAL MD`;
};

// 상세 설명 생성
export const generateDescription = (
  thumbnailShippingDate,
  hasBonus,
  hasAlbum,
  bonusSets,
  uploadMode = "offline"
) => {
  if (!thumbnailShippingDate) {
    alert("발송 날짜를 입력해주세요.");
    return "";
  }

  const normalDateText = formatThumbnailDate(thumbnailShippingDate);
  const multiplier = BONUS_MULTIPLIER[uploadMode] || BONUS_MULTIPLIER.offline;
  const bonusShippingNote =
    BONUS_SHIPPING_NOTE[uploadMode] || BONUS_SHIPPING_NOTE.offline;

  let html = "";

  /* 특전 정보 */
  if (hasBonus && bonusSets.length > 0) {
    html += `
<div style="text-align:center;"><strong>🎁【特典情報】</strong></div>
<div style="text-align:center;">購入金額に応じて、以下のように公式特典を差し上げます。</div>
`;

    if (bonusSets.length === 1 && bonusSets[0].base) {
      const base = Number(bonusSets[0].base);
      html += `
<div style="text-align:center;">${base * multiplier - 100}円以上 : 公式特典1枚</div>
<div style="text-align:center;">${base * multiplier * 2 - 200}円以上 : 公式特典2枚</div>
<div style="text-align:center;">${base * multiplier * 3 - 300}円以上 : 公式特典3枚 (以降も金額に応じて自動追加となります。)</div>
`;
    } else {
      bonusSets.forEach(set => {
        if (set.base && set.label) {
          html += `
<div style="text-align:center;">
  ${set.base * multiplier - 100}円ごとに ${set.label} 1枚ずつ支給
</div>
`;
        }
      });

      const maxBase = Math.max(...bonusSets.map(s => Number(s.base)));
      html += `<div style="text-align:center;">例: ${maxBase * multiplier - 100}円の場合 → `;

      html += bonusSets
        .map(
          s =>
            `${s.label} ${Math.floor(
              (maxBase * multiplier - 100) / (s.base * multiplier - 100)
            )}枚`
        )
        .join(" + ");

      html += `</div>`;
    }

    html += `
<br>
<div style="text-align:center;">
  <span style="font-size:14pt; color:#ff0000; background-color:#ffff00;">
    ✔️送料を除く<strong>決済金額</strong>が対象となります。
  </span>
</div>
<div style="text-align:center;">✔️メンバーは可能な限りご希望に合わせ、重複のないようにお届けいたします。</div>
${
  hasAlbum
    ? `<div style="text-align:center;">✔️アルバムは特典の価格に含まれておりません。</div>`
    : ""
}
<br>
${
  hasAlbum
    ? `
<div style="text-align:center;"><strong>🎁【アルバム購入ラッキードローイベント】</strong></div>
<div style="text-align:center;">購入枚数によって下記のように公式特典を差し上げます。</div>
<div style="text-align:center;">1枚購入時:公式特典1枚</div>
<div style="text-align:center;">2枚購入時:公式特典2枚</div>
<div style="text-align:center;">3枚ご購入時:公式特典3枚（以降も金額に応じて自動的に追加されます。）</div>
<br>
`
    : ""
}
`;
  }

  /* 발송 안내 */
  html += `<div style="text-align:center;"><strong>【発送について】</strong></div>`;
  html += `
<div style="text-align:center;">${normalDateText}より、ご注文順に順次出荷されます。</div>
<div style="text-align:center;">できるだけ早くお届けできるよう努めます。</div>
${
  hasBonus
    ? `<div style="text-align:center;">${bonusShippingNote}</div>`
    : ""
}
<div style="text-align:center;">※「入金待ち」の状態が続いた場合、ご注文がキャンセルとなる可能性がございます。</div>
<div style="text-align:center;">関税は当店が負担いたします。</div>
<div style="text-align:center;">商品はすべて<strong>100％正規品</strong>です。</div>
<br>
`;

  html += `
<div style="text-align:center;">
  ご不明な点やご希望がございましたら、いつでもお気軽にお問い合わせください ^^
</div>
`;

  return html;
};
