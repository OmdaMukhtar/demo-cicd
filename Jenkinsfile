pipeline {
  agent {
    docker {
      image '18474542/demo-cicd-vue:latest'
      args '--network host -u root -v /var/jenkins_home/npm-cache:/root/.npm'
      registryCredentialsId 'docker-hub-registry'
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

    stage('Install & Build') {
      steps {
        sh '''
          rm -rf package-lock.json
          npm config set cache /root/.npm --global
          export NODE_OPTIONS=--openssl-legacy-provider
          npm install
          npm run build
        '''
      }
    }

    stage('Package') {
      steps {
        sh "tar -czf ${env.ARTIFACT_NAME} -C ${env.BUILD_FOLDER} . "
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
        sh """
          set -x

          for i in \$(seq 1 20); do
              echo "Attempt \$i..."
              sleep 5

              if curl -f http://192.168.0.191 > /dev/null 2>&1; then
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
      sshagent(['ssh-id']) {
        sh "cd ansible && ansible-playbook rollback.yml"
      }
    }
  }
}
