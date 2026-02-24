pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'  // Configured in Jenkins Global Tool Configuration
    }

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Target environment')
        choice(name: 'BROWSER', choices: ['chrome', 'firefox', 'electron'], description: 'Browser to run tests')
        choice(name: 'SUITE', choices: ['regression', 'smoke', 'sanity', 'all'], description: 'Test suite to run')
        booleanParam(name: 'PARALLEL', defaultValue: true, description: 'Run regression suites in parallel')
    }

    environment {
        CYPRESS_BASE_URL = 'https://katalon-demo-cura.herokuapp.com'
    }

    options {
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    stages {

        // ── Stage 1: Checkout ──
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME ?: env.GIT_BRANCH}"
                echo "Environment: ${params.ENVIRONMENT}"
                echo "Browser: ${params.BROWSER}"
                echo "Suite: ${params.SUITE}"
                echo "Parallel: ${params.PARALLEL}"
            }
        }

        // ── Stage 2: Install Dependencies ──
        stage('Install Dependencies') {
            steps {
                sh 'node -v && npm -v'
                sh 'npm ci'
            }
        }

        // ── Stage 3: Clean Previous Reports ──
        stage('Clean Reports') {
            steps {
                sh 'rm -rf mochawesome-temp mochawesome-report'
                sh 'mkdir -p mochawesome-temp mochawesome-report'
            }
        }

        // ── Stage 4: Run Tests ──
        stage('Run Tests') {
            stages {

                // ── 4a: Smoke / Sanity / All (non-parallel) ──
                stage('Run Suite') {
                    when {
                        expression { params.SUITE != 'regression' }
                    }
                    steps {
                        script {
                            def specPath = ''
                            switch (params.SUITE) {
                                case 'smoke':
                                    specPath = 'cypress/e2e/smoke/**'
                                    break
                                case 'sanity':
                                    specPath = 'cypress/e2e/sanity/**'
                                    break
                                case 'all':
                                    specPath = 'cypress/e2e/**'
                                    break
                            }
                            sh """
                                npx cypress run \
                                    --browser ${params.BROWSER} \
                                    --spec '${specPath}' \
                                    --reporter mochawesome \
                                    --reporter-options reportDir=mochawesome-temp,overwrite=false,html=false,json=true
                            """
                        }
                    }
                }

                // ── 4b: Regression — Sequential ──
                stage('Regression (Sequential)') {
                    when {
                        expression { params.SUITE == 'regression' && !params.PARALLEL }
                    }
                    steps {
                        sh """
                            npx cypress run \
                                --browser ${params.BROWSER} \
                                --spec 'cypress/e2e/regression/**' \
                                --reporter mochawesome \
                                --reporter-options reportDir=mochawesome-temp,overwrite=false,html=false,json=true
                        """
                    }
                }

                // ── 4c: Regression — Parallel (5 sub-suites) ──
                stage('Regression (Parallel)') {
                    when {
                        expression { params.SUITE == 'regression' && params.PARALLEL }
                    }
                    parallel {

                        stage('Auth Tests') {
                            agent {
                                docker {
                                    image 'cypress/included:15.3.0'
                                    args '-v ${WORKSPACE}:/app -w /app'
                                }
                            }
                            steps {
                                sh 'npm ci'
                                sh """
                                    npx cypress run \
                                        --browser ${params.BROWSER} \
                                        --spec 'cypress/e2e/regression/authentication/**' \
                                        --reporter mochawesome \
                                        --reporter-options reportDir=mochawesome-temp/auth,overwrite=false,html=false,json=true
                                """
                            }
                            post {
                                always {
                                    stash name: 'auth-results', includes: 'mochawesome-temp/auth/**,cypress/screenshots/**,cypress/videos/**', allowEmpty: true
                                }
                            }
                        }

                        stage('Appointment Tests') {
                            agent {
                                docker {
                                    image 'cypress/included:15.3.0'
                                    args '-v ${WORKSPACE}:/app -w /app'
                                }
                            }
                            steps {
                                sh 'npm ci'
                                sh """
                                    npx cypress run \
                                        --browser ${params.BROWSER} \
                                        --spec 'cypress/e2e/regression/appointment/**' \
                                        --reporter mochawesome \
                                        --reporter-options reportDir=mochawesome-temp/appointment,overwrite=false,html=false,json=true
                                """
                            }
                            post {
                                always {
                                    stash name: 'appointment-results', includes: 'mochawesome-temp/appointment/**,cypress/screenshots/**,cypress/videos/**', allowEmpty: true
                                }
                            }
                        }

                        stage('Confirmation Tests') {
                            agent {
                                docker {
                                    image 'cypress/included:15.3.0'
                                    args '-v ${WORKSPACE}:/app -w /app'
                                }
                            }
                            steps {
                                sh 'npm ci'
                                sh """
                                    npx cypress run \
                                        --browser ${params.BROWSER} \
                                        --spec 'cypress/e2e/regression/confirmation/**' \
                                        --reporter mochawesome \
                                        --reporter-options reportDir=mochawesome-temp/confirmation,overwrite=false,html=false,json=true
                                """
                            }
                            post {
                                always {
                                    stash name: 'confirmation-results', includes: 'mochawesome-temp/confirmation/**,cypress/screenshots/**,cypress/videos/**', allowEmpty: true
                                }
                            }
                        }

                        stage('History Tests') {
                            agent {
                                docker {
                                    image 'cypress/included:15.3.0'
                                    args '-v ${WORKSPACE}:/app -w /app'
                                }
                            }
                            steps {
                                sh 'npm ci'
                                sh """
                                    npx cypress run \
                                        --browser ${params.BROWSER} \
                                        --spec 'cypress/e2e/regression/history/**' \
                                        --reporter mochawesome \
                                        --reporter-options reportDir=mochawesome-temp/history,overwrite=false,html=false,json=true
                                """
                            }
                            post {
                                always {
                                    stash name: 'history-results', includes: 'mochawesome-temp/history/**,cypress/screenshots/**,cypress/videos/**', allowEmpty: true
                                }
                            }
                        }

                        stage('API Validation Tests') {
                            agent {
                                docker {
                                    image 'cypress/included:15.3.0'
                                    args '-v ${WORKSPACE}:/app -w /app'
                                }
                            }
                            steps {
                                sh 'npm ci'
                                sh """
                                    npx cypress run \
                                        --browser ${params.BROWSER} \
                                        --spec 'cypress/e2e/regression/api-validation/**' \
                                        --reporter mochawesome \
                                        --reporter-options reportDir=mochawesome-temp/api,overwrite=false,html=false,json=true
                                """
                            }
                            post {
                                always {
                                    stash name: 'api-results', includes: 'mochawesome-temp/api/**,cypress/screenshots/**,cypress/videos/**', allowEmpty: true
                                }
                            }
                        }

                    } // end parallel
                } // end Regression (Parallel)

            } // end inner stages
        } // end Run Tests

        // ── Stage 5: Collect Parallel Results ──
        stage('Collect Parallel Results') {
            when {
                expression { params.SUITE == 'regression' && params.PARALLEL }
            }
            steps {
                unstash 'auth-results'
                unstash 'appointment-results'
                unstash 'confirmation-results'
                unstash 'history-results'
                unstash 'api-results'
            }
        }

        // ── Stage 6: Generate Consolidated Report ──
        stage('Generate Report') {
            steps {
                sh '''
                    echo "Merging all Mochawesome JSON files..."
                    npx mochawesome-merge "mochawesome-temp/**/*.json" -o mochawesome-report/merged.json
                    npx marge mochawesome-report/merged.json -f report -o mochawesome-report
                    echo "Report generated at mochawesome-report/report.html"
                '''
            }
        }

        // ── Stage 7: Publish Report ──
        stage('Publish Report') {
            steps {
                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'mochawesome-report',
                    reportFiles: 'report.html',
                    reportName: 'Cypress Mochawesome Report',
                    reportTitles: 'Cypress Test Results'
                ])
            }
        }

    } // end stages

    post {
        always {
            // ── Archive artifacts ──
            archiveArtifacts artifacts: 'mochawesome-report/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/screenshots/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'cypress/videos/**', allowEmptyArchive: true
        }
        success {
            echo '✅ All Cypress tests passed!'
        }
        failure {
            echo '❌ Some Cypress tests failed!'
        }
        cleanup {
            cleanWs()
        }
    }
}
