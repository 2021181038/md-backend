# Python 설치 및 가상환경 설정 가이드

## 문제: `python` 명령어가 인식되지 않는 경우

Windows에서는 `python` 대신 `py` 명령어를 사용해야 할 수 있습니다.

## 해결 방법

### 1단계: Python 설치 확인

PowerShell에서 다음 명령어를 시도해보세요:

```powershell
# 방법 1: py 명령어 시도
py --version

# 방법 2: python3 시도
python3 --version

# 방법 3: where 명령어로 Python 위치 확인
where python
where py
```

### 2단계: Python이 설치되어 있지 않은 경우

1. **Python 공식 사이트에서 다운로드**
   - https://www.python.org/downloads/
   - Python 3.8 이상 버전 권장

2. **설치 시 주의사항**
   - ✅ "Add Python to PATH" 체크박스 반드시 선택!
   - ✅ "Install for all users" 선택 (관리자 권한 필요)

3. **설치 후 PowerShell 재시작**

### 3단계: 가상환경 생성

Python이 설치되었다면, 다음 중 하나를 시도하세요:

```powershell
# server 폴더로 이동
cd server

# 방법 1: py 명령어 사용 (권장)
py -m venv venv

# 방법 2: python3 사용
python3 -m venv venv

# 방법 3: 전체 경로 사용
C:\Python3x\python.exe -m venv venv
```

### 4단계: 가상환경 활성화

```powershell
# PowerShell에서
.\venv\Scripts\Activate.ps1

# 만약 실행 정책 오류가 나면:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\Activate.ps1
```

### 5단계: 패키지 설치

```powershell
# 가상환경이 활성화된 상태에서 (프롬프트 앞에 (venv) 표시)
pip install -r requirements.txt
```

## 빠른 확인 체크리스트

- [ ] `py --version` 또는 `python --version` 실행 시 버전이 표시되는가?
- [ ] `pip --version` 실행 시 pip이 인식되는가?
- [ ] 가상환경이 성공적으로 생성되었는가?
- [ ] 가상환경 활성화 후 프롬프트에 `(venv)`가 표시되는가?

## 추가 도움말

여전히 문제가 있다면:
1. Python 설치 경로를 PATH 환경 변수에 추가
2. 컴퓨터 재시작
3. 관리자 권한으로 PowerShell 실행

