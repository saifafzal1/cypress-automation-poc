#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  Cypress Jenkins Remote Trigger
#  Prompts for connection details, triggers a Jenkins pipeline build,
#  streams progress, and prints a results summary when done.
#
#  Usage:
#    ./scripts/run-cypress-jenkins.sh
#    ./scripts/run-cypress-jenkins.sh --non-interactive  (use env vars)
#
#  Environment variable overrides (for CI/CD or saved profiles):
#    JENKINS_URL      JENKINS_USER     JENKINS_API_TOKEN
#    CYPRESS_SUITE    CYPRESS_BROWSER  CYPRESS_ENV  CYPRESS_PARALLEL
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────
RED='\033[0;31m';  GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m';     DIM='\033[2m';  RESET='\033[0m'
TICK="${GREEN}✔${RESET}"; CROSS="${RED}✖${RESET}"; ARROW="${CYAN}▶${RESET}"

# ── Helpers ───────────────────────────────────────────────────────────
print_banner() {
    echo ""
    echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD}${CYAN}║       Cypress Jenkins Remote Runner                  ║${RESET}"
    echo -e "${BOLD}${CYAN}║       Cypress 14  •  CLEO Automation Framework       ║${RESET}"
    echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${RESET}"
    echo ""
}

prompt() {
    # prompt <variable_name> <display_label> <default>
    local var_name="$1" label="$2" default="$3"
    local current="${!var_name:-}"
    if [ -n "$current" ]; then
        echo -e "  ${DIM}${label}: using env override → ${current}${RESET}"
        return
    fi
    if [ -n "$default" ]; then
        echo -ne "  ${BOLD}${label}${RESET} ${DIM}[${default}]${RESET}: "
    else
        echo -ne "  ${BOLD}${label}${RESET}: "
    fi
    read -r input
    if [ -z "$input" ] && [ -n "$default" ]; then
        eval "$var_name='$default'"
    else
        eval "$var_name='$input'"
    fi
}

prompt_secret() {
    local var_name="$1" label="$2"
    local current="${!var_name:-}"
    if [ -n "$current" ]; then
        echo -e "  ${DIM}${label}: using env override → ****${RESET}"
        return
    fi
    echo -ne "  ${BOLD}${label}${RESET} ${DIM}(hidden)${RESET}: "
    read -rs input
    echo ""
    eval "$var_name='$input'"
}

prompt_choice() {
    # prompt_choice <variable_name> <label> <options_array_name> <default_index>
    local var_name="$1" label="$2" default_idx="${4:-1}"
    local -n options_ref="$3"
    local current="${!var_name:-}"
    if [ -n "$current" ]; then
        echo -e "  ${DIM}${label}: using env override → ${current}${RESET}"
        return
    fi
    echo -e "  ${BOLD}${label}${RESET}:"
    local i=1
    for opt in "${options_ref[@]}"; do
        if [ "$i" -eq "$default_idx" ]; then
            echo -e "    ${CYAN}${i})${RESET} ${opt} ${DIM}(default)${RESET}"
        else
            echo -e "    ${CYAN}${i})${RESET} ${opt}"
        fi
        ((i++))
    done
    echo -ne "  Choose [${default_idx}]: "
    read -r choice
    choice="${choice:-$default_idx}"
    if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt "${#options_ref[@]}" ]; then
        echo -e "  ${YELLOW}Invalid choice, using default.${RESET}"
        choice="$default_idx"
    fi
    eval "$var_name='${options_ref[$((choice-1))]}'"
}

spinner_start() {
    local msg="$1"
    echo -ne "  ${CYAN}${msg}${RESET} "
    (
        local chars='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
        while true; do
            for (( i=0; i<${#chars}; i++ )); do
                echo -ne "\r  ${CYAN}${msg}${RESET} ${chars:$i:1} "
                sleep 0.1
            done
        done
    ) &
    SPINNER_PID=$!
    disown "$SPINNER_PID" 2>/dev/null || true
}

spinner_stop() {
    if [ -n "${SPINNER_PID:-}" ]; then
        kill "$SPINNER_PID" 2>/dev/null || true
        SPINNER_PID=""
        echo -ne "\r\033[K"
    fi
}

die() {
    spinner_stop
    echo -e "\n  ${CROSS} ${RED}${1}${RESET}\n"
    exit 1
}

section() {
    echo ""
    echo -e "${BOLD}${CYAN}── ${1} $( printf '─%.0s' $(seq 1 $((50-${#1}))) )${RESET}"
}

# ── Initialise variable defaults ──────────────────────────────────────
JENKINS_URL="${JENKINS_URL:-}"
JENKINS_USER="${JENKINS_USER:-}"
JENKINS_API_TOKEN="${JENKINS_API_TOKEN:-}"
CYPRESS_SUITE="${CYPRESS_SUITE:-}"
CYPRESS_BROWSER="${CYPRESS_BROWSER:-}"
CYPRESS_ENV="${CYPRESS_ENV:-}"
CYPRESS_PARALLEL="${CYPRESS_PARALLEL:-}"
SPINNER_PID=""

NON_INTERACTIVE=false
[[ "${1:-}" == "--non-interactive" ]] && NON_INTERACTIVE=true

# ══════════════════════════════════════════════════════════════════════
print_banner

# ── Section 1: Jenkins connection details ────────────────────────────
section "Jenkins Connection"
echo ""
prompt    JENKINS_URL       "Jenkins URL"      "http://localhost:8080"
prompt    JENKINS_USER      "Username"         "admin"
prompt_secret JENKINS_API_TOKEN "API Token / Password"

# Strip trailing slash
JENKINS_URL="${JENKINS_URL%/}"

# ── Section 2: Test configuration ────────────────────────────────────
section "Test Configuration"
echo ""

SUITES=(smoke sanity regression all)
prompt_choice CYPRESS_SUITE "Test Suite" SUITES 4

BROWSERS=(chrome firefox electron)
prompt_choice CYPRESS_BROWSER "Browser" BROWSERS 1

ENVIRONMENTS=(dev staging prod)
prompt_choice CYPRESS_ENV "Environment" ENVIRONMENTS 1

# Parallel option only relevant for regression
if [ "$CYPRESS_SUITE" = "regression" ] && [ -z "$CYPRESS_PARALLEL" ]; then
    echo ""
    echo -e "  ${BOLD}Parallel execution?${RESET} ${DIM}(runs 6 suites concurrently)${RESET}"
    echo -ne "  ${CYAN}1)${RESET} Yes ${DIM}(default)${RESET}   ${CYAN}2)${RESET} No"
    echo -ne "\n  Choose [1]: "
    read -r par_choice
    par_choice="${par_choice:-1}"
    [ "$par_choice" = "2" ] && CYPRESS_PARALLEL="false" || CYPRESS_PARALLEL="true"
elif [ -z "$CYPRESS_PARALLEL" ]; then
    CYPRESS_PARALLEL="true"
fi

# Determine display label
if [ "$CYPRESS_SUITE" = "regression" ] && [ "$CYPRESS_PARALLEL" = "true" ]; then
    MODE_LABEL="Parallel"
else
    MODE_LABEL="Sequential"
fi

# ── Section 3: Confirm ────────────────────────────────────────────────
section "Run Summary"
echo ""
echo -e "  ${ARROW} Jenkins URL  : ${BOLD}${JENKINS_URL}${RESET}"
echo -e "  ${ARROW} User         : ${BOLD}${JENKINS_USER}${RESET}"
echo -e "  ${ARROW} Suite        : ${BOLD}${CYPRESS_SUITE}${RESET}"
echo -e "  ${ARROW} Browser      : ${BOLD}${CYPRESS_BROWSER}${RESET}"
echo -e "  ${ARROW} Environment  : ${BOLD}${CYPRESS_ENV}${RESET}"
echo -e "  ${ARROW} Execution    : ${BOLD}${MODE_LABEL}${RESET}"
echo ""

if [ "$NON_INTERACTIVE" = false ]; then
    echo -ne "  ${BOLD}Proceed? [Y/n]:${RESET} "
    read -r confirm
    confirm="${confirm:-Y}"
    [[ "$confirm" =~ ^[Nn] ]] && echo -e "\n  Aborted.\n" && exit 0
fi

# ══════════════════════════════════════════════════════════════════════
section "Connecting to Jenkins"
echo ""

# ── Validate Jenkins is reachable ─────────────────────────────────────
spinner_start "Checking Jenkins availability..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    --connect-timeout 10 \
    -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
    "${JENKINS_URL}/api/json") || true
spinner_stop

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "  ${TICK} Jenkins is reachable (HTTP ${HTTP_STATUS})"
elif [ "$HTTP_STATUS" = "401" ]; then
    die "Authentication failed (HTTP 401). Check your username and API token."
elif [ "$HTTP_STATUS" = "403" ]; then
    die "Forbidden (HTTP 403). Your user may not have build permissions."
elif [ "$HTTP_STATUS" = "000" ]; then
    die "Cannot connect to ${JENKINS_URL}. Is Jenkins running on that machine?"
else
    die "Unexpected response from Jenkins (HTTP ${HTTP_STATUS})."
fi

# ── Verify the job exists ─────────────────────────────────────────────
JOB_URL="${JENKINS_URL}/job/Cypress-Tests/job/Regression-Tests"
spinner_start "Verifying job exists..."
JOB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
    "${JOB_URL}/api/json") || true
spinner_stop

[ "$JOB_STATUS" = "200" ] \
    && echo -e "  ${TICK} Job found: Cypress-Tests/Regression-Tests" \
    || die "Job not found at ${JOB_URL} (HTTP ${JOB_STATUS})"

# ── Fetch crumb (CSRF token) ──────────────────────────────────────────
spinner_start "Fetching Jenkins crumb..."
COOKIE_JAR=$(mktemp /tmp/jenkins-cookies-XXXXXX.txt)
trap 'rm -f "$COOKIE_JAR"' EXIT

CRUMB_JSON=$(curl -s \
    -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
    "${JENKINS_URL}/crumbIssuer/api/json") || true
spinner_stop

CRUMB_FIELD=$(echo "$CRUMB_JSON" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print(d['crumbRequestField'])" 2>/dev/null) \
    || die "Could not parse crumb. CSRF protection may be disabled or your credentials are wrong."
CRUMB_VALUE=$(echo "$CRUMB_JSON" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print(d['crumb'])" 2>/dev/null) \
    || die "Could not parse crumb value."

echo -e "  ${TICK} CSRF crumb obtained"

# ══════════════════════════════════════════════════════════════════════
section "Triggering Build"
echo ""

TRIGGER_HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
    -H "${CRUMB_FIELD}: ${CRUMB_VALUE}" \
    -X POST "${JOB_URL}/buildWithParameters" \
    --data-urlencode "ENVIRONMENT=${CYPRESS_ENV}" \
    --data-urlencode "BROWSER=${CYPRESS_BROWSER}" \
    --data-urlencode "SUITE=${CYPRESS_SUITE}" \
    --data-urlencode "PARALLEL=${CYPRESS_PARALLEL}") || true

[ "$TRIGGER_HTTP" = "201" ] \
    || die "Failed to trigger build (HTTP ${TRIGGER_HTTP}). Check permissions."

echo -e "  ${TICK} Build queued (HTTP 201)"

# ── Wait for the build to start and get its number ────────────────────
spinner_start "Waiting for build to start..."
BUILD_NUMBER=""
for i in $(seq 1 30); do
    sleep 2
    LAST_BUILD=$(curl -s \
        -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
        "${JOB_URL}/api/json?tree=lastBuild[number,building,result]" 2>/dev/null) || true
    BN=$(echo "$LAST_BUILD" | python3 -c \
        "import sys,json; d=json.load(sys.stdin); print(d.get('lastBuild',{}).get('number',''))" 2>/dev/null) || true
    if [ -n "$BN" ] && [ "$BN" != "None" ]; then
        # Confirm it is actually this new build (building=None means queued/starting)
        BUILD_NUMBER="$BN"
        break
    fi
done
spinner_stop

[ -n "$BUILD_NUMBER" ] || die "Build did not start within 60 seconds. Check Jenkins for queue issues."

BUILD_URL="${JOB_URL}/${BUILD_NUMBER}"
echo -e "  ${TICK} Build ${BOLD}#${BUILD_NUMBER}${RESET} started"
echo -e "  ${ARROW} ${DIM}${BUILD_URL}/${RESET}"

# ══════════════════════════════════════════════════════════════════════
section "Live Build Progress"
echo ""

# ── Stream console log with byte offset ──────────────────────────────
OFFSET=0
LAST_LINE=""
DOT_COUNT=0

while true; do
    RESPONSE=$(curl -s \
        -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
        "${BUILD_URL}/logText/progressiveText?start=${OFFSET}" \
        -D /tmp/jenkins-headers.txt 2>/dev/null) || true

    # New content
    if [ -n "$RESPONSE" ]; then
        # Strip ANSI codes and print new lines since last offset
        CLEAN=$(echo "$RESPONSE" | sed 's/\x1b\[[0-9;]*[mK]//g')
        while IFS= read -r line; do
            # Only print meaningful pipeline lines to avoid noise
            if echo "$line" | grep -qE '^\[Pipeline\]|^\[20[0-9]{2}|passing|failing|All specs|ERROR|WARN|npm error|Stage |Finished:|cypress run|npm ci$'; then
                echo -e "  ${DIM}${line}${RESET}"
            fi
        done <<< "$CLEAN"
    fi

    # Update offset from X-Text-Size header
    NEW_OFFSET=$(grep -i 'x-text-size' /tmp/jenkins-headers.txt 2>/dev/null | tr -d '\r' | awk '{print $2}') || true
    [ -n "$NEW_OFFSET" ] && OFFSET="$NEW_OFFSET"

    # Check if build has finished
    BUILD_INFO=$(curl -s \
        -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
        "${BUILD_URL}/api/json?tree=building,result,duration" 2>/dev/null) || true
    BUILDING=$(echo "$BUILD_INFO" | python3 -c \
        "import sys,json; d=json.load(sys.stdin); print(d.get('building','true'))" 2>/dev/null) || true
    RESULT=$(echo "$BUILD_INFO" | python3 -c \
        "import sys,json; d=json.load(sys.stdin); print(d.get('result') or '')" 2>/dev/null) || true

    if [ "$BUILDING" = "False" ] && [ -n "$RESULT" ]; then
        break
    fi

    sleep 4
done

# ── Clean up temp files ───────────────────────────────────────────────
rm -f /tmp/jenkins-headers.txt

# ══════════════════════════════════════════════════════════════════════
section "Results"
echo ""

# Parse duration
DURATION_MS=$(echo "$BUILD_INFO" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print(d.get('duration',0))" 2>/dev/null) || DURATION_MS=0
DURATION_SEC=$(python3 -c "print(round(${DURATION_MS}/1000))" 2>/dev/null) || DURATION_SEC=0
DURATION_MIN=$(python3 -c "m,s=divmod(${DURATION_SEC},60); print(f'{m}m {s}s')" 2>/dev/null) || DURATION_MIN="${DURATION_SEC}s"

# Get test counts from console
CONSOLE=$(curl -s \
    -u "${JENKINS_USER}:${JENKINS_API_TOKEN}" \
    "${BUILD_URL}/consoleText" 2>/dev/null) || CONSOLE=""
PASSING=$(echo "$CONSOLE" | grep -oE '[0-9]+ passing' | tail -1 | grep -oE '[0-9]+' || echo "?")
FAILING=$(echo "$CONSOLE" | grep -oE '[0-9]+ failing' | tail -1 | grep -oE '[0-9]+' || echo "0")

if [ "$RESULT" = "SUCCESS" ]; then
    echo -e "  ${GREEN}${BOLD}╔══════════════════════════════════╗${RESET}"
    echo -e "  ${GREEN}${BOLD}║   BUILD PASSED                   ║${RESET}"
    echo -e "  ${GREEN}${BOLD}╚══════════════════════════════════╝${RESET}"
    echo ""
    echo -e "  ${TICK}  Suite      : ${BOLD}${CYPRESS_SUITE}${RESET} (${MODE_LABEL})"
    echo -e "  ${TICK}  Browser    : ${BOLD}${CYPRESS_BROWSER}${RESET}"
    echo -e "  ${TICK}  Tests      : ${BOLD}${PASSING} passing${RESET}, ${FAILING} failing"
    echo -e "  ${TICK}  Duration   : ${BOLD}${DURATION_MIN}${RESET}"
else
    echo -e "  ${RED}${BOLD}╔══════════════════════════════════╗${RESET}"
    echo -e "  ${RED}${BOLD}║   BUILD FAILED                   ║${RESET}"
    echo -e "  ${RED}${BOLD}╚══════════════════════════════════╝${RESET}"
    echo ""
    echo -e "  ${CROSS}  Suite      : ${BOLD}${CYPRESS_SUITE}${RESET} (${MODE_LABEL})"
    echo -e "  ${CROSS}  Browser    : ${BOLD}${CYPRESS_BROWSER}${RESET}"
    echo -e "  ${CROSS}  Tests      : ${BOLD}${PASSING} passing${RESET}, ${FAILING} failing"
    echo -e "  ${CROSS}  Duration   : ${BOLD}${DURATION_MIN}${RESET}"
fi

echo ""
echo -e "  ${ARROW} ${BOLD}Build log   :${RESET} ${BUILD_URL}/console"
echo -e "  ${ARROW} ${BOLD}HTML report :${RESET} ${BUILD_URL}/Cypress_20Mochawesome_20Report/"
echo ""

# ── Optionally open the report in the browser ─────────────────────────
if [ "$NON_INTERACTIVE" = false ]; then
    echo -ne "  Open HTML report in browser? [y/N]: "
    read -r open_browser
    if [[ "$open_browser" =~ ^[Yy] ]]; then
        REPORT_URL="${BUILD_URL}/Cypress_20Mochawesome_20Report/"
        if command -v open &>/dev/null; then
            open "$REPORT_URL"
        elif command -v xdg-open &>/dev/null; then
            xdg-open "$REPORT_URL"
        else
            echo -e "  ${YELLOW}Cannot detect browser opener. Visit the URL above manually.${RESET}"
        fi
    fi
fi

echo ""
[ "$RESULT" = "SUCCESS" ] && exit 0 || exit 1
