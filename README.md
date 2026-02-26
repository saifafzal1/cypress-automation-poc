# Cypress Automation POC

> **Cypress 15 + Page Object Model + Docker + Jenkins (Parallel) + GitHub Actions**
>
> Testing against [CURA Healthcare Service](https://katalon-demo-cura.herokuapp.com/) and [TodoMVC React](https://todomvc.com/examples/react/dist/)

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
       Docker Container       6 Parallel Docker Containers
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

## Applications Under Test

| App | URL | Purpose |
|---|---|---|
| **CURA Healthcare** | https://katalon-demo-cura.herokuapp.com/ | Primary app — authentication, appointments, history, API |
| **TodoMVC React** | https://todomvc.com/examples/react/dist/ | Secondary app — CRUD, filtering, bulk operations, edge cases |

### CURA Healthcare Credentials

| Detail | Value |
|---|---|
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
│   │   ├── sanity/                # 2 specs — health check, critical path
│   │   └── todo-app/
│   │       ├── smoke/             # 4 specs — add, complete, delete, filter
│   │       └── regression/
│   │           ├── crud/          # 3 specs — add, edit, delete
│   │           ├── filtering/     # 3 specs — all, active, completed
│   │           ├── bulk-operations/ # 2 specs — toggle-all, clear-completed
│   │           ├── persistence/   # 1 spec  — state persistence
│   │           └── edge-cases/    # 1 spec  — input validation & edge cases
│   ├── pages/                     # Page Object classes (7 files)
│   ├── fixtures/                  # Test data (5 JSON files)
│   └── support/                   # Custom commands + setup
├── scripts/
│   ├── generate-report.sh         # Report merge + generation helper
│   ├── slack-notification.sh      # Slack notification script
│   └── email-notification.html    # Email template
├── setup.sh                       # One-command setup (macOS/Linux)
├── setup.bat                      # One-command setup (Windows)
├── cypress.config.js
├── Dockerfile                     # cypress/included:15.3.0
├── docker-compose.yml             # Cypress + 6 parallel runners
├── Jenkinsfile                    # Parallel regression pipeline
├── Jenkinsfile.docker             # Docker-based pipeline
├── jenkins-setup-guide.md         # Step-by-step Jenkins setup
├── Cypress-Jenkins-POC-Plan.md    # Full POC plan document
├── .nvmrc                         # Node version lock (20)
└── package.json
```

---

## Quick Start

### One-Command Setup (Recommended)

The fastest way to get Jenkins + all pipelines running. Only **Docker** and **Git** are required — no Node.js needed on the host.

**macOS / Linux:**
```bash
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

The script will:
1. Check prerequisites (Git, Docker, Docker Compose)
2. Clone the repository (if not already cloned)
3. Build and start Jenkins via Docker Compose
4. Poll until Jenkins is ready (up to 3 minutes)
5. Open `http://localhost:8080` in your browser

**Credentials:** `admin` / `admin123`

**Pre-configured jobs** appear under the `Cypress-Tests` folder:
- `Cypress-Tests/Smoke-Tests`
- `Cypress-Tests/Regression-Tests`
- `Cypress-Tests/Docker-Pipeline`
- `Cypress-Tests/Version-Benchmark`

### Prerequisites (manual setup)
- Node.js 20+ (via nvm)
- Docker Desktop
- Git

### Local Setup (manual)
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

# Run 6 regression suites in parallel (including TodoMVC)
docker compose --profile parallel up --abort-on-container-exit
```

---

## Test Suites

### CURA Healthcare

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

### TodoMVC React

| Suite | Specs | Tests | Run Time | Command |
|---|---|---|---|---|
| **Todo — Smoke** | 4 | 12 | ~22s | `npm run cy:todo:smoke` |
| **Todo — Regression (CRUD)** | 3 | 14 | ~25s | `npm run cy:todo:regression:crud` |
| **Todo — Regression (Filtering)** | 3 | 9 | ~18s | `npm run cy:todo:regression:filtering` |
| **Todo — Regression (Bulk Ops)** | 2 | 7 | ~14s | `npm run cy:todo:regression:bulk` |
| **Todo — Regression (Persistence)** | 1 | 5 | ~11s | `npm run cy:todo:regression:persistence` |
| **Todo — Regression (Edge Cases)** | 1 | 8 | ~10s | `npm run cy:todo:regression:edge` |
| **Todo — Full Regression** | 10 | 43 | ~1.5 min | `npm run cy:todo:regression` |
| **Todo — All** | 14 | 55 | ~2 min | `npm run cy:todo:all` |

### Combined

| Suite | Specs | Tests | Command |
|---|---|---|---|
| **All** | 35 | 138 | `npm run cy:all` |

---

## Page Object Model

```
BasePage (shared methods: visit, getElement, clickElement, typeText, verifyUrl, ...)
  ├── LoginPage         — login form, credentials, error handling
  ├── HomePage          — hero section, Make Appointment button, sidebar nav
  ├── AppointmentPage   — facility, program, date, readmission, comment, booking
  ├── ConfirmationPage  — appointment details verification
  ├── HistoryPage       — appointment history records
  └── TodoPage          — TodoMVC CRUD, filtering, bulk operations, verification
```

Each page object encapsulates:
- **Selectors** — element locators matching each application's DOM
- **Actions** — methods like `login()`, `bookAppointment()`, `addTodo()`, `editTodo()`
- **Assertions** — methods like `verifyConfirmationPageLoaded()`, `verifyTodoCount()`

> **Note:** `TodoPage` uses `cy.visit()` with the full TodoMVC URL directly, bypassing the CURA `baseUrl` — no config changes needed.

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
| `Cypress-Tests/Smoke-Tests` | Manual / Webhook | ~2 min | Quick smoke validation |
| `Cypress-Tests/Regression-Tests` | Webhook (merge to main) | ~7 min | Parallel regression across 6 suites |
| `Cypress-Tests/Docker-Pipeline` | Manual | Varies | Fully Docker-based execution |
| `Cypress-Tests/Version-Benchmark` | Manual | Varies | Cypress version comparison benchmarks |

---

## Parallel Execution (Jenkins)

### How It Works
Jenkins splits the 6 regression sub-suites across **parallel stages**, each running in its own Docker container:

```
Checkout → Install → ┌─ Auth Tests (4 min) ──────────┐ → Merge → Report
                      ├─ Appointment Tests (5 min) ───┤
                      ├─ Confirmation Tests (4 min) ───┤
                      ├─ History Tests (3 min) ────────┤
                      ├─ API Tests (2 min) ────────────┤
                      └─ TodoMVC Tests (2 min) ────────┘
```

### Performance Comparison

| Mode | Total Time | Containers |
|---|---|---|
| **Sequential** | ~20 min | 1 |
| **Parallel** | ~6 min | 6 |
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

**Automated:** Run `./setup.sh` (macOS/Linux) or `setup.bat` (Windows) — this handles everything including Docker build, Jenkins readiness polling, and pre-configured jobs via JCasC.

**Manual / Customization:** See [jenkins-setup-guide.md](jenkins-setup-guide.md) for step-by-step instructions:
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
| `cy:todo:smoke` | Run TodoMVC smoke tests |
| `cy:todo:regression` | Run TodoMVC full regression |
| `cy:todo:regression:crud` | Run TodoMVC CRUD tests only |
| `cy:todo:regression:filtering` | Run TodoMVC filtering tests only |
| `cy:todo:regression:persistence` | Run TodoMVC persistence tests only |
| `cy:todo:regression:bulk` | Run TodoMVC bulk operation tests only |
| `cy:todo:regression:edge` | Run TodoMVC edge case tests only |
| `cy:todo:all` | Run all TodoMVC tests |
| `cy:all` | Run all tests (CURA + TodoMVC) |
| `report` | Merge + generate Mochawesome HTML |
| `report:full` | Full report generation with summary |
| `report:clean` | Clean previous report files |
