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
                        // fail with clear message if username is empty
                        if (!env.DOCKER_USER?.trim()) {
                            error("Docker Hub credential 'dockerhub-creds' has an empty username. Open Jenkins > Credentials > System (global) and set the username for id 'dockerhub-creds', or recreate it as 'Username with password'.")
                        }
                        // small non-sensitive debug (prints length, not the secret)
                        echo "Docker Hub username length: ${env.DOCKER_USER.length()}"
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
                    echo "🚀 Deploying to Kubernetes via proxy..."
                    sh """
                    kubectl --server=http://host.docker.internal:8001 apply -f k8s/
                    kubectl --server=http://host.docker.internal:8001 rollout status deployment/k8s-cicd-demo-deployment
                    """
                }
            }
        }
    }
}
