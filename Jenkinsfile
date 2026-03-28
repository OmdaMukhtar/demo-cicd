pipeline {
 agent any

  environment {
    BRANCH_NAME = "master"
    APP_NAME = "my-demo-vuejs"
    ARTIFACT_NAME = "${APP_NAME}-${BUILD_NUMBER}.tar.gz"
    RELEASE_ID = "${new Date().format('yyyyMMddHHmmss')}"
    BUILD_FOLDER="$workspace/dist"

    PROJECT_URL = credentials('git-repo-url')
    TARGET_URL  = credentials('target-url')
  }

  stages {

    stage('Clone') {
      steps {
        withCredentials([string(credentialsId: 'git-repo-url', variable: 'PROJECT_URL')]) {
          git credentialsId: 'omda-git', url: "${PROJECT_URL}", branch: "${env.BRANCH_NAME}"
        }
      }
    }

    stage('Install & Build') {
      steps {
        script {
          docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-registry') {
              docker.image('node:22').inside("-u root --network host") {
                  sh '''
                    export NODE_OPTIONS=--openssl-legacy-provider
                    npm ci
                    npm run build

                    chown -R 123:124 .
                  '''
              }
          }
        }
      }
    }

    stage('Security Scan File System') {
      steps {
        script {
            def cachePath = "/var/jenkins_home/trivy-cache"

            docker.image('ghcr.io/aquasecurity/trivy:0.42.0').inside(
            "--entrypoint='' -u root -v ${cachePath}:/root/.cache/trivy") {
                sh '''
                  ls -l &&
                  trivy fs \
                    --severity HIGH,CRITICAL \
                    --scanners vuln \
                    --format table \
                    --exit-code 1 \
                    .

                  trivy fs \
                    --severity HIGH,CRITICAL \
                    --scanners vuln \
                    --format json \
                    --output trivy-report.json \
                    --exit-code 1 \
                    .

                  chown 123:124 trivy-report.json
                '''
            }
        }
        archiveArtifacts artifacts: 'trivy-report.json', fingerprint: true
      }
    }

    stage('Package') {
      steps {
        sh "tar -czf ${ARTIFACT_NAME} dist"
      }
    }

    stage('Archive') {
      steps {
        archiveArtifacts artifacts: "${env.ARTIFACT_NAME}", fingerprint: true
      }
    }

    stage('Deploy with Ansible') {
      steps {
        sshagent(['ssh-id']) {
          sh """
            cd ansible && ansible-playbook deploy.yml \
            --extra-vars "release_id=${env.RELEASE_ID} artifact_name=../${env.ARTIFACT_NAME}"
          """
        }
      }
    }

    stage('Health Check') {
      steps {
        sshagent(['ssh-id']) {
          sh '''
            cd ansible && ansible-playbook health-check.yml
          '''
        }
      }
    }
  }

  post {

    success {
      build job: 'security-scan', parameters: [
        string(name: 'TARGET_URL', value: "${env.TARGET_URL}")
      ]
    }

    failure {
      sshagent(['ssh-id']) {
        sh "cd ansible && ansible-playbook rollback.yml"
      }
    }

  }
}
