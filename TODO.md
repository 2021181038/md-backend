# 해야할 일 (TODO)

## ✅ 완료된 항목 (Completed)

리팩토링을 통해 대부분의 ESLint 경고가 해결되었습니다.

### src/AlbumUpload/hooks/useAlbumUpload.js
- ✅ `rawKeywords`, `setRawKeywords` - 제거 완료
- ✅ `isKeywordLoading` - 제거 완료
- ✅ `generatedKeywords` - 제거 완료
- ✅ `setKeywordType` - 제거 완료
- ✅ `handleGenerateKeywordsByGPT` - 제거 완료
- ✅ `generateKeywordsByGPT` import - 제거 완료

### src/order/components/UploadMarginModal.js
- ✅ `inserted` 변수 - 제거 완료

### src/OnlineUpload/hooks/useOnlineUpload.js
- ✅ `hasPreorder`, `setHasPreorder` - 제거 완료 (온라인 업로드에서는 사용하지 않음)
- ✅ `preorderShippingDate`, `setPreorderShippingDate` - 제거 완료 (온라인 업로드에서는 사용하지 않음)

## 📝 참고 사항

리팩토링으로 인해 다음 파일들의 경고는 더 이상 존재하지 않습니다:
- `src/App.js` - 리팩토링 완료 (27줄)
- `src/OnlineUpload/OnlineUpload.js` - 리팩토링 완료 (128줄)
- `src/margin/MarginCalculator.js` - 리팩토링 완료 (101줄)
- `src/order/components/AgentList.js` - 리팩토링 완료 (130줄)

## 🔍 추가 확인 필요

다음 항목들은 리팩토링 전 경고였으며, 현재 코드에서는 확인이 필요합니다:
- `src/AlbumUpload/AlbumUpload.js`의 일부 변수들 (리팩토링으로 해결되었을 가능성 높음)
- `src/margin/MarginCalculator.js`의 `proxyFee = proxyFee` (리팩토링으로 해결되었을 가능성 높음)

## 참고

- 이 경고들은 **에러가 아닙니다**. 앱은 정상적으로 작동합니다.
- 빌드도 성공합니다.
- 리팩토링을 통해 대부분의 경고가 해결되었습니다.
