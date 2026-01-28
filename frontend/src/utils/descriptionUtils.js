import { formatThumbnailDate } from "./dateUtils";

// 메인 상품명 생성
export const generateMainName = (groupName, thumbnailShippingDate, eventName, hasBonus) => {
  if (!groupName || !thumbnailShippingDate || !eventName) {
    alert("그룹명, 발송날짜, 콘서트명을 모두 입력해주세요.");
    return "";
  }

  const dateText = formatThumbnailDate(thumbnailShippingDate);
  const bonusText = hasBonus ? "[特典贈呈]" : "";

  return `[${groupName.toUpperCase()}][${dateText}発送][現地購入]${bonusText}${eventName} OFFICIAL MD`;
};

// 상세 설명 생성
export const generateDescription = (
  thumbnailShippingDate,
  preorderShippingDate,
  hasBonus,
  hasPreorder,
  hasAlbum,
  bonusSets
) => {
  if (!thumbnailShippingDate) {
    alert("발송 날짜를 입력해주세요.");
    return "";
  }

  const normalDateText = formatThumbnailDate(thumbnailShippingDate);
  const preorderDateText = hasPreorder
    ? formatThumbnailDate(preorderShippingDate)
    : "";

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
<div style="text-align:center;">${base * 2000 - 100}円以上 : 公式特典1枚</div>
<div style="text-align:center;">${base * 4000 - 200}円以上 : 公式特典2枚</div>
<div style="text-align:center;">${base * 6000 - 300}円以上 : 公式特典3枚 (以降も金額に応じて自動追加となります。)</div>
`;
    } else {
      bonusSets.forEach(set => {
        if (set.base && set.label) {
          html += `
<div style="text-align:center;">
  ${set.base * 2000 - 100}円ごとに ${set.label} 1枚ずつ支給
</div>
`;
        }
      });

      const maxBase = Math.max(...bonusSets.map(s => Number(s.base)));
      html += `<div style="text-align:center;">例: ${maxBase * 2000 - 100}円の場合 → `;

      html += bonusSets
        .map(
          s =>
            `${s.label} ${Math.floor(
              (maxBase * 2000 - 100) / (s.base * 2000 - 100)
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

  if (!hasPreorder) {
    html += `
<div style="text-align:center;">${normalDateText}より、ご注文順に順次出荷されます。</div>
<div style="text-align:center;">できるだけ早くお届けできるよう努めます。</div>
${
  hasBonus
    ? `<div style="text-align:center;">特典はオフラインバージョン特典のみで発送されます。</div>`
    : ""
}
<div style="text-align:center;">※「入金待ち」の状態が続いた場合、ご注文がキャンセルとなる可能性がございます。</div>
<div style="text-align:center;">関税は当店が負担いたします。</div>
<div style="text-align:center;">商品はすべて<strong>100％正規品</strong>です。</div>
<br>
`;
  } else {
    if (!preorderShippingDate) {
      alert("PRE-ORDER 발송 날짜를 입력해주세요.");
      return "";
    }

    html += `
<div style="text-align:center;">
  <span style="font-size:14pt;"><strong>① PRE-ORDERではない商品のみをご購入の場合</strong></span>
</div>
<div style="text-align:center;">サムネイルに記載されている日付に合わせて発送されます。</div>
<div style="text-align:center;">発送予定日：<strong>${normalDateText}</strong></div>
<br>

<div style="text-align:center;">
  <span style="font-size:14pt;"><strong>② PRE-ORDER商品と一緒にご購入の場合</strong></span>
</div>
<div style="text-align:center;">PRE-ORDER商品の発送予定日に合わせて同梱発送となります。</div>
<div style="text-align:center;">発送予定日：<strong>${preorderDateText}</strong></div>

<div style="text-align:center;">
  <span style="font-size:14pt; color:#ff0000; background-color:#ffff00;">
    <strong>迅速な配送をご希望の場合は、PRE-ORDER商品と分けてご注文ください。</strong>
  </span>
</div>
<br>
`;
  }

  html += `
<div style="text-align:center;">
  ご不明な点やご希望がございましたら、いつでもお気軽にお問い合わせください ^^
</div>
`;

  return html;
};

