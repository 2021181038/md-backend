# Python 설치 확인 스크립트
Write-Host "Python 설치 확인 중..." -ForegroundColor Yellow

# Python 버전 확인
Write-Host "`n1. py 명령어 확인:" -ForegroundColor Cyan
py --version

Write-Host "`n2. python 명령어 확인:" -ForegroundColor Cyan
python --version

Write-Host "`n3. pip 확인:" -ForegroundColor Cyan
pip --version

Write-Host "`n✅ Python이 설치되어 있다면 위에 버전이 표시됩니다." -ForegroundColor Green
Write-Host "❌ 오류가 나면 Python을 설치해야 합니다." -ForegroundColor Red

