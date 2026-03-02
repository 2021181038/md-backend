# 프로젝트 아키텍처 (Project Architecture)

## 📁 폴더 구조 (Folder Structure)

```
frontend/src/
├── api/                    # 공통 API 함수
│   ├── keywordApi.js
│   └── mdApi.js
├── components/             # 공통 컴포넌트
│   ├── TabNavigation.js
│   ├── UploadTab.js
│   └── upload/            # UploadTab 하위 컴포넌트
├── hooks/                 # 공통 커스텀 훅
│   └── useUploadTab.js
├── utils/                 # 공통 유틸리티
│   ├── dateUtils.js
│   ├── descriptionUtils.js
│   ├── excelUtils.js
│   ├── imageUtils.js
│   ├── priceUtils.js
│   └── textUtils.js
├── AlbumUpload/           # 앨범 업로드 기능
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── OnlineUpload/          # 온라인 업로드 기능
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── order/                 # 주문 관리 기능
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── margin/                # 마진 계산기 기능
    ├── components/
    ├── hooks/
    └── utils/
```

## 🏗️ 아키텍처 패턴 (Architecture Patterns)

### 1. 기능별 폴더 구조 (Feature-based Structure)
각 주요 기능(AlbumUpload, OnlineUpload, order, margin)은 독립적인 폴더로 구성되어 있으며, 각 폴더 내부에 다음 구조를 가집니다:
- `api/`: 해당 기능의 API 호출 함수
- `components/`: 해당 기능의 UI 컴포넌트
- `hooks/`: 해당 기능의 커스텀 훅
- `utils/`: 해당 기능의 유틸리티 함수

### 2. 공통 코드 분리
여러 기능에서 공통으로 사용되는 코드는 루트 레벨에 배치:
- `src/api/`: 공통 API 함수
- `src/components/`: 공통 컴포넌트
- `src/hooks/`: 공통 커스텀 훅
- `src/utils/`: 공통 유틸리티

### 3. 컴포넌트 분리 원칙
- 단일 책임 원칙: 각 컴포넌트는 하나의 명확한 역할만 수행
- 재사용성: 공통으로 사용되는 컴포넌트는 별도로 분리
- 관심사 분리: UI와 로직을 분리 (컴포넌트와 훅 분리)

## 🔄 데이터 흐름 (Data Flow)

### 상태 관리
- **로컬 상태**: `useState` 사용
- **컴포넌트 간 상태 공유**: Props drilling 또는 커스텀 훅
- **전역 상태**: 현재 없음 (필요시 Context API 또는 Redux 도입 검토)

### API 호출
- 모든 API 호출은 `api/` 폴더에 정의
- 커스텀 훅에서 API 호출 및 상태 관리
- 에러 처리는 각 API 함수에서 수행

## 🎯 개선 제안 (Improvement Suggestions)

### 1. 상태 관리 라이브러리 도입 검토
현재 Props drilling이 많아질 경우 Context API나 Zustand 같은 경량 상태 관리 라이브러리 도입 검토

### 2. API 클라이언트 통합
현재 각 기능별로 API 함수가 분산되어 있음. 공통 API 클라이언트 생성 검토:
- Axios 인스턴스 생성
- 인터셉터로 공통 에러 처리
- 요청/응답 변환 로직 통합

### 3. 컴포넌트 라이브러리 구축
반복적으로 사용되는 UI 컴포넌트를 별도 라이브러리로 분리:
- Button, Input, Modal 등 공통 컴포넌트
- 스타일 시스템 구축

## 📚 참고 자료
- React 공식 문서: https://react.dev/
- React Hooks 가이드: https://react.dev/reference/react

