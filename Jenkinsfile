pipeline {
    agent any

    environment {
        AWS_REGION      = 'ap-southeast-2'
        ACCOUNT_ID      = '008538886203'
        ECR_REGISTRY    = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        FRONTEND_IMAGE  = "${ECR_REGISTRY}/todo-frontend"
        BACKEND_IMAGE   = "${ECR_REGISTRY}/todo-backend"
        EKS_CLUSTER     = 'todo-cluster'
        IMAGE_TAG       = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Code checked out - Build #${BUILD_NUMBER}"
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh """
                        docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
                        docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./Backend
                        echo "✅ Docker images built"
                    """
                }
            }
        }

        stage('Push to ECR') {
            steps {
                script {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}

                        docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                        docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:latest
                        docker push ${BACKEND_IMAGE}:latest

                        echo "✅ Images pushed to ECR"
                    """
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                script {
                    sh """
                        aws eks update-kubeconfig \
                          --name ${EKS_CLUSTER} \
                          --region ${AWS_REGION}

                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/mongo-secret.yaml

                        sed 's|BACKEND_IMAGE|${BACKEND_IMAGE}:${IMAGE_TAG}|g' \
                          k8s/backend-deployment.yaml | kubectl apply -f -

                        sed 's|FRONTEND_IMAGE|${FRONTEND_IMAGE}:${IMAGE_TAG}|g' \
                          k8s/frontend-deployment.yaml | kubectl apply -f -

                        kubectl rollout status deployment/backend \
                          -n todo-app --timeout=120s
                        kubectl rollout status deployment/frontend \
                          -n todo-app --timeout=120s

                        echo "✅ Deployed to EKS"
                        kubectl get pods -n todo-app
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline succeeded! App deployed.'
        }
        failure {
            echo '❌ Pipeline failed. Check logs.'
        }
        always {
            sh 'docker image prune -f'
        }
    }
}
