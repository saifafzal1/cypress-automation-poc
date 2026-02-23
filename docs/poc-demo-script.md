# POC Demo Script

## Demo Flow (30-40 minutes)

---

### 1. Introduction (3 min)
- Show the **Architecture Diagram** (from `Cypress-Jenkins-POC-Plan.md`)
- Explain the hybrid approach: GitHub Actions (fast gate) + Jenkins (parallel regression)
- Highlight: POM pattern, Docker containerization, parallel execution

---

### 2. Code Walkthrough (5 min)

#### Page Object Model
- Open `cypress/pages/BasePage.js` — show shared methods
- Open `cypress/pages/LoginPage.js` — show inheritance, selectors, actions
- Explain how POM makes tests maintainable and reusable

#### Test Spec Example
- Open `cypress/e2e/regression/authentication/login.cy.js`
- Show how tests use page objects instead of raw selectors
- Show fixture data usage from `cypress/fixtures/users.json`

#### Suite Organization
- Show folder structure: smoke / regression (5 sub-suites) / sanity
- Explain how suites map to Jenkins parallel stages

---

### 3. Local Cypress Run (5 min)
```bash
# Open Cypress in headed mode
npm run cy:open
```
- Walk through a smoke test in the Cypress Test Runner UI
- Show real-time test execution with DOM snapshots
- Show time-travel debugging capability

---

### 4. Docker Run (3 min)
```bash
# Run tests inside Docker container
docker compose up --abort-on-container-exit --exit-code-from cypress
```
- Show how the same tests run in a containerized environment
- Show volume-mounted report output

---

### 5. GitHub Actions — PR Workflow (5 min)

#### Create a feature branch and PR
```bash
git checkout -b feature/demo-test
# Make a small change to a test file
git add . && git commit -m "Demo: trigger smoke tests"
git push origin feature/demo-test
```
- Create a PR on GitHub
- Watch GitHub Actions trigger the **Cypress Smoke Tests** workflow
- Show the PR status check (green/red)
- Show the PR comment with test summary table
- Show downloadable artifacts (Mochawesome report, screenshots, videos)

---

### 6. Jenkins — Sequential vs Parallel (10 min)

#### Sequential Run
1. Open Jenkins at http://localhost:8080
2. Go to **Cypress-Parameterized** job
3. Click **Build with Parameters**:
   - Environment: `staging`
   - Browser: `chrome`
   - Suite: `regression`
   - Parallel: **unchecked** (false)
4. Watch the pipeline execute sequentially
5. **Note the total execution time**: ~20 minutes

#### Parallel Run
1. Trigger the same job again with:
   - Parallel: **checked** (true)
2. Watch 5 parallel stages execute simultaneously in Stage View
3. **Note the total execution time**: ~7 minutes
4. **Show the improvement**: ~65-70% reduction

#### Show Results
- Click **Cypress Mochawesome Report** in the sidebar
- Show the consolidated HTML report from all parallel stages
- Show archived videos and screenshots
- Show build history trend

---

### 7. Jenkins — Nightly Cron (2 min)
- Show the `Cypress-Nightly` job configuration
- Show the cron schedule: `H 0 * * *` (midnight daily)
- Explain how it runs full regression automatically

---

### 8. Jenkins — Parameterized Job (2 min)
- Show the parameter form: environment, browser, suite, parallel toggle
- Explain how QA can trigger targeted test runs on-demand

---

### 9. Reporting Dashboard (3 min)
- Open Mochawesome HTML report — show charts, test details, screenshots
- Show how screenshots are embedded inline on failure
- Show where reports are accessible:
  - Jenkins UI (HTML Publisher)
  - GitHub Actions artifacts
  - GitHub Pages (optional)

---

### 10. Q&A (5 min)
- Address questions about scaling, maintenance, and production rollout

---

## Key Talking Points

### Why Cypress over Selenium?
| Feature | Cypress | Selenium |
|---|---|---|
| Setup complexity | Simple (npm install) | Complex (drivers, grid) |
| Speed | Fast (in-browser execution) | Slower (WebDriver protocol) |
| Debugging | Time-travel, DOM snapshots | Limited |
| Auto-waits | Built-in | Manual waits needed |
| API testing | Built-in (cy.request) | Separate tool needed |
| Docker support | Official images | Manual setup |

### Why Cypress over Playwright?
| Feature | Cypress | Playwright |
|---|---|---|
| Learning curve | Gentle | Moderate |
| Community | Larger ecosystem | Growing |
| Reporting | Rich (Mochawesome) | Basic (built-in) |
| CI integration | Official GitHub Action | Manual setup |
| Real-time UI | Cypress Test Runner | Trace Viewer (post-run) |

### Why Hybrid (GitHub Actions + Jenkins)?
| Aspect | GitHub Actions | Jenkins |
|---|---|---|
| Best for | Quick PR feedback | Heavy regression |
| Cost | Per-minute billing | Self-hosted (free) |
| Parallelism | Matrix strategy | Native parallel stages |
| Dashboard | Basic artifacts | Rich HTML Publisher |
| Customization | YAML-based | Groovy pipeline (flexible) |
| Infrastructure | GitHub-managed | Self-managed (full control) |

---

## Demo Checklist

### Before the Demo
- [ ] Application under test is running and accessible
- [ ] Jenkins is up and configured (all 4 jobs created)
- [ ] GitHub Actions workflows are active
- [ ] Docker Desktop is running
- [ ] Terminal is open with project directory
- [ ] Browser tabs ready: GitHub repo, Jenkins dashboard, app under test

### During the Demo
- [ ] Show POM code walkthrough
- [ ] Run Cypress locally (headed mode)
- [ ] Run Docker-based execution
- [ ] Create PR and show GitHub Actions
- [ ] Show Jenkins sequential run
- [ ] Show Jenkins parallel run
- [ ] Show time comparison (sequential vs parallel)
- [ ] Show Mochawesome report
- [ ] Show nightly cron and parameterized job

### Metrics to Capture
- [ ] Smoke suite execution time
- [ ] Sequential regression time
- [ ] Parallel regression time
- [ ] Percentage improvement
- [ ] Number of test cases
- [ ] Report generation time
