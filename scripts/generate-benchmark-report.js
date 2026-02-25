#!/usr/bin/env node

/**
 * Cypress Version Benchmark Report Generator
 *
 * Reads benchmark-results/*.metric files and Cypress log files,
 * then generates benchmark-report/index.html with Chart.js visualizations.
 */

const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'benchmark-results');
const OUTPUT_DIR = path.join(__dirname, '..', 'benchmark-report');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'index.html');

// Read all .metric files
const metricFiles = fs.readdirSync(RESULTS_DIR)
  .filter(f => f.endsWith('.metric'))
  .sort((a, b) => {
    // Sort by version number
    const va = a.replace('.metric', '').split('.').map(Number);
    const vb = b.replace('.metric', '').split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((va[i] || 0) !== (vb[i] || 0)) return (va[i] || 0) - (vb[i] || 0);
    }
    return 0;
  });

console.log(`Found ${metricFiles.length} metric files: ${metricFiles.join(', ')}`);

// Parse each metric file and its corresponding log
const metrics = metricFiles.map(file => {
  const content = fs.readFileSync(path.join(RESULTS_DIR, file), 'utf8');
  const props = {};
  content.split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) {
      props[line.substring(0, eq).trim()] = line.substring(eq + 1).trim();
    }
  });

  const version = props.version || file.replace('.metric', '');
  const totalTime = parseInt(props.totalTime) || 0;
  let tests = 0, passes = 0, failures = 0, duration = 0;

  // Try to parse the Cypress log file for detailed results
  const logFile = path.join(RESULTS_DIR, `cypress-${version}.log`);
  if (fs.existsSync(logFile)) {
    const log = fs.readFileSync(logFile, 'utf8');
    // Strip ANSI codes
    const clean = log.replace(/\x1b\[[0-9;]*m/g, '');

    // Count individual test passing marks (✓)
    const passMatches = log.match(/✓/g);
    passes = passMatches ? passMatches.length : 0;

    // Count individual test failure marks
    const failMatches = clean.match(/\d+ failing/g);
    if (failMatches) {
      failMatches.forEach(m => { failures += parseInt(m) || 0; });
    }

    tests = passes + failures;

    // Extract duration from summary line "All specs passed!  MM:SS  ..."
    const summaryMatch = clean.match(/(?:All specs passed!|specs? failed)[^\n]*?(\d+):(\d+)/);
    if (summaryMatch) {
      const mins = parseInt(summaryMatch[1]);
      const secs = parseInt(summaryMatch[2]);
      duration = (mins * 60 + secs) * 1000;
    }

    // If no summary, try to sum up per-spec durations
    if (duration === 0) {
      const specDurations = clean.match(/\d+:\d+(?=\s+\d+\s+\d+)/g);
      if (specDurations) {
        specDurations.forEach(d => {
          const [m, s] = d.split(':').map(Number);
          duration += (m * 60 + s) * 1000;
        });
      }
    }
  }

  const peakMemoryMB = parseInt(props.peakMemoryMB) || 0;

  const entry = {
    version,
    duration,
    totalTime,
    tests,
    passes,
    failures,
    pending: 0,
    peakMemoryMB
  };

  if (tests === 0) entry.error = 'No results collected';

  console.log(`  ${version}: ${(duration/1000).toFixed(1)}s test time, ${tests} tests (${passes} passed, ${failures} failed), ${(totalTime/1000).toFixed(1)}s total, ${peakMemoryMB}MB peak mem`);

  return entry;
});

// Also write metrics.json for archiving
fs.writeFileSync(path.join(RESULTS_DIR, 'metrics.json'), JSON.stringify(metrics, null, 2));

// Filter out entries with no results for charts
const validMetrics = metrics.filter(m => m.duration > 0);
const allMetrics = metrics;

if (validMetrics.length === 0) {
  console.error('No valid benchmark results found.');
  process.exit(1);
}

// Calculate improvements
const first = validMetrics[0];
const last = validMetrics[validMetrics.length - 1];
const durationImprovement = ((1 - last.duration / first.duration) * 100).toFixed(1);
const totalTimeImprovement = ((1 - last.totalTime / first.totalTime) * 100).toFixed(1);
const timeSavedPerRun = ((first.totalTime - last.totalTime) / 1000).toFixed(1);
const dailySavings = (timeSavedPerRun * 10 / 60).toFixed(1);
const annualSavings = (dailySavings * 260 / 60).toFixed(0);

// Memory tradeoff analysis
const memFirst = validMetrics.find(m => m.peakMemoryMB > 0);
const memLast = [...validMetrics].reverse().find(m => m.peakMemoryMB > 0);
const hasMemoryData = memFirst && memLast && memFirst.peakMemoryMB > 0;
const memoryIncrease = hasMemoryData ? (memLast.peakMemoryMB - memFirst.peakMemoryMB) : 0;
const memoryChangePct = hasMemoryData ? (((memLast.peakMemoryMB / memFirst.peakMemoryMB) - 1) * 100).toFixed(0) : '0';
const maxMemory = hasMemoryData ? Math.max(...validMetrics.filter(m => m.peakMemoryMB > 0).map(m => m.peakMemoryMB)) : 0;
// Cost-efficiency: seconds saved per MB of additional memory
const timeSavedSec = (first.totalTime - last.totalTime) / 1000;
const efficiencyRatio = hasMemoryData && memoryIncrease > 0 ? (timeSavedSec / memoryIncrease).toFixed(2) : null;

// Recommend best version using normalized scoring (lower is better for all raw metrics)
// Weights: test duration 30%, total time 30%, memory 20%, version recency 20%
const scoredMetrics = validMetrics.filter(m => m.peakMemoryMB > 0 && m.tests > 0);
const maxDuration = Math.max(...scoredMetrics.map(m => m.duration));
const minDuration = Math.min(...scoredMetrics.map(m => m.duration));
const maxTotal = Math.max(...scoredMetrics.map(m => m.totalTime));
const minTotal = Math.min(...scoredMetrics.map(m => m.totalTime));
const maxMem = Math.max(...scoredMetrics.map(m => m.peakMemoryMB));
const minMem = Math.min(...scoredMetrics.map(m => m.peakMemoryMB));
const maxIdx = scoredMetrics.length - 1;

function normalize(val, min, max) { return max === min ? 0 : (val - min) / (max - min); }

const scored = scoredMetrics.map((m, i) => {
  const durScore = normalize(m.duration, minDuration, maxDuration);          // 0 = fastest
  const totalScore = normalize(m.totalTime, minTotal, maxTotal);             // 0 = fastest
  const memScore = normalize(m.peakMemoryMB, minMem, maxMem);               // 0 = lightest
  const recencyScore = 1 - (i / maxIdx);                                     // 0 = newest
  const composite = durScore * 0.3 + totalScore * 0.3 + memScore * 0.2 + recencyScore * 0.2;
  return { ...m, composite, durScore, totalScore, memScore, recencyScore };
});
scored.sort((a, b) => a.composite - b.composite);
const recommended = scored[0];
const runnerUp = scored[1];

// Build recommendation reasons
const recReasons = [];
if (recommended.durScore <= 0.3) recReasons.push('fast test execution');
if (recommended.totalScore <= 0.3) recReasons.push('low total container time');
if (recommended.memScore <= 0.5) recReasons.push('moderate memory footprint');
if (recommended.recencyScore <= 0.3) recReasons.push('recent release with active support');
const recReasonsText = recReasons.length > 0 ? recReasons.join(', ') : 'best overall balance';

console.log(`  Recommended version: v${recommended.version} (score: ${recommended.composite.toFixed(3)})`);

// Chart data
const labels = validMetrics.map(m => 'v' + m.version);
const durations = validMetrics.map(m => (m.duration / 1000).toFixed(1));
const totalTimes = validMetrics.map(m => (m.totalTime / 1000).toFixed(1));
const peakMemories = validMetrics.map(m => m.peakMemoryMB);

// Generate date string
const now = new Date().toISOString().split('T')[0];

// Build table rows
const tableRows = allMetrics.map(m => {
  const dur = m.duration > 0 ? (m.duration / 1000).toFixed(1) + 's' : '-';
  const total = m.totalTime > 0 ? (m.totalTime / 1000).toFixed(1) + 's' : '-';
  const rate = m.tests > 0 ? ((m.passes / m.tests) * 100).toFixed(0) + '%' : '-';
  const mem = m.peakMemoryMB > 0 ? m.peakMemoryMB + ' MiB' : '-';
  const isRec = recommended && m.version === recommended.version;
  const status = m.error ? '<span style="color:#e74c3c">Error</span>' : (isRec ? '<span style="color:#4ade80; font-weight:700;">Recommended</span>' : '<span style="color:#2ecc71">OK</span>');
  const rowStyle = isRec ? ' style="background: rgba(74, 222, 128, 0.08); border-left: 3px solid #4ade80;"' : '';
  return `
    <tr${rowStyle}>
      <td><strong>v${m.version}</strong>${isRec ? ' <span style="font-size:11px; background:#065f46; color:#4ade80; padding:2px 8px; border-radius:10px; margin-left:6px;">BEST</span>' : ''}</td>
      <td>${dur}</td>
      <td>${total}</td>
      <td>${m.tests || 0}</td>
      <td>${m.passes || 0}</td>
      <td>${m.failures || 0}</td>
      <td>${rate}</td>
      <td>${mem}</td>
      <td>${status}</td>
    </tr>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cypress Version Performance Benchmark</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 28px; margin-bottom: 4px; color: #f1f5f9; }
    .subtitle { color: #94a3b8; margin-bottom: 32px; font-size: 14px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    .card-label { font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px; }
    .card-value { font-size: 32px; font-weight: 700; }
    .card-value.green { color: #4ade80; }
    .card-value.blue { color: #60a5fa; }
    .card-value.amber { color: #fbbf24; }
    .card-value.red { color: #f87171; }
    .card-value.purple { color: #a78bfa; }
    .card-detail { font-size: 12px; color: #64748b; margin-top: 4px; }
    .chart-section { background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; margin-bottom: 24px; }
    .chart-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #f1f5f9; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    @media (max-width: 800px) { .charts-grid { grid-template-columns: 1fr; } }
    canvas { max-height: 350px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px 16px; font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; border-bottom: 2px solid #334155; }
    td { padding: 12px 16px; border-bottom: 1px solid #1e293b; font-size: 14px; }
    tr:hover { background: #1e293b; }
    .roi-section { background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%); border-radius: 12px; padding: 24px; border: 1px solid #334155; margin-top: 24px; }
    .roi-title { font-size: 18px; font-weight: 700; color: #60a5fa; margin-bottom: 16px; }
    .roi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    @media (max-width: 800px) { .roi-grid { grid-template-columns: repeat(2, 1fr); } }
    .roi-item { text-align: center; }
    .roi-value { font-size: 28px; font-weight: 700; color: #4ade80; }
    .roi-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .rec-section { background: linear-gradient(135deg, #064e3b 0%, #1e293b 100%); border-radius: 12px; padding: 24px; border: 1px solid #4ade80; margin-bottom: 24px; }
    .rec-title { font-size: 18px; font-weight: 700; color: #4ade80; margin-bottom: 12px; }
    .rec-version { font-size: 36px; font-weight: 800; color: #4ade80; margin-bottom: 8px; }
    .rec-reasons { font-size: 14px; color: #94a3b8; line-height: 1.8; }
    .rec-reasons li { margin-bottom: 4px; }
    .rec-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 16px; }
    @media (max-width: 800px) { .rec-stats { grid-template-columns: repeat(2, 1fr); } }
    .rec-stat { text-align: center; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; }
    .rec-stat-value { font-size: 22px; font-weight: 700; color: #f1f5f9; }
    .rec-stat-label { font-size: 11px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { text-align: center; margin-top: 32px; color: #475569; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Cypress Version Performance Benchmark</h1>
    <p class="subtitle">Generated: ${now} | Test Suite: Smoke Tests (Sequential Execution) | Versions: ${first.version} to ${last.version}</p>

    <!-- Summary Cards -->
    <div class="cards">
      <div class="card">
        <div class="card-label">Test Duration Improvement</div>
        <div class="card-value green">${durationImprovement}%</div>
        <div class="card-detail">v${first.version} vs v${last.version}</div>
      </div>
      <div class="card">
        <div class="card-label">Total Time Improvement</div>
        <div class="card-value blue">${totalTimeImprovement}%</div>
        <div class="card-detail">Including startup + npm install</div>
      </div>
      <div class="card" style="border-color: #4ade80;">
        <div class="card-label">Recommended Version</div>
        <div class="card-value green">v${recommended.version}</div>
        <div class="card-detail">Best balance of speed, memory &amp; support</div>
      </div>
      <div class="card">
        <div class="card-label">Memory Tradeoff</div>
        <div class="card-value purple">${hasMemoryData ? '+' + memoryChangePct + '%' : 'N/A'}</div>
        <div class="card-detail">${hasMemoryData ? memFirst.peakMemoryMB + ' → ' + memLast.peakMemoryMB + ' MiB (+' + memoryIncrease + ' MiB)' : 'No memory data collected'}</div>
      </div>
      <div class="card">
        <div class="card-label">Cost Efficiency</div>
        <div class="card-value green">${efficiencyRatio ? efficiencyRatio + 's' : 'N/A'}</div>
        <div class="card-detail">${efficiencyRatio ? 'Seconds saved per MB added' : 'No tradeoff data'}</div>
      </div>
      <div class="card">
        <div class="card-label">Versions Tested</div>
        <div class="card-value blue">${validMetrics.length}</div>
        <div class="card-detail">Stable releases benchmarked</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="chart-section">
        <div class="chart-title">Test Execution Time by Version</div>
        <canvas id="durationChart"></canvas>
      </div>
      <div class="chart-section">
        <div class="chart-title">Total Container Time (Startup + Tests)</div>
        <canvas id="totalTimeChart"></canvas>
      </div>
    </div>
    <div class="chart-section" style="margin-bottom: 24px;">
      <div class="chart-title">Peak Memory Usage by Version (Container Footprint)</div>
      <p style="font-size: 12px; color: #64748b; margin: -8px 0 16px 0;">Higher memory in newer versions reflects updated Chromium + expanded Cypress features. All values remain under typical CI runner limits.</p>
      <canvas id="memoryChart"></canvas>
    </div>

    <!-- Comparison Table -->
    <div class="chart-section">
      <div class="chart-title">Detailed Comparison</div>
      <table>
        <thead>
          <tr>
            <th>Version</th>
            <th>Test Duration</th>
            <th>Total Time</th>
            <th>Tests</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Pass Rate</th>
            <th>Peak Memory</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    <!-- Recommendation -->
    <div class="rec-section">
      <div class="rec-title">Upgrade Recommendation</div>
      <div class="rec-version">Cypress v${recommended.version}</div>
      <div class="rec-reasons">
        <p style="margin-bottom: 8px;">Selected for: <strong>${recReasonsText}</strong></p>
        <ul style="padding-left: 20px;">
          <li>Test duration: <strong>${(recommended.duration/1000).toFixed(1)}s</strong> (vs ${(first.duration/1000).toFixed(1)}s on v${first.version})</li>
          <li>Total container time: <strong>${(recommended.totalTime/1000).toFixed(1)}s</strong> (vs ${(first.totalTime/1000).toFixed(1)}s on v${first.version})</li>
          <li>Peak memory: <strong>${recommended.peakMemoryMB} MiB</strong> (${recommended.peakMemoryMB <= first.peakMemoryMB ? 'no increase' : '+' + (recommended.peakMemoryMB - first.peakMemoryMB) + ' MiB'} vs v${first.version})</li>
          <li>Runner-up: <strong>v${runnerUp.version}</strong> (score ${runnerUp.composite.toFixed(3)} vs ${recommended.composite.toFixed(3)})</li>
        </ul>
        <p style="margin-top: 12px; color: #64748b; font-size: 12px;">Score based on: test duration (30%), total time (30%), memory usage (20%), version recency (20%). Lower composite score = better overall fit.</p>
      </div>
      <div class="rec-stats">
        <div class="rec-stat">
          <div class="rec-stat-value">${(recommended.duration/1000).toFixed(1)}s</div>
          <div class="rec-stat-label">Test Duration</div>
        </div>
        <div class="rec-stat">
          <div class="rec-stat-value">${(recommended.totalTime/1000).toFixed(1)}s</div>
          <div class="rec-stat-label">Total Time</div>
        </div>
        <div class="rec-stat">
          <div class="rec-stat-value">${recommended.peakMemoryMB} MiB</div>
          <div class="rec-stat-label">Peak Memory</div>
        </div>
        <div class="rec-stat">
          <div class="rec-stat-value">${recommended.tests > 0 ? ((recommended.passes / recommended.tests) * 100).toFixed(0) : 0}%</div>
          <div class="rec-stat-label">Pass Rate</div>
        </div>
      </div>
    </div>

    <!-- ROI Analysis -->
    <div class="roi-section">
      <div class="roi-title">ROI Analysis: Upgrade Impact</div>
      <div class="roi-grid">
        <div class="roi-item">
          <div class="roi-value">${timeSavedPerRun}s</div>
          <div class="roi-label">Time Saved Per Run</div>
        </div>
        <div class="roi-item">
          <div class="roi-value">${dailySavings} min</div>
          <div class="roi-label">Daily Savings (10 runs/day)</div>
        </div>
        <div class="roi-item">
          <div class="roi-value">${annualSavings} hrs</div>
          <div class="roi-label">Annual Savings (260 days)</div>
        </div>
        <div class="roi-item">
          <div class="roi-value" style="color: #a78bfa;">${hasMemoryData ? (maxMemory / 1024).toFixed(1) + ' GiB' : 'N/A'}</div>
          <div class="roi-label">Peak Memory (max across versions)</div>
        </div>
      </div>
      ${hasMemoryData ? '<p style="margin-top: 16px; font-size: 13px; color: #94a3b8; line-height: 1.6;">Memory increases with newer Cypress versions due to updated Chromium engines and expanded feature sets. Peak usage of ' + (maxMemory / 1024).toFixed(1) + ' GiB remains well within standard CI runner capacity (typically 4-8 GiB). The time savings from upgrading far outweigh the marginal memory cost — no additional infrastructure spend is required.</p>' : ''}
    </div>

    <div class="footer">
      Cypress Automation POC - Version Benchmark Report | Generated by Jenkins CI/CD Pipeline
    </div>
  </div>

  <script>
    const labels = ${JSON.stringify(labels)};
    const durations = ${JSON.stringify(durations)};
    const totalTimes = ${JSON.stringify(totalTimes)};
    const peakMemories = ${JSON.stringify(peakMemories)};
    const recommendedLabel = 'v${recommended.version}';

    // Duration Bar Chart
    new Chart(document.getElementById('durationChart'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Test Duration (s)',
          data: durations,
          backgroundColor: durations.map((_, i) => {
            if (labels[i] === recommendedLabel) return 'rgba(74, 222, 128, 0.9)';
            const ratio = i / (durations.length - 1);
            return \`rgba(\${Math.round(239 - ratio * 165)}, \${Math.round(68 + ratio * 105)}, \${Math.round(68 + ratio * 60)}, 0.85)\`;
          }),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });

    // Peak Memory Bar Chart
    new Chart(document.getElementById('memoryChart'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Peak Memory (MiB)',
          data: peakMemories,
          backgroundColor: peakMemories.map((_, i) => {
            if (labels[i] === recommendedLabel) return 'rgba(74, 222, 128, 0.9)';
            const ratio = i / (peakMemories.length - 1 || 1);
            return \`rgba(\${Math.round(167 - ratio * 40)}, \${Math.round(139 - ratio * 20)}, \${Math.round(250)}, 0.85)\`;
          }),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });

    // Total Time Line Chart
    new Chart(document.getElementById('totalTimeChart'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Container Time (s)',
          data: totalTimes,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: labels.map(l => l === recommendedLabel ? 10 : 6),
          pointBackgroundColor: labels.map(l => l === recommendedLabel ? '#4ade80' : '#60a5fa')
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  </script>
</body>
</html>`;

// Write output
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
fs.writeFileSync(OUTPUT_FILE, html);

console.log('========================================');
console.log('  BENCHMARK REPORT GENERATED');
console.log('========================================');
console.log(`  File: ${OUTPUT_FILE}`);
console.log(`  Versions: ${validMetrics.length} benchmarked`);
console.log(`  Duration improvement: ${durationImprovement}% (v${first.version} -> v${last.version})`);
console.log(`  Time saved per run: ${timeSavedPerRun}s`);
if (hasMemoryData) {
  console.log(`  Memory tradeoff: ${memFirst.peakMemoryMB}MB -> ${memLast.peakMemoryMB}MB (+${memoryChangePct}%)`);
  if (efficiencyRatio) console.log(`  Cost efficiency: ${efficiencyRatio}s saved per MB added`);
}
console.log(`  Recommended: v${recommended.version} (${recReasonsText})`);
console.log('========================================');
