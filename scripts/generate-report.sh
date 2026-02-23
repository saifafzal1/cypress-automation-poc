#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Mochawesome Report Generator
# Merges all JSON files from parallel/sequential runs into a
# single consolidated HTML report.
#
# Usage:
#   ./scripts/generate-report.sh                  # default dirs
#   ./scripts/generate-report.sh <input> <output>  # custom dirs
# ─────────────────────────────────────────────────────────────────

INPUT_DIR="${1:-mochawesome-temp}"
OUTPUT_DIR="${2:-mochawesome-report}"

echo "═══════════════════════════════════════════════"
echo "  Mochawesome Report Generator"
echo "═══════════════════════════════════════════════"
echo "  Input:  ${INPUT_DIR}"
echo "  Output: ${OUTPUT_DIR}"
echo ""

# Check if JSON files exist
JSON_COUNT=$(find "${INPUT_DIR}" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')

if [ "${JSON_COUNT}" -eq 0 ]; then
    echo "❌ No JSON files found in ${INPUT_DIR}"
    echo "   Make sure Cypress tests ran with mochawesome reporter."
    exit 1
fi

echo "📄 Found ${JSON_COUNT} JSON report file(s)"

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Merge all JSON files
echo "🔗 Merging JSON files..."
npx mochawesome-merge "${INPUT_DIR}/**/*.json" "${INPUT_DIR}/*.json" \
    -o "${OUTPUT_DIR}/merged.json" 2>/dev/null || \
npx mochawesome-merge "${INPUT_DIR}/*.json" \
    -o "${OUTPUT_DIR}/merged.json"

if [ $? -ne 0 ]; then
    echo "❌ Failed to merge JSON files"
    exit 1
fi

# Generate HTML report
echo "📊 Generating HTML report..."
npx marge "${OUTPUT_DIR}/merged.json" \
    -f report \
    -o "${OUTPUT_DIR}" \
    --charts true \
    --showPassed true \
    --showFailed true \
    --showPending true \
    --showSkipped true \
    --showHooks failed

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate HTML report"
    exit 1
fi

echo ""
echo "✅ Report generated successfully!"
echo "   📂 ${OUTPUT_DIR}/report.html"
echo ""

# Print summary from merged JSON
node -e "
const r = require('./${OUTPUT_DIR}/merged.json');
const s = r.stats;
console.log('═══════════════════════════════════════════════');
console.log('  TEST RESULTS SUMMARY');
console.log('═══════════════════════════════════════════════');
console.log('  Total:    ' + s.tests);
console.log('  Passed:   ' + s.passes + ' ✅');
console.log('  Failed:   ' + s.failures + ' ❌');
console.log('  Pending:  ' + s.pending + ' ⏳');
console.log('  Duration: ' + (s.duration / 1000).toFixed(1) + 's');
console.log('═══════════════════════════════════════════════');
" 2>/dev/null || true
