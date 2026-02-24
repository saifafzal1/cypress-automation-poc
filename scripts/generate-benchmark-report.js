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

  const entry = {
    version,
    duration,
    totalTime,
    tests,
    passes,
    failures,
    pending: 0
  };

  if (tests === 0) entry.error = 'No results collected';

  console.log(`  ${version}: ${(duration/1000).toFixed(1)}s test time, ${tests} tests (${passes} passed, ${failures} failed), ${(totalTime/1000).toFixed(1)}s total`);

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

// Chart data
const labels = validMetrics.map(m => 'v' + m.version);
const durations = validMetrics.map(m => (m.duration / 1000).toFixed(1));
const totalTimes = validMetrics.map(m => (m.totalTime / 1000).toFixed(1));

// Generate date string
const now = new Date().toISOString().split('T')[0];

// Build table rows
const tableRows = allMetrics.map(m => {
  const dur = m.duration > 0 ? (m.duration / 1000).toFixed(1) + 's' : '-';
  const total = m.totalTime > 0 ? (m.totalTime / 1000).toFixed(1) + 's' : '-';
  const rate = m.tests > 0 ? ((m.passes / m.tests) * 100).toFixed(0) + '%' : '-';
  const status = m.error ? '<span style="color:#e74c3c">Error</span>' : '<span style="color:#2ecc71">OK</span>';
  return `
    <tr>
      <td><strong>v${m.version}</strong></td>
      <td>${dur}</td>
      <td>${total}</td>
      <td>${m.tests || 0}</td>
      <td>${m.passes || 0}</td>
      <td>${m.failures || 0}</td>
      <td>${rate}</td>
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
    .roi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .roi-item { text-align: center; }
    .roi-value { font-size: 28px; font-weight: 700; color: #4ade80; }
    .roi-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
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
      <div class="card">
        <div class="card-label">Fastest Version</div>
        <div class="card-value amber">v${last.version}</div>
        <div class="card-detail">${(last.duration/1000).toFixed(1)}s test duration</div>
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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
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
      </div>
    </div>

    <div class="footer">
      Cypress Automation POC - Version Benchmark Report | Generated by Jenkins CI/CD Pipeline
    </div>
  </div>

  <script>
    const labels = ${JSON.stringify(labels)};
    const durations = ${JSON.stringify(durations)};
    const totalTimes = ${JSON.stringify(totalTimes)};

    // Duration Bar Chart
    new Chart(document.getElementById('durationChart'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Test Duration (s)',
          data: durations,
          backgroundColor: durations.map((_, i) => {
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
          pointRadius: 6,
          pointBackgroundColor: '#60a5fa'
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
console.log('========================================');
