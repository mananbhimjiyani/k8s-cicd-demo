pipeline {
    agent any

    environment {
        BRANCH = "${env.BRANCH_NAME}"
        DOCKERHUB_USER = 'mananbhimjiyani'  // ✅ replace with your Docker Hub username
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
                    sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:${env.BRANCH_NAME} ."
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "📦 Pushing Docker image to Docker Hub..."
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:${env.BRANCH_NAME}
                        docker logout
                        """
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "🚀 Deploying to ${env.NAMESPACE} namespace..."
                    sh """
                    kubectl apply -f k8s/${env.NAMESPACE}/deployment.yaml
                    kubectl rollout status deployment/${IMAGE_NAME} -n ${env.NAMESPACE}
                    """
                }
            }
        }
    }
}
