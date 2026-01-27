# Git 연결 및 설정 가이드

## ✅ 현재 상태
- Git 설치됨: ✅
- 원격 저장소 연결됨: ✅ (`https://github.com/2021181038/md-backend.git`)
- 브랜치: `main`

## 🔧 새 컴퓨터에서 해야 할 설정

### 1. Git 사용자 정보 설정

PowerShell에서 다음 명령어를 실행하세요:

```powershell
# 사용자 이름 설정
git config --global user.name "당신의 이름"

# 이메일 설정 (GitHub 계정 이메일)
git config --global user.email "your-email@example.com"
```

### 2. GitHub 인증 설정

#### 방법 1: Personal Access Token (권장)
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 권한 선택: `repo` (전체 권한)
4. 토큰 생성 후 복사

#### 방법 2: SSH 키 사용
```powershell
# SSH 키 생성
ssh-keygen -t ed25519 -C "your-email@example.com"

# 공개 키 복사
cat ~/.ssh/id_ed25519.pub

# GitHub → Settings → SSH and GPG keys → New SSH key에 추가
```

### 3. 현재 변경사항 확인

```powershell
git status
```

### 4. 변경사항 커밋 및 푸시

```powershell
# 변경된 파일 추가
git add .

# 또는 특정 파일만
git add frontend/package.json frontend/src/AlbumUpload/AlbumUpload.js

# 커밋
git commit -m "새 노트북 설정 완료"

# 푸시
git push origin main
```

## ⚠️ 주의사항

### 커밋하지 말아야 할 파일들
- `.env` 파일 (환경 변수, API 키 포함)
- `node_modules/` 폴더
- `venv/` 폴더
- 개인 설정 파일

이미 `.gitignore`에 포함되어 있지만, 확인해보세요:
```powershell
git status
```

### .env 파일이 커밋되어 있다면
```powershell
# .env 파일을 Git에서 제거 (파일은 유지)
git rm --cached server/.env
git rm --cached frontend/.env

# .gitignore 확인
cat .gitignore
cat frontend/.gitignore
cat server/.gitignore
```

## 📝 빠른 체크리스트

- [ ] Git 사용자 이름 설정
- [ ] Git 이메일 설정
- [ ] GitHub 인증 설정 (Token 또는 SSH)
- [ ] `git status`로 변경사항 확인
- [ ] `.env` 파일이 커밋되지 않았는지 확인
- [ ] 변경사항 커밋 및 푸시

## 🔍 유용한 Git 명령어

```powershell
# 현재 상태 확인
git status

# 원격 저장소 확인
git remote -v

# 최신 코드 가져오기
git pull origin main

# 브랜치 확인
git branch

# 커밋 히스토리 확인
git log --oneline
```

