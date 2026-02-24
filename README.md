# Cypress Automation POC

> **Cypress 15 + Page Object Model + Docker + Jenkins (Parallel) + GitHub Actions**
>
> Testing against [CURA Healthcare Service](https://katalon-demo-cura.herokuapp.com/)

[![Cypress Smoke Tests](https://github.com/saifafzal1/cypress-automation-poc/actions/workflows/cypress-smoke.yml/badge.svg)](https://github.com/saifafzal1/cypress-automation-poc/actions/workflows/cypress-smoke.yml)

---

## Architecture

```
Developer → Git Push → GitHub
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       GitHub Actions            Jenkins
       (Smoke / PR Gate)    (Regression / Nightly)
              │                     │
       Docker Container       5 Parallel Docker Containers
       Cypress Smoke Specs    Cypress Regression Suites
              │                     │
       PR Status + Artifacts   HTML Report Dashboard
              │                     │
              └──────────┬──────────┘
                         ▼
                 Mochawesome HTML Report
                 Slack / Email Alerts
```

---

## Application Under Test

| Detail | Value |
|---|---|
| **App** | CURA Healthcare Service |
| **URL** | https://katalon-demo-cura.herokuapp.com/ |
| **Demo Username** | `John Doe` |
| **Demo Password** | `ThisIsNotAPassword` |
| **Pages** | Homepage, Login, Make Appointment, Confirmation, History |

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| **Cypress** | 15.x | E2E test automation framework |
| **Node.js** | 20.x (via nvm) | Runtime |
| **Docker** | Latest | Containerized test execution |
| **Jenkins** | LTS | Parallel regression, nightly runs, parameterized jobs |
| **GitHub Actions** | v4 | PR smoke gate, Docker-based runs |
| **Mochawesome** | 7.x | HTML test reports |
| **Page Object Model** | — | Test architecture pattern |

---

## Project Structure

```
├── .github/workflows/
│   ├── cypress-smoke.yml          # PR smoke gate
│   ├── cypress-docker.yml         # Docker-based manual run
│   └── deploy-report.yml          # GitHub Pages report deployment
├── cypress/
│   ├── e2e/
│   │   ├── smoke/                 # 3 specs — login, homepage, navigation
│   │   ├── regression/
│   │   │   ├── authentication/    # 4 specs — login, logout, validation, session
│   │   │   ├── appointment/       # 4 specs — booking, facility, date, form validation
│   │   │   ├── confirmation/      # 3 specs — confirmation, details, booking flow
│   │   │   ├── history/           # 3 specs — history, navigation, records
│   │   │   └── api-validation/    # 2 specs — HTTP responses & content validation
│   │   └── sanity/                # 2 specs — health check, critical path
│   ├── pages/                     # Page Object classes (6 files)
│   ├── fixtures/                  # Test data (4 JSON files)
│   └── support/                   # Custom commands + setup
├── scripts/
│   ├── generate-report.sh         # Report merge + generation helper
│   ├── slack-notification.sh      # Slack notification script
│   └── email-notification.html    # Email template
├── cypress.config.js
├── Dockerfile                     # cypress/included:15.3.0
├── docker-compose.yml             # Cypress + 5 parallel runners
├── Jenkinsfile                    # Parallel regression pipeline
├── Jenkinsfile.docker             # Docker-based pipeline
├── jenkins-setup-guide.md         # Step-by-step Jenkins setup
├── Cypress-Jenkins-POC-Plan.md    # Full POC plan document
├── .nvmrc                         # Node version lock (20)
└── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 20+ (via nvm)
- Docker Desktop
- Git

### Local Setup
```bash
# Clone the repo
git clone https://github.com/saifafzal1/cypress-automation-poc.git
cd cypress-automation-poc

# Use correct Node version
nvm use

# Install dependencies
npm ci

# Open Cypress UI
npm run cy:open

# Run smoke tests
npm run cy:smoke

# Run full regression
npm run cy:regression

# Generate report
npm run report:full
```

### Docker Run
```bash
# Build image
docker build -t cypress-tests .

# Run all tests (sequential)
docker compose up --abort-on-container-exit --exit-code-from cypress

# Run 5 regression suites in parallel
docker compose --profile parallel up --abort-on-container-exit
```

---

## Test Suites

| Suite | Specs | Tests | Run Time | Command |
|---|---|---|---|---|
| **Smoke** | 3 | ~9 | ~2 min | `npm run cy:smoke` |
| **Sanity** | 2 | ~5 | ~1 min | `npm run cy:sanity` |
| **Regression — Auth** | 4 | ~19 | ~4 min | `npm run cy:regression:auth` |
| **Regression — Appointment** | 4 | ~18 | ~5 min | `npm run cy:regression:appointment` |
| **Regression — Confirmation** | 3 | ~11 | ~4 min | `npm run cy:regression:confirmation` |
| **Regression — History** | 3 | ~10 | ~3 min | `npm run cy:regression:history` |
| **Regression — API** | 2 | ~11 | ~2 min | `npm run cy:regression:api` |
| **Full Regression** | 16 | ~69 | ~18 min | `npm run cy:regression` |
| **All** | 21 | ~83 | ~21 min | `npm run cy:all` |

---

## Page Object Model

```
BasePage (shared methods: visit, getElement, clickElement, typeText, verifyUrl, ...)
  ├── LoginPage         — login form, credentials, error handling
  ├── HomePage          — hero section, Make Appointment button, sidebar nav
  ├── AppointmentPage   — facility, program, date, readmission, comment, booking
  ├── ConfirmationPage  — appointment details verification
  └── HistoryPage       — appointment history records
```

Each page object encapsulates:
- **Selectors** — `#id` based element locators matching the CURA app
- **Actions** — methods like `login()`, `bookAppointment()`, `selectFacility()`
- **Assertions** — methods like `verifyConfirmationPageLoaded()`, `verifyErrorVisible()`

---

## CI/CD Pipeline

### GitHub Actions (Fast Feedback)

| Workflow | Trigger | Duration | Purpose |
|---|---|---|---|
| `cypress-smoke.yml` | PR / push to develop | ~2-5 min | PR gate — blocks merge if smoke fails |
| `cypress-docker.yml` | Manual | ~10-30 min | Docker-based run with suite selector |
| `deploy-report.yml` | Manual | ~15 min | Deploy Mochawesome report to GitHub Pages |

### Jenkins (Regression Engine)

| Job | Trigger | Duration | Purpose |
|---|---|---|---|
| `Cypress-Parallel-Regression` | Webhook (merge to main) | ~7 min | Auto-trigger parallel regression |
| `Cypress-Nightly` | Cron (midnight) | ~7 min | Full parallel regression daily |
| `Cypress-Parameterized` | Manual | Varies | Pick env / browser / suite / parallel |
| `Cypress-Docker-Pipeline` | Manual | Varies | Fully Docker-based execution |

---

## Parallel Execution (Jenkins)

### How It Works
Jenkins splits the 5 regression sub-suites across **parallel stages**, each running in its own Docker container:

```
Checkout → Install → ┌─ Auth Tests (4 min) ──────────┐ → Merge → Report
                      ├─ Appointment Tests (5 min) ───┤
                      ├─ Confirmation Tests (4 min) ───┤
                      ├─ History Tests (3 min) ────────┤
                      └─ API Tests (2 min) ────────────┘
```

### Performance Comparison

| Mode | Total Time | Containers |
|---|---|---|
| **Sequential** | ~18 min | 1 |
| **Parallel** | ~6 min | 5 |
| **Improvement** | **~65-70% faster** | — |

---

## Reporting

### Mochawesome HTML Report
- Consolidated from all parallel stages into a single HTML report
- Screenshots embedded inline on failure
- Videos archived as separate artifacts
- Available in: Jenkins UI (HTML Publisher), GitHub Actions artifacts, GitHub Pages

### Notifications
- **Slack**: `#qa-automation` channel — pass/fail with test summary
- **Email**: HTML template with metrics table and build link

---

## Jenkins Setup

See [jenkins-setup-guide.md](jenkins-setup-guide.md) for complete instructions:
1. Install Jenkins via Docker
2. Install required plugins
3. Configure Node.js 20 tool
4. Add credentials
5. Create 4 pipeline jobs
6. Configure GitHub webhook

---

## NPM Scripts Reference

| Script | Description |
|---|---|
| `cy:open` | Open Cypress UI (headed mode) |
| `cy:smoke` | Run smoke suite |
| `cy:sanity` | Run sanity suite |
| `cy:regression` | Run full regression |
| `cy:regression:auth` | Run authentication tests only |
| `cy:regression:appointment` | Run appointment tests only |
| `cy:regression:confirmation` | Run confirmation tests only |
| `cy:regression:history` | Run history tests only |
| `cy:regression:api` | Run API validation tests only |
| `cy:all` | Run all tests |
| `report` | Merge + generate Mochawesome HTML |
| `report:full` | Full report generation with summary |
| `report:clean` | Clean previous report files |
