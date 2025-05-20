@echo off
cd /d %~dp0
echo.
echo [ Git Push FORÇADO - main ]
echo ----------------------------
git add .
set /p msg="Mensagem do commit: "
git commit -m "%msg%"
git push origin main --force
echo.
echo [✔] Push forçado concluído na main.
pause
