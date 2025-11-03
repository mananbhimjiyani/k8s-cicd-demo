pipeline {
    agent any

    environment {
        BRANCH = "${env.BRANCH_NAME}"
        DOCKERHUB_USER = 'mananbhimjiyani'
        IMAGE_NAME = 'k8s-cicd-demo'
    }

    stages {
        stage('Set Namespace') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        env.NAMESPACE = 'production'
                    } else {
                        env.NAMESPACE = 'test'
                    }
                    echo "Deploying to namespace: ${env.NAMESPACE}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "🔨 Building Docker image..."
                    // build using the Dockerfile inside app/ and use app/ as context
                    sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:${env.BRANCH_NAME} -f app/Dockerfile app"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "📦 Pushing Docker image to Docker Hub..."
                    def imageTag = "${DOCKERHUB_USER}/${IMAGE_NAME}:${env.BRANCH_NAME}"
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
docker push ''' + imageTag + '''
docker logout'''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "🚀 Deploying to ${env.NAMESPACE} namespace..."
                    sh """
                    # apply the single k8s manifest in k8s/deployment.yaml
                    kubectl apply -f k8s/deployment.yaml
                    # wait for the actual deployment name from the manifest
                    kubectl rollout status deployment/student-dashboard -n ${env.NAMESPACE}
                    """
                }
            }
        }
    }
}
