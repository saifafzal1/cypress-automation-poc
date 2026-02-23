# Jenkins Setup Guide for Cypress POC

## 1. Install Jenkins via Docker

```bash
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins \
  jenkins/jenkins:lts
```

> **Note**: Mounting `/var/run/docker.sock` allows Jenkins to spin up Docker containers for parallel test execution.

### Get initial admin password:
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Open http://localhost:8080 and complete the setup wizard.

---

## 2. Install Required Plugins

Go to **Manage Jenkins > Plugins > Available Plugins** and install:

| Plugin | Purpose |
|---|---|
| **NodeJS Plugin** | Manage Node.js installations |
| **Docker Pipeline Plugin** | Run stages inside Docker containers |
| **Git Plugin** | Pull code from GitHub |
| **HTML Publisher Plugin** | Display Mochawesome reports in Jenkins UI |
| **GitHub Plugin** | Webhook integration |
| **Slack Notification Plugin** | Alerts on failure (optional) |

Restart Jenkins after installation.

---

## 3. Global Tool Configuration

Go to **Manage Jenkins > Tools**:

### NodeJS
- Click **Add NodeJS**
- Name: `NodeJS-20`
- Version: `NodeJS 20.x` (must match `.nvmrc`)
- Install automatically: checked

---

## 4. Add Credentials

Go to **Manage Jenkins > Credentials > System > Global credentials**:

| ID | Type | Value |
|---|---|---|
| `CYPRESS_BASE_URL` | Secret text | `http://your-app-url:3000` |
| `CYPRESS_USERNAME` | Secret text | `admin` |
| `CYPRESS_PASSWORD` | Secret text | `Admin@123` |
| `github-pat` | Username with password | GitHub username + PAT token |

---

## 5. Create Jenkins Jobs

### Job 1: Cypress-Parallel-Regression (Auto on merge to main)

1. **New Item** > **Pipeline** > Name: `Cypress-Parallel-Regression`
2. **Build Triggers**:
   - Check **GitHub hook trigger for GITScm polling**
3. **Pipeline**:
   - Definition: **Pipeline script from SCM**
   - SCM: Git
   - Repository URL: `https://github.com/saifafzal1/cypress-automation-poc.git`
   - Credentials: `github-pat`
   - Branches: `*/main`
   - Script Path: `Jenkinsfile`

### Job 2: Cypress-Nightly (Cron)

1. **New Item** > **Pipeline** > Name: `Cypress-Nightly`
2. **Build Triggers**:
   - Check **Build periodically**
   - Schedule: `H 0 * * *` (midnight daily)
3. **Pipeline**:
   - Same as above, Script Path: `Jenkinsfile`
   - Default parameters: SUITE=regression, PARALLEL=true

### Job 3: Cypress-Parameterized (Manual)

1. **New Item** > **Pipeline** > Name: `Cypress-Parameterized`
2. **Check**: This project is parameterized (parameters are defined in Jenkinsfile)
3. **Pipeline**:
   - Same as above, Script Path: `Jenkinsfile`

### Job 4: Cypress-Docker-Pipeline (Docker-based)

1. **New Item** > **Pipeline** > Name: `Cypress-Docker-Pipeline`
2. **Pipeline**:
   - Same as above, Script Path: `Jenkinsfile.docker`

---

## 6. GitHub Webhook Integration

### On GitHub:
1. Go to **Repository Settings > Webhooks > Add webhook**
2. Payload URL: `http://<your-jenkins-url>:8080/github-webhook/`
3. Content type: `application/json`
4. Events: **Just the push event**
5. Active: checked

### On Jenkins:
1. Go to job configuration
2. Build Triggers > check **GitHub hook trigger for GITScm polling**

---

## 7. Verify Parallel Execution

### Demo: Sequential vs Parallel

1. **Sequential run**: Trigger `Cypress-Parameterized` with:
   - SUITE: `regression`
   - PARALLEL: `false` (unchecked)
   - Note the total execution time

2. **Parallel run**: Trigger again with:
   - SUITE: `regression`
   - PARALLEL: `true` (checked)
   - Note the total execution time

Expected result: **~65-70% reduction in execution time**

### Jenkins Stage View

The parallel pipeline will display like this in Blue Ocean / Stage View:

```
Checkout → Install → Clean → ┌─ Auth Tests ────────┐ → Collect → Report → Publish
                              ├─ Dashboard Tests ───┤
                              ├─ User Mgmt Tests ───┤
                              ├─ Forms Tests ────────┤
                              └─ API Tests ──────────┘
```

---

## 8. View Mochawesome Report in Jenkins

After a successful build:
1. Go to the build page
2. Click **Cypress Mochawesome Report** in the left sidebar
3. The consolidated HTML report opens directly in Jenkins UI

---

## 9. Slack Notifications (Optional)

1. Install **Slack Notification Plugin**
2. Go to **Manage Jenkins > System > Slack**
3. Configure:
   - Workspace: your Slack workspace
   - Credential: Slack Bot token or Webhook URL
   - Default channel: `#qa-automation`
4. Uncomment the `slackSend` blocks in `Jenkinsfile`
