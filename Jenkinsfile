pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'mananbhimjiyani'
        IMAGE_NAME = 'student-dashboard'
        BRANCH = "${env.BRANCH_NAME}"
        NAMESPACE = BRANCH == 'main' ? 'production' : 'test'
        DOCKER_CREDS = 'dockerhub-creds'  // Jenkins credential ID
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t $DOCKERHUB_USER/$IMAGE_NAME:$BRANCH .'
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_CREDS) {
                        sh '''
                            docker push $DOCKERHUB_USER/$IMAGE_NAME:$BRANCH
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh '''
                        kubectl apply -f k8s/deployment.yaml -n $NAMESPACE
                        kubectl apply -f k8s/service.yaml -n $NAMESPACE
                    '''
                }
            }
        }
    }
}
