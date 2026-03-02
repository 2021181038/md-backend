# 서버 실행 방법

## 백엔드 서버 실행

PowerShell에서 다음 명령어를 순서대로 실행하세요:

### 1. server 폴더로 이동
```powershell
cd server
```

### 2. 가상환경 활성화
```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Flask 서버 실행
```powershell
python app.py
```

## 한 줄로 실행하기

```powershell
cd server; .\venv\Scripts\Activate.ps1; python app.py
```

## 실행 확인

서버가 정상적으로 시작되면 다음과 같은 메시지가 표시됩니다:
```
 * Running on http://0.0.0.0:5050
```

기본 포트는 **5050**입니다. (`.env` 파일에서 `PORT` 환경 변수로 변경 가능)

## 서버 종료

서버를 종료하려면 `Ctrl + C`를 누르세요.

## 주의사항

- 프론트엔드를 실행하기 전에 **반드시 백엔드 서버가 먼저 실행**되어 있어야 합니다.
- 프론트엔드가 백엔드 API를 호출하므로, 백엔드 서버가 실행되지 않으면 API 호출이 실패합니다.

