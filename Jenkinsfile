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
                    // explicit branch -> namespace mapping
                    if (env.BRANCH_NAME == 'main') {
                        env.NAMESPACE = 'production'
                    } else if (env.BRANCH_NAME == 'dev') {
                        env.NAMESPACE = 'test'
                    } else {
                        // fallback: treat any other branch as test
                        env.NAMESPACE = 'test'
                        echo "Branch '${env.BRANCH_NAME}' not explicitly mapped — defaulting to namespace: ${env.NAMESPACE}"
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
                    def imageTag = "${DOCKERHUB_USER}/${IMAGE_NAME}:${env.BRANCH_NAME}"
                    // render manifest with actual namespace and image, create namespace if missing, then apply
                    sh """
                    # ensure namespace exists
                    if ! kubectl --server=http://host.docker.internal:8001 get ns ${env.NAMESPACE} >/dev/null 2>&1; then
                      kubectl --server=http://host.docker.internal:8001 create ns ${env.NAMESPACE}
                    fi

                    # render k8s manifests (replace ${NAMESPACE} and ${DOCKER_IMAGE} placeholders)
                    sed -e 's|\\\${NAMESPACE}|${env.NAMESPACE}|g' -e 's|\\\${DOCKER_IMAGE}|${imageTag}|g' k8s/deployment.yaml > k8s/deployment-rendered.yaml

                    # apply rendered manifests
                    kubectl --server=http://host.docker.internal:8001 apply -f k8s/deployment-rendered.yaml
                    kubectl --server=http://host.docker.internal:8001 rollout status deployment/k8s-cicd-demo-deployment -n ${env.NAMESPACE}
                    """
                }
            }
        }
    }
}
