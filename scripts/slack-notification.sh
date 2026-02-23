#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Slack Notification Script for Cypress Test Results
#
# Usage:
#   ./scripts/slack-notification.sh <webhook_url> <status> <suite> <env> <build_url>
#
# Example:
#   ./scripts/slack-notification.sh https://hooks.slack.com/xxx PASSED regression staging http://jenkins:8080/job/1
# ─────────────────────────────────────────────────────────────────

WEBHOOK_URL="${1}"
STATUS="${2:-UNKNOWN}"
SUITE="${3:-regression}"
ENVIRONMENT="${4:-dev}"
BUILD_URL="${5:-#}"

if [ -z "${WEBHOOK_URL}" ]; then
    echo "⚠️  No Slack webhook URL provided. Skipping notification."
    exit 0
fi

# Parse report summary if available
TOTAL="N/A"
PASSED="N/A"
FAILED="N/A"
DURATION="N/A"

if [ -f "mochawesome-report/merged.json" ]; then
    TOTAL=$(node -e "const r=require('./mochawesome-report/merged.json');console.log(r.stats.tests)" 2>/dev/null || echo "N/A")
    PASSED=$(node -e "const r=require('./mochawesome-report/merged.json');console.log(r.stats.passes)" 2>/dev/null || echo "N/A")
    FAILED=$(node -e "const r=require('./mochawesome-report/merged.json');console.log(r.stats.failures)" 2>/dev/null || echo "N/A")
    DURATION=$(node -e "const r=require('./mochawesome-report/merged.json');console.log((r.stats.duration/1000).toFixed(1)+'s')" 2>/dev/null || echo "N/A")
fi

# Set emoji and color based on status
if [ "${STATUS}" = "PASSED" ]; then
    EMOJI="✅"
    COLOR="#36a64f"
else
    EMOJI="❌"
    COLOR="#dc3545"
fi

# Send Slack notification
curl -s -X POST "${WEBHOOK_URL}" \
    -H 'Content-type: application/json' \
    -d "{
        \"attachments\": [
            {
                \"color\": \"${COLOR}\",
                \"blocks\": [
                    {
                        \"type\": \"header\",
                        \"text\": {
                            \"type\": \"plain_text\",
                            \"text\": \"${EMOJI} Cypress ${SUITE} Tests ${STATUS}\"
                        }
                    },
                    {
                        \"type\": \"section\",
                        \"fields\": [
                            {\"type\": \"mrkdwn\", \"text\": \"*Suite:*\n${SUITE}\"},
                            {\"type\": \"mrkdwn\", \"text\": \"*Environment:*\n${ENVIRONMENT}\"},
                            {\"type\": \"mrkdwn\", \"text\": \"*Total Tests:*\n${TOTAL}\"},
                            {\"type\": \"mrkdwn\", \"text\": \"*Passed:*\n${PASSED}\"},
                            {\"type\": \"mrkdwn\", \"text\": \"*Failed:*\n${FAILED}\"},
                            {\"type\": \"mrkdwn\", \"text\": \"*Duration:*\n${DURATION}\"}
                        ]
                    },
                    {
                        \"type\": \"actions\",
                        \"elements\": [
                            {
                                \"type\": \"button\",
                                \"text\": {\"type\": \"plain_text\", \"text\": \"View Build\"},
                                \"url\": \"${BUILD_URL}\"
                            }
                        ]
                    }
                ]
            }
        ]
    }"

echo ""
echo "📨 Slack notification sent (${STATUS})"
