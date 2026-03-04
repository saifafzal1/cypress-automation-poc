#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
#  Cypress Jenkins Runner  —  Universal Script
#  Works on any machine. Auto-detects a local Jenkins instance and
#  skips connection prompts. Falls back to asking for remote details
#  when no local Jenkins is found.
#
#  LOCAL USAGE  (Jenkins running on this machine):
#    ./scripts/run-cypress-jenkins.sh
#
#  REMOTE USAGE  (Jenkins running on another machine):
#    ./scripts/run-cypress-jenkins.sh --remote
#
#  NON-INTERACTIVE  (CI pipelines / saved profiles):
#    JENKINS_URL=http://host:8080 \
#    JENKINS_USER=admin \
#    JENKINS_API_TOKEN=your-token \
#    CYPRESS_SUITE=regression \
#    CYPRESS_BROWSER=chrome \
#    CYPRESS_ENV=dev \
#    CYPRESS_PARALLEL=true \
#    ./scripts/run-cypress-jenkins.sh --non-interactive
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────
RED='\033[0;31m';  GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m';     DIM='\033[2m';  RESET='\033[0m'
TICK="${GREEN}✔${RESET}"; CROSS="${RED}✖${RESET}"; ARROW="${CYAN}▶${RESET}"

# ── Helpers ───────────────────────────────────────────────────────────
print_banner() {
    echo ""
    echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD}${CYAN}║        Cypress Jenkins Runner  —  Universal              ║${RESET}"
    echo -e "${BOLD}${CYAN}║        Cypress 14  •  CLEO Automation Framework          ║${RESET}"
    echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════╝${RESET}"
    echo ""
}

# prompt <var> <label> <default>
prompt() {
    local var_name="$1" label="$2" default="${3:-}"
    # Skip if already set via env override
    [[ -n "${!var_name:-}" ]] && { echo -e "  ${DIM}${label}: ${!var_name} (env)${RESET}"; return; }
    [[ -n "$default" ]] \
        && echo -ne "  ${BOLD}${label}${RESET} ${DIM}[${default}]${RESET}: " \
        || echo -ne "  ${BOLD}${label}${RESET}: "
    read -r _inp
    printf -v "$var_name" '%s' "${_inp:-$default}"
}

# prompt_secret <var> <label>
prompt_secret() {
    local var_name="$1" label="$2"
    [[ -n "${!var_name:-}" ]] && { echo -e "  ${DIM}${label}: **** (env)${RESET}"; return; }
    echo -ne "  ${BOLD}${label}${RESET} ${DIM}(input hidden)${RESET}: "
    read -rs _sinp; echo ""
    printf -v "$var_name" '%s' "$_sinp"
}

# prompt_menu <var> <label> <options_nameref> <default_index>
prompt_menu() {
    local var_name="$1" label="$2" default_idx="${4:-1}"
    local -n _opts="$3"
    [[ -n "${!var_name:-}" ]] && { echo -e "  ${DIM}${label}: ${!var_name} (env)${RESET}"; return; }
    echo -e "  ${BOLD}${label}${RESET}:"
    local i=1
    for o in "${_opts[@]}"; do
        [[ "$i" -eq "$default_idx" ]] \
            && echo -e "    ${CYAN}${i})${RESET} ${o} ${DIM}(default)${RESET}" \
            || echo -e "    ${CYAN}${i})${RESET} ${o}"
        ((i++))
    done
    echo -ne "  Choose [${default_idx}]: "
    read -r _ch; _ch="${_ch:-$default_idx}"
    if ! [[ "$_ch" =~ ^[0-9]+$ ]] || (( _ch < 1 || _ch > ${#_opts[@]} )); then
        echo -e "  ${YELLOW}Invalid — using default.${RESET}"; _ch="$default_idx"
    fi
    printf -v "$var_name" '%s' "${_opts[$((_ch-1))]}"
}

SPINNER_PID=""
spinner_start() {
    echo -ne "  ${CYAN}${1}${RESET} "
    ( chars='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
      while true; do
        for (( i=0; i<${#chars}; i++ )); do
            echo -ne "\r  ${CYAN}${1}${RESET} ${chars:$i:1} "; sleep 0.1
        done
      done ) &
    SPINNER_PID=$!; disown "$SPINNER_PID" 2>/dev/null || true
}
spinner_stop() {
    [[ -n "${SPINNER_PID:-}" ]] && { kill "$SPINNER_PID" 2>/dev/null || true; SPINNER_PID=""; echo -ne "\r\033[K"; }
}
die() { spinner_stop; echo -e "\n  ${CROSS} ${RED}${1}${RESET}\n"; exit 1; }
section() { echo ""; echo -e "${BOLD}${CYAN}── ${1} $(printf '─%.0s' $(seq 1 $((52-${#1}))))${RESET}"; }

# ── Parse flags ──────────────────────────────────────────────────────
NON_INTERACTIVE=false
FORCE_REMOTE=false
for arg in "${@:-}"; do
    [[ "$arg" == "--non-interactive" ]] && NON_INTERACTIVE=true
    [[ "$arg" == "--remote"          ]] && FORCE_REMOTE=true
done

# ── Initialise variables (env overrides respected throughout) ─────────
JENKINS_URL="${JENKINS_URL:-}"
JENKINS_USER="${JENKINS_USER:-}"
JENKINS_API_TOKEN="${JENKINS_API_TOKEN:-}"
CYPRESS_SUITE="${CYPRESS_SUITE:-}"
CYPRESS_BROWSER="${CYPRESS_BROWSER:-}"
CYPRESS_ENV="${CYPRESS_ENV:-}"
CYPRESS_PARALLEL="${CYPRESS_PARALLEL:-}"
COOKIE_JAR=$(mktemp /tmp/jenkins-cookies-XXXXXX.txt)
trap 'rm -f "$COOKIE_JAR" /tmp/jenkins-headers-$$.txt 2>/dev/null || true' EXIT

# ══════════════════════════════════════════════════════════════════════
print_banner

# ── Step 1: Detect / configure Jenkins connection ─────────────────────
section "Jenkins Connection"
echo ""

LOCAL_URL="http://localhost:8080"
LOCAL_USER="admin"
LOCAL_PASS="admin123"   # default from jenkins/casc.yaml
IS_LOCAL=false

if [[ "$FORCE_REMOTE" == false && -z "$JENKINS_URL" ]]; then
    # Silently probe local Jenkins
    spinner_start "Looking for local Jenkins..."
    LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout 5 \
        -u "${LOCAL_USER}:${LOCAL_PASS}" \
        "${LOCAL_URL}/api/json" 2>/dev/null) || LOCAL_STATUS="000"
    spinner_stop

    if [[ "$LOCAL_STATUS" == "200" ]]; then
        IS_LOCAL=true
        JENKINS_URL="$LOCAL_URL"
        JENKINS_USER="$LOCAL_USER"
        JENKINS_API_TOKEN="$LOCAL_PASS"
        echo -e "  ${TICK} ${BOLD}Local Jenkins detected${RESET} at ${CYAN}${LOCAL_URL}${RESET}"
        echo -e "  ${DIM}  Signed in as: ${LOCAL_USER}${RESET}"
        echo -e "  ${DIM}  Skipping connection prompts.${RESET}"

        # ── Check for uncommitted changes ──────────────────────────────
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
        if git -C "$REPO_DIR" rev-parse --git-dir &>/dev/null; then
            UNCOMMITTED=$(git -C "$REPO_DIR" status --porcelain 2>/dev/null) || UNCOMMITTED=""
            if [[ -n "$UNCOMMITTED" ]]; then
                echo ""
                echo -e "  ${YELLOW}⚠  Uncommitted changes detected in your project:${RESET}"
                git -C "$REPO_DIR" status --short | while IFS= read -r l; do
                    echo -e "     ${DIM}${l}${RESET}"
                done
                echo ""
                echo -e "  ${DIM}Jenkins reads from your local git history (committed state).${RESET}"
                echo -e "  ${DIM}Uncommitted changes will NOT be picked up unless you commit them.${RESET}"
                echo ""
                if [[ "$NON_INTERACTIVE" == false ]]; then
                    echo -ne "  ${BOLD}Commit all changes now before running? [Y/n]:${RESET} "
                    read -r _docommit; _docommit="${_docommit:-Y}"
                    if [[ "$_docommit" =~ ^[Yy] ]]; then
                        echo -ne "  ${BOLD}Commit message${RESET} ${DIM}[test run $(date '+%Y-%m-%d %H:%M')]${RESET}: "
                        read -r _cmsg
                        _cmsg="${_cmsg:-test run $(date '+%Y-%m-%d %H:%M')}"
                        git -C "$REPO_DIR" add -A
                        git -C "$REPO_DIR" commit -m "$_cmsg" \
                            && echo -e "  ${TICK} Changes committed" \
                            || die "git commit failed. Resolve any issues and try again."
                    else
                        echo -e "  ${YELLOW}  Proceeding with last committed state.${RESET}"
                    fi
                fi
            else
                echo -e "  ${TICK} Working tree is clean — all changes are committed"
            fi
        fi
    else
        echo -e "  ${YELLOW}⚠${RESET}  No local Jenkins found at ${LOCAL_URL} (HTTP ${LOCAL_STATUS})"
        echo -e "  ${DIM}  Switching to remote mode — please enter connection details.${RESET}"
        echo ""
    fi
fi

# If not local (or --remote flag used), prompt for connection details
if [[ "$IS_LOCAL" == false ]]; then
    prompt       JENKINS_URL       "Jenkins URL"              "http://localhost:8080"
    prompt       JENKINS_USER      "Username"                 "admin"
    prompt_secret JENKINS_API_TOKEN "API Token / Password"
    echo ""

    # Validate the provided connection
    spinner_start "Verifying connection..."
    CONN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout 10 \
        -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
        "${JENKINS_URL}/api/json" 2>/dev/null) || CONN_STATUS="000"
    spinner_stop

    case "$CONN_STATUS" in
        200) echo -e "  ${TICK} Connected to Jenkins at ${BOLD}${JENKINS_URL}${RESET}" ;;
        401) die "Authentication failed (HTTP 401). Check username and API token." ;;
        403) die "Access forbidden (HTTP 403). Your account may lack build permissions." ;;
        000) die "Cannot reach ${JENKINS_URL}. Check the URL and network/firewall." ;;
        *)   die "Unexpected Jenkins response (HTTP ${CONN_STATUS})." ;;
    esac
fi

# ── Step 2: Test configuration ────────────────────────────────────────
section "Test Configuration"
echo ""

SUITES=(smoke sanity regression all)
prompt_menu CYPRESS_SUITE    "Test Suite"   SUITES    4

BROWSERS=(chrome firefox electron)
prompt_menu CYPRESS_BROWSER  "Browser"      BROWSERS  1

ENVS=(dev staging prod)
prompt_menu CYPRESS_ENV      "Environment"  ENVS      1

# Parallel toggle — only meaningful for regression
if [[ "$CYPRESS_SUITE" == "regression" && -z "$CYPRESS_PARALLEL" ]]; then
    echo ""
    echo -e "  ${BOLD}Run in parallel?${RESET} ${DIM}(6 suites run concurrently)${RESET}"
    echo -e "    ${CYAN}1)${RESET} Yes — parallel ${DIM}(default)${RESET}"
    echo -e "    ${CYAN}2)${RESET} No  — sequential"
    echo -ne "  Choose [1]: "
    read -r _par; _par="${_par:-1}"
    [[ "$_par" == "2" ]] && CYPRESS_PARALLEL="false" || CYPRESS_PARALLEL="true"
elif [[ -z "$CYPRESS_PARALLEL" ]]; then
    CYPRESS_PARALLEL="true"
fi

# Human-readable execution mode
if [[ "$CYPRESS_SUITE" == "regression" && "$CYPRESS_PARALLEL" == "true" ]]; then
    MODE_LABEL="Parallel"
else
    MODE_LABEL="Sequential"
fi

# ── Step 3: Confirm ───────────────────────────────────────────────────
section "Ready to Run"
echo ""
echo -e "  ${ARROW} Jenkins      : ${BOLD}${JENKINS_URL}${RESET}  ${DIM}($([ "$IS_LOCAL" = true ] && echo local || echo remote))${RESET}"
echo -e "  ${ARROW} User         : ${BOLD}${JENKINS_USER}${RESET}"
echo -e "  ${ARROW} Suite        : ${BOLD}${CYPRESS_SUITE}${RESET}"
echo -e "  ${ARROW} Browser      : ${BOLD}${CYPRESS_BROWSER}${RESET}"
echo -e "  ${ARROW} Environment  : ${BOLD}${CYPRESS_ENV}${RESET}"
echo -e "  ${ARROW} Execution    : ${BOLD}${MODE_LABEL}${RESET}"
echo ""

if [[ "$NON_INTERACTIVE" == false ]]; then
    echo -ne "  ${BOLD}Start the build? [Y/n]:${RESET} "
    read -r _confirm; _confirm="${_confirm:-Y}"
    [[ "$_confirm" =~ ^[Nn] ]] && echo -e "\n  Aborted.\n" && exit 0
fi

# ── Step 4: Crumb + trigger ───────────────────────────────────────────
section "Triggering Build"
echo ""

JOB_URL="${JENKINS_URL}/job/Cypress-Tests/job/Regression-Tests"

spinner_start "Fetching CSRF crumb..."
CRUMB_JSON=$(curl -s \
    -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
    "${JENKINS_URL}/crumbIssuer/api/json" 2>/dev/null) || CRUMB_JSON=""
spinner_stop

CRUMB_FIELD=$(echo "$CRUMB_JSON" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print(d['crumbRequestField'])" 2>/dev/null) \
    || die "Could not parse CSRF crumb. Check credentials."
CRUMB_VALUE=$(echo "$CRUMB_JSON" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print(d['crumb'])" 2>/dev/null) \
    || die "Could not parse CSRF crumb value."
echo -e "  ${TICK} CSRF crumb obtained"

TRIGGER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
    -H "${CRUMB_FIELD}: ${CRUMB_VALUE}" \
    -X POST "${JOB_URL}/buildWithParameters" \
    --data-urlencode "ENVIRONMENT=${CYPRESS_ENV}" \
    --data-urlencode "BROWSER=${CYPRESS_BROWSER}" \
    --data-urlencode "SUITE=${CYPRESS_SUITE}" \
    --data-urlencode "PARALLEL=${CYPRESS_PARALLEL}" 2>/dev/null) || TRIGGER_HTTP="000"

[[ "$TRIGGER_HTTP" == "201" ]] \
    || die "Failed to trigger build (HTTP ${TRIGGER_HTTP})."
echo -e "  ${TICK} Build queued"

# ── Wait for build number ─────────────────────────────────────────────
spinner_start "Waiting for build to start..."
BUILD_NUMBER=""
for _ in $(seq 1 30); do
    sleep 2
    BN=$(curl -s \
        -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
        "${JOB_URL}/api/json?tree=lastBuild[number,building]" 2>/dev/null \
        | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('lastBuild',{}).get('number',''))" \
        2>/dev/null) || BN=""
    [[ -n "$BN" && "$BN" != "None" ]] && BUILD_NUMBER="$BN" && break
done
spinner_stop

[[ -n "$BUILD_NUMBER" ]] || die "Build did not start within 60 seconds. Check the Jenkins queue."

BUILD_URL="${JOB_URL}/${BUILD_NUMBER}"
echo -e "  ${TICK} ${BOLD}Build #${BUILD_NUMBER}${RESET} is running"
echo -e "      ${DIM}${BUILD_URL}/console${RESET}"

# ── Step 5: Stream live log ───────────────────────────────────────────
section "Live Progress"
echo ""

OFFSET=0
HEADERS_FILE="/tmp/jenkins-headers-$$.txt"

while true; do
    LOG=$(curl -s \
        -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
        "${BUILD_URL}/logText/progressiveText?start=${OFFSET}" \
        -D "$HEADERS_FILE" 2>/dev/null) || LOG=""

    if [[ -n "$LOG" ]]; then
        echo "$LOG" \
          | sed 's/\x1b\[[0-9;]*[mK]//g' \
          | grep -E '^\[Pipeline\]|^\[20[0-9]{2}|passing|failing|All specs|ERROR|npm error|Stage |Finished:|cypress run|npm ci$' \
          | while IFS= read -r line; do
              echo -e "  ${DIM}${line}${RESET}"
            done
    fi

    NEW_OFFSET=$(grep -i '^x-text-size' "$HEADERS_FILE" 2>/dev/null \
        | tr -d '\r' | awk '{print $2}') || true
    [[ -n "$NEW_OFFSET" ]] && OFFSET="$NEW_OFFSET"

    BUILD_INFO=$(curl -s \
        -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
        "${BUILD_URL}/api/json?tree=building,result,duration" 2>/dev/null) || BUILD_INFO=""
    BUILDING=$(echo "$BUILD_INFO" | python3 -c \
        "import sys,json; d=json.load(sys.stdin); print(d.get('building','true'))" 2>/dev/null) || BUILDING="true"
    RESULT=$(echo "$BUILD_INFO" | python3 -c \
        "import sys,json; d=json.load(sys.stdin); print(d.get('result') or '')" 2>/dev/null) || RESULT=""

    [[ "$BUILDING" == "False" && -n "$RESULT" ]] && break
    sleep 4
done
rm -f "$HEADERS_FILE"

# ── Step 6: Summary ───────────────────────────────────────────────────
section "Results"
echo ""

DURATION_MS=$(echo "$BUILD_INFO" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print(d.get('duration',0))" 2>/dev/null) || DURATION_MS=0
DURATION_LABEL=$(python3 -c \
    "m,s=divmod(round(${DURATION_MS}/1000),60); print(f'{m}m {s}s' if m else f'{s}s')" 2>/dev/null) || DURATION_LABEL="${DURATION_MS}ms"

CONSOLE=$(curl -s -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
    "${BUILD_URL}/consoleText" 2>/dev/null) || CONSOLE=""
PASSING=$(echo "$CONSOLE" | grep -oE '[0-9]+ passing' | tail -1 | grep -oE '[0-9]+' || echo "?")
FAILING=$(echo "$CONSOLE" | grep -oE '[0-9]+ failing' | tail -1 | grep -oE '[0-9]+' || echo "0")

if [[ "$RESULT" == "SUCCESS" ]]; then
    echo -e "  ${GREEN}${BOLD}╔══════════════════════════════════════╗${RESET}"
    echo -e "  ${GREEN}${BOLD}║   BUILD PASSED  ✔                    ║${RESET}"
    echo -e "  ${GREEN}${BOLD}╚══════════════════════════════════════╝${RESET}"
    echo ""
    echo -e "  ${TICK}  Suite      :  ${BOLD}${CYPRESS_SUITE}${RESET} — ${MODE_LABEL}"
    echo -e "  ${TICK}  Browser    :  ${BOLD}${CYPRESS_BROWSER}${RESET}"
    echo -e "  ${TICK}  Tests      :  ${BOLD}${GREEN}${PASSING} passing${RESET}  /  ${FAILING} failing"
    echo -e "  ${TICK}  Duration   :  ${BOLD}${DURATION_LABEL}${RESET}"
else
    echo -e "  ${RED}${BOLD}╔══════════════════════════════════════╗${RESET}"
    echo -e "  ${RED}${BOLD}║   BUILD FAILED  ✖                    ║${RESET}"
    echo -e "  ${RED}${BOLD}╚══════════════════════════════════════╝${RESET}"
    echo ""
    echo -e "  ${CROSS}  Suite      :  ${BOLD}${CYPRESS_SUITE}${RESET} — ${MODE_LABEL}"
    echo -e "  ${CROSS}  Browser    :  ${BOLD}${CYPRESS_BROWSER}${RESET}"
    echo -e "  ${CROSS}  Tests      :  ${BOLD}${PASSING} passing${RESET}  /  ${RED}${BOLD}${FAILING} failing${RESET}"
    echo -e "  ${CROSS}  Duration   :  ${BOLD}${DURATION_LABEL}${RESET}"
fi

echo ""
echo -e "  ${ARROW} ${BOLD}Build log  :${RESET}  ${BUILD_URL}/console"
echo -e "  ${ARROW} ${BOLD}Report     :${RESET}  ${BUILD_URL}/Cypress_20Mochawesome_20Report/"
echo ""

if [[ "$NON_INTERACTIVE" == false ]]; then
    echo -ne "  Open HTML report in browser? [y/N]: "
    read -r _open; _open="${_open:-N}"
    if [[ "$_open" =~ ^[Yy] ]]; then
        REPORT_URL="${BUILD_URL}/Cypress_20Mochawesome_20Report/"
        command -v open    &>/dev/null && open    "$REPORT_URL" ||
        command -v xdg-open &>/dev/null && xdg-open "$REPORT_URL" ||
        echo -e "  ${YELLOW}Open manually:${RESET} ${REPORT_URL}"
    fi
fi

echo ""
[[ "$RESULT" == "SUCCESS" ]] && exit 0 || exit 1
