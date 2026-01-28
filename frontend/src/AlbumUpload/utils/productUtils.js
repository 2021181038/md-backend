import { formatDateJP } from '../../utils/dateUtils';

export const generateMainProductName = (
  groupName,
  eventName,
  releaseDate,
  isMemberSelectable,
  isSiteSelectable,
  hasBonus
) => {
  if (!groupName || !eventName || !releaseDate) {
    alert("그룹명 / 발송날짜 / 앨범명을 모두 입력해주세요");
    return "";
  }

  const dateText = formatDateJP(releaseDate);

  return `[${groupName.toUpperCase()}][${dateText}発送]` +
    `${isMemberSelectable ? "[メンバー選択]" : ""}` +
    `${isSiteSelectable ? "[サイトを選択]" : ""}` +
    `${hasBonus ? "[特典贈呈]" : ""}` +
    `[PRE-ORDER]` +
    `${eventName} LUCKY DRAW EVENT`;
};

export const generateDescription = (
  groupName,
  eventName,
  releaseDate,
  hasBonus,
  bonusAlbumName
) => {
  if (hasBonus && !bonusAlbumName) {
    alert("특전 대상 앨범명을 입력해주세요");
    return "";
  }
  if (!groupName || !eventName || !releaseDate) {
    alert("그룹명 / 발송날짜 / 앨범명을 모두 입력해주세요");
    return "";
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

  return text;
};

