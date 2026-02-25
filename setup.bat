@echo off
setlocal enabledelayedexpansion

REM ─────────────────────────────────────────────
REM  Cypress-Jenkins POC — One-Command Setup
REM  Windows (CMD)
REM ─────────────────────────────────────────────

set REPO_URL=https://github.com/saifafzal1/cypress-automation-poc.git
set REPO_DIR=cypress-automation-poc
set JENKINS_URL=http://localhost:8080
set JENKINS_USER=admin
set JENKINS_PASS=admin123
set POLL_INTERVAL=5
set MAX_WAIT=180

REM ── Banner ────────────────────────────────────
echo.
echo ======================================
echo   Cypress + Jenkins  Automation POC
echo   One-Command Setup (Windows)
echo ======================================
echo.

REM ── 1. Check prerequisites ───────────────────
set MISSING=0

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] git  -- https://git-scm.com/downloads
    set MISSING=1
)

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] docker  -- https://docs.docker.com/get-docker/
    set MISSING=1
)

docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] docker compose  -- https://docs.docker.com/compose/install/
    set MISSING=1
)

if %MISSING% equ 1 (
    echo.
    echo ERROR: Install the missing tools above and re-run this script.
    exit /b 1
)

echo [OK] All prerequisites found (git, docker, docker compose)
echo.

REM ── 2. Clone repo (skip if already present) ──
if exist "docker-compose.yml" if exist "jenkins" (
    echo [OK] Already inside the project directory -- skipping clone
    goto :start_jenkins
)

if exist "%REPO_DIR%" (
    echo [OK] Directory '%REPO_DIR%' already exists -- skipping clone
    cd "%REPO_DIR%"
    goto :start_jenkins
)

echo Cloning repository...
git clone %REPO_URL%
cd "%REPO_DIR%"

:start_jenkins
echo.

REM ── 3. Start Jenkins ──────────────────────────
echo Starting Jenkins with Docker Compose...
docker compose up -d --build jenkins
echo.

REM ── 4. Wait for Jenkins to be ready ───────────
echo Waiting for Jenkins to start (up to %MAX_WAIT%s)...
set ELAPSED=0

:wait_loop
if %ELAPSED% geq %MAX_WAIT% goto :timeout

curl -s -o nul -w "%%{http_code}" %JENKINS_URL%/login 2>nul | findstr "200" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo [OK] Jenkins is ready!
    goto :jenkins_ready
)

<nul set /p =.
timeout /t %POLL_INTERVAL% /nobreak >nul
set /a ELAPSED=%ELAPSED%+%POLL_INTERVAL%
goto :wait_loop

:timeout
echo.
echo WARNING: Jenkins did not respond within %MAX_WAIT%s.
echo Check logs with: docker compose logs jenkins
exit /b 1

:jenkins_ready
echo.

REM ── 5. Print credentials and jobs ─────────────
echo ==========================================
echo   Jenkins is running at: %JENKINS_URL%
echo.
echo   Credentials:
echo     Username: %JENKINS_USER%
echo     Password: %JENKINS_PASS%
echo.
echo   Pre-configured pipelines (under Cypress-Tests folder):
echo     1. Cypress-Tests/Smoke-Tests
echo     2. Cypress-Tests/Regression-Tests
echo     3. Cypress-Tests/Docker-Pipeline
echo     4. Cypress-Tests/Version-Benchmark
echo ==========================================
echo.

REM ── 6. Open browser ──────────────────────────
start %JENKINS_URL%

REM ── 7. Print trigger command ──────────────────
echo To trigger the Version-Benchmark build via CLI:
echo.
echo   curl -s -u %JENKINS_USER%:%JENKINS_PASS% ^
echo     "%JENKINS_URL%/crumbIssuer/api/json"
echo.
echo   curl -X POST -u %JENKINS_USER%:%JENKINS_PASS% ^
echo     -H "Jenkins-Crumb:YOUR_CRUMB" ^
echo     "%JENKINS_URL%/job/Cypress-Tests/job/Version-Benchmark/build"
echo.
echo Done! Happy testing.
