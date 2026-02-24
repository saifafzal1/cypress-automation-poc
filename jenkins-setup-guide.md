# Jenkins Setup Guide - Quick Start

## Prerequisites
- Docker Desktop installed and running

## 1. Start Jenkins (One Command)

```bash
docker-compose up -d jenkins
```

Wait ~90 seconds for Jenkins to fully start. You can check progress with:
```bash
docker-compose logs -f jenkins
```

Look for: `Jenkins is fully up and running`

## 2. Access Jenkins

1. Open **http://localhost:8080** in your browser
2. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`

## 3. Run Tests

1. Click the **Cypress-Tests** folder on the dashboard
2. You'll see 3 pre-configured jobs:

| Job | Description | Jenkinsfile |
|-----|-------------|-------------|
| **Smoke-Tests** | Quick validation of core flows | `Jenkinsfile` |
| **Regression-Tests** | Full suite with parallel support | `Jenkinsfile` |
| **Docker-Pipeline** | Docker-based test execution | `Jenkinsfile.docker` |

3. Click on a job (e.g., **Smoke-Tests**)
4. Click **Build with Parameters** in the left sidebar
5. Select your options and click **Build**

## 4. View Results

After a build completes:
1. Click the build number (e.g., **#1**) in Build History
2. **Console Output** — full test execution logs
3. **Cypress Mochawesome Report** — HTML test report (left sidebar)
4. **Pipeline Steps** — stage-by-stage breakdown

## 5. Job Parameters

### Smoke-Tests
| Parameter | Options | Default |
|-----------|---------|---------|
| ENVIRONMENT | dev, staging, prod | dev |
| BROWSER | chrome, firefox, electron | chrome |
| SUITE | smoke | smoke |

### Regression-Tests
| Parameter | Options | Default |
|-----------|---------|---------|
| ENVIRONMENT | dev, staging, prod | dev |
| BROWSER | chrome, firefox, electron | chrome |
| SUITE | regression, smoke, sanity, all | regression |
| PARALLEL | true / false | true |

### Docker-Pipeline
| Parameter | Options | Default |
|-----------|---------|---------|
| ENVIRONMENT | dev, staging, prod | dev |
| SUITE | regression, smoke, sanity, all | regression |
| PARALLEL | true / false | true |

## 6. What's Pre-configured

Jenkins comes ready with:
- **NodeJS 20** tool (auto-installed on first job run)
- **Docker CLI** for running Cypress containers
- **HTML Publisher** for Mochawesome reports
- **Pipeline** plugins for Jenkinsfile support
- All jobs pointing to `https://github.com/saifafzal1/cypress-automation-poc.git`

## 7. Manage Jenkins

### Stop Jenkins
```bash
docker-compose stop jenkins
```

### Restart Jenkins
```bash
docker-compose restart jenkins
```

### Reset Jenkins (fresh start)
```bash
docker-compose down
docker volume rm "cleo-jenkins-research_jenkins_home"
docker-compose up -d jenkins
```

### Rebuild Jenkins image (after config changes)
```bash
docker-compose up -d --build jenkins
```

## 8. Custom Admin Password

Create a `.env` file in the project root:
```bash
JENKINS_ADMIN_PASSWORD=your-secure-password
```

Then restart Jenkins:
```bash
docker-compose up -d --build jenkins
```

## 9. Troubleshooting

### Jenkins not starting?
```bash
docker-compose logs jenkins        # Check error logs
lsof -i :8080                      # Check if port is in use
```

### Docker permission issues?
Ensure Docker Desktop is running. The Jenkins container needs access to the Docker socket.

### NodeJS tool not found during build?
The first build will auto-download NodeJS 20. This takes ~30 seconds extra on the first run.

### Jobs not visible?
Check JCasC loaded correctly:
```bash
docker-compose logs jenkins | grep -i "casc"
```
