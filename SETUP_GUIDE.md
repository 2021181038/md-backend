# 🚀 새 노트북 설정 가이드

다른 노트북에서 이 프로젝트를 옮겨온 경우, 다음 단계를 따라 설정하세요.

## 1️⃣ 환경 변수 파일 생성

### 프론트엔드 (.env 파일)
`frontend/` 폴더에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 백엔드 API 주소
# 로컬 개발 시: http://localhost:5050
# 배포 환경: https://md-backend-blond.vercel.app
REACT_APP_API_BASE=http://localhost:5050

# Supabase 설정
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_KEY=your_supabase_anon_key_here
```

### 백엔드 (.env 파일)
`server/` 폴더에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# OpenAI API 키
OPENAI_API_KEY=your_openai_api_key_here

# 서버 포트 (선택사항)
PORT=5050
```

## 2️⃣ 프론트엔드 의존성 설치

```bash
cd frontend
npm install
```

## 3️⃣ 백엔드 Python 가상환경 설정

### Windows (PowerShell)
```powershell
cd server
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Windows (CMD)
```cmd
cd server
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
```

## 4️⃣ 실행 방법

### 프론트엔드 실행
```bash
cd frontend
npm start
```
→ http://localhost:3000 에서 확인

### 백엔드 실행
```bash
cd server
# 가상환경 활성화 후
python app.py
```
→ http://localhost:5050 에서 실행

## ⚠️ 주의사항

1. **환경 변수는 절대 Git에 커밋하지 마세요!**
   - `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다.

2. **API 키 확인**
   - OpenAI API 키: https://platform.openai.com/api-keys
   - Supabase 정보: Supabase 프로젝트 설정에서 확인

3. **포트 충돌**
   - 프론트엔드: 3000번 포트
   - 백엔드: 5050번 포트
   - 다른 프로그램이 사용 중이면 변경하세요.

4. **하드코딩된 URL 확인**
   - `frontend/src/AlbumUpload/AlbumUpload.js` 126번 줄에 하드코딩된 URL이 있습니다.
   - 로컬 개발 시 `REACT_APP_API_BASE` 환경 변수를 사용하도록 수정하는 것을 권장합니다.

