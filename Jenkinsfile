pipeline {
  agent {
    docker {
      image 'node:22'
      args '-u root -v /var/jenkins_home/npm-cache:/root/.npm'
    }
  }

  environment {
    PROJECT_URL = "git@github.com:OmdaMukhtar/demo-cicd.git"
    BRANCH_NAME = "master"
    APP_NAME = "my-demo-vuejs"
    ARTIFACT_NAME = "${APP_NAME}-${BUILD_NUMBER}.tar.gz"
    TARGET_URL = "http://192.168.0.191"
    RELEASE_ID = "${new Date().format('yyyyMMddHHmmss')}"
    BUILD_FOLDER="dist"
  }

  stages {

    stage('Clone') {
      steps {
        git credentialsId: 'omda-git',
            url: env.PROJECT_URL,
            branch: env.BRANCH_NAME
      }
    }

    stage('Install Dependency Ansible On Container'){
        steps{
            sh 'apt update && apt install -y ansible sshpass'
        }
    }

    stage('Install & Build') {
      steps {
        sh '''
          rm -rf node_modules package-lock.json
          npm config set cache /root/.npm --global
          export NODE_OPTIONS=--openssl-legacy-provider
          npm install
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

    stage('Deploy with Ansible') {
      steps {
        sh """
            cd ansible && ansible-playbook -i inventory.ini deploy.yml \
            --extra-vars "release_id=${env.RELEASE_ID} artifact_name=${env.ARTIFACT_NAME}"
        """
      }
    }

    stage('Health Check') {
      steps {
        sh """
            for i in {1..10}; do
                sleep 3

                if curl -f ${env.TARGET_URL} > /dev/null 2>&1; then
                    echo "App is healthy"
                    exit 0
                fi

                echo "Waiting..."
            done

            echo "App is NOT healthy"
            exit 1
        """
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
      sh "ansible-playbook -i inventory rollback.yml"
    }
  }
}
