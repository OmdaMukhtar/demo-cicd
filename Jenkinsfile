pipeline {
  agent {
    docker {
      image '18474542/demo-cicd-vue:latest'
      args '--network host -u root -v /var/jenkins_home/npm-cache:/root/.npm'
      registryCredentialsId 'docker-hub-registry'
    }
  }

  environment {
    BRANCH_NAME = "master"
    APP_NAME = "my-demo-vuejs"
    ARTIFACT_NAME = "${APP_NAME}-${BUILD_NUMBER}.tar.gz"
    RELEASE_ID = "${new Date().format('yyyyMMddHHmmss')}"
    BUILD_FOLDER="dist"

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

    stage('Clone') {
      steps {
        git credentialsId: 'omda-git',
            url: env.PROJECT_URL,
            branch: env.BRANCH_NAME
      }
    }

    stage('Install & Build') {
      steps {
        sh '''
          npm config set cache /root/.npm --global
          export NODE_OPTIONS=--openssl-legacy-provider
          npm ci
          npm run build
        '''
      }
    }

    stage('Package') {
      steps {
        sh "tar -czf ${env.ARTIFACT_NAME} ${env.BUILD_FOLDER}"
      }
    }

    stage('Archive') {
      steps {
        archiveArtifacts artifacts: "${env.ARTIFACT_NAME}", fingerprint: true
      }
    }

    stage('Configure SSH with Remote Server and Container') {
      steps {
        sshagent(['ssh-id']) {
            sh """
              # add ip to the know list of the docker
              mkdir -p ~/.ssh
              echo '192.168.0.191 app1' >> /etc/hosts
              echo '192.168.0.192 app2' >> /etc/hosts

              ssh-keyscan -H 192.168.0.191 >> ~/.ssh/known_hosts
              ssh-keyscan -H 192.168.0.192 >> ~/.ssh/known_hosts
            """
        }
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
