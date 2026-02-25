#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
#  Cypress-Jenkins POC — One-Command Setup
#  macOS / Linux
# ─────────────────────────────────────────────

REPO_URL="https://github.com/saifafzal1/cypress-automation-poc.git"
REPO_DIR="cypress-automation-poc"
JENKINS_URL="http://localhost:8080"
JENKINS_USER="admin"
JENKINS_PASS="admin123"
POLL_INTERVAL=5
MAX_WAIT=180  # seconds

# ── Banner ───────────────────────────────────
echo "╔══════════════════════════════════════════╗"
echo "║  Cypress + Jenkins  Automation POC       ║"
echo "║  One-Command Setup                       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Check prerequisites ──────────────────
missing=()

if ! command -v git &>/dev/null; then
  missing+=("git  → https://git-scm.com/downloads")
fi

if ! command -v docker &>/dev/null; then
  missing+=("docker  → https://docs.docker.com/get-docker/")
fi

if docker compose version &>/dev/null; then
  :  # Docker Compose v2 plugin found
elif command -v docker-compose &>/dev/null; then
  :  # Legacy docker-compose found
else
  missing+=("docker compose  → https://docs.docker.com/compose/install/")
fi

if [ ${#missing[@]} -gt 0 ]; then
  echo "ERROR: Missing prerequisites:"
  for m in "${missing[@]}"; do
    echo "  - $m"
  done
  echo ""
  echo "Install the tools above and re-run this script."
  exit 1
fi

echo "[OK] All prerequisites found (git, docker, docker compose)"
echo ""

# ── 2. Clone repo (skip if already present) ─
if [ -f "docker-compose.yml" ] && [ -d "jenkins" ]; then
  echo "[OK] Already inside the project directory — skipping clone"
elif [ -d "$REPO_DIR" ]; then
  echo "[OK] Directory '$REPO_DIR' already exists — skipping clone"
  cd "$REPO_DIR"
else
  echo "Cloning repository..."
  git clone "$REPO_URL"
  cd "$REPO_DIR"
fi

echo ""

# ── 3. Start Jenkins ────────────────────────
echo "Starting Jenkins with Docker Compose..."
if docker compose version &>/dev/null; then
  docker compose up -d --build jenkins
else
  docker-compose up -d --build jenkins
fi

echo ""

# ── 4. Wait for Jenkins to be ready ─────────
echo "Waiting for Jenkins to start (up to ${MAX_WAIT}s)..."
elapsed=0
while [ $elapsed -lt $MAX_WAIT ]; do
  if curl -s -o /dev/null -w "%{http_code}" "$JENKINS_URL/login" 2>/dev/null | grep -q "200"; then
    echo ""
    echo "[OK] Jenkins is ready!"
    break
  fi
  printf "."
  sleep $POLL_INTERVAL
  elapsed=$((elapsed + POLL_INTERVAL))
done

if [ $elapsed -ge $MAX_WAIT ]; then
  echo ""
  echo "WARNING: Jenkins did not respond within ${MAX_WAIT}s."
  echo "Check logs with: docker compose logs jenkins"
  exit 1
fi

echo ""

# ── 5. Print credentials & jobs ─────────────
echo "═══════════════════════════════════════════"
echo "  Jenkins is running at: $JENKINS_URL"
echo ""
echo "  Credentials:"
echo "    Username: $JENKINS_USER"
echo "    Password: $JENKINS_PASS"
echo ""
echo "  Pre-configured pipelines (under Cypress-Tests folder):"
echo "    1. Cypress-Tests/Smoke-Tests"
echo "    2. Cypress-Tests/Regression-Tests"
echo "    3. Cypress-Tests/Docker-Pipeline"
echo "    4. Cypress-Tests/Version-Benchmark"
echo "═══════════════════════════════════════════"
echo ""

# ── 6. Open browser ─────────────────────────
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$JENKINS_URL" 2>/dev/null || true
elif command -v xdg-open &>/dev/null; then
  xdg-open "$JENKINS_URL" 2>/dev/null || true
else
  echo "(Could not auto-open browser — visit $JENKINS_URL manually)"
fi

# ── 7. Print trigger command ─────────────────
echo "To trigger the Version-Benchmark build via CLI:"
echo ""
echo "  CRUMB=\$(curl -s -u $JENKINS_USER:$JENKINS_PASS \\"
echo "    '$JENKINS_URL/crumbIssuer/api/json' | \\"
echo "    python3 -c 'import sys,json; print(json.load(sys.stdin)[\"crumb\"])')"
echo ""
echo "  curl -X POST -u $JENKINS_USER:$JENKINS_PASS \\"
echo "    -H \"Jenkins-Crumb:\$CRUMB\" \\"
echo "    '$JENKINS_URL/job/Cypress-Tests/job/Version-Benchmark/build'"
echo ""
echo "Done! Happy testing."
