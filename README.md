# AWS EKS Static Web Application Deployment Project

## Project Description

This project demonstrates the complete deployment lifecycle of a static web application on Amazon EKS (Elastic Kubernetes Service).

The objective was to:

* Host a static HTML/CSS/JavaScript application.
* Dockerize the application.
* Store the Docker image in Amazon ECR.
* Create an EKS cluster using Terraform.
* Deploy the application to Kubernetes.
* Expose the application through a Kubernetes Service.
* Verify application accessibility from the internet.

This project provides hands-on experience with:

* AWS
* Terraform
* Docker
* Kubernetes
* Amazon ECR
* Amazon EKS
* Linux Administration
* Networking Concepts

---

# Project Architecture

```text
Local Windows Machine
        |
        |
        v
EC2 Jump Server (Ubuntu)
        |
        |
        v
Docker Build
        |
        |
        v
Amazon ECR
        |
        |
        v
Amazon EKS Cluster
        |
        |
        v
Kubernetes Deployment
        |
        |
        v
Kubernetes Service
        |
        |
        v
Application Access
```

---

# Environment Details

| Component              | Details    |
| ---------------------- | ---------- |
| Cloud Provider         | AWS        |
| Region                 | ap-south-1 |
| OS                     | Ubuntu     |
| Container Runtime      | Docker     |
| Container Registry     | Amazon ECR |
| Orchestration          | Kubernetes |
| Managed Kubernetes     | Amazon EKS |
| Infrastructure as Code | Terraform  |

---

# Phase 1: Application Preparation

## Existing Application

The project started with an existing static website containing:

```text
index.html
css/
js/
images/
```

The application was available on the local Windows machine.

---

# Phase 2: Transfer Application to EC2

## Connect to Jump Server

```bash
ssh -i jumpserver.pem ubuntu@<public-ip>
```

## Transfer Files

```powershell
scp -i "jumpserver.pem" -r web/* ubuntu@<public-ip>:/home/ubuntu/app/
```

## Verify Files

```bash
cd /home/ubuntu/app

ls -la
```

Expected output:

```text
index.html
css
js
images
```

---

# Phase 3: Dockerization

## Why Docker?

Docker allows packaging:

* Application
* Runtime
* Dependencies
* Configuration

into a single portable image.

---

## Dockerfile Creation

Created Dockerfile:

```dockerfile
FROM nginx:alpine

COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Explanation

FROM nginx:alpine

* Uses lightweight Nginx image.

COPY

* Copies website files into Nginx web root.

EXPOSE 80

* Makes container listen on port 80.

CMD

* Starts Nginx service.

---

## Build Docker Image

```bash
docker build -t static-app:v1 .
```

Verify:

```bash
docker images
```

Expected:

```text
static-app v1
```

---

## Run Locally

```bash
docker run -d -p 8080:80 static-app:v1
```

Verify:

```bash
curl localhost:8080
```

---

# Phase 4: Amazon ECR

## Why ECR?

Amazon ECR stores Docker images securely.

Benefits:

* AWS integration
* Private repositories
* High availability

---

## Create Repository

```bash
aws ecr create-repository \
--repository-name static-app
```

Repository created:

```text
610714125174.dkr.ecr.ap-south-1.amazonaws.com/static-app
```

---

## Login to ECR

```bash
aws ecr get-login-password \
--region ap-south-1 \
| docker login \
--username AWS \
--password-stdin 610714125174.dkr.ecr.ap-south-1.amazonaws.com
```

---

## Tag Image

```bash
docker tag static-app:v1 \
610714125174.dkr.ecr.ap-south-1.amazonaws.com/static-app:v1
```

---

## Push Image

```bash
docker push \
610714125174.dkr.ecr.ap-south-1.amazonaws.com/static-app:v1
```

---

# Phase 5: EKS Infrastructure

## Goal

Create Kubernetes infrastructure using Terraform.

Resources:

* VPC
* Internet Gateway
* Route Tables
* Public Subnets
* EKS Cluster
* Node Group

---

# Networking Setup

## VPC

```text
10.0.0.0/16
```

Purpose:

Provides isolated network.

---

## Public Subnet 1

```text
10.0.1.0/24
```

---

## Public Subnet 2

```text
10.0.2.0/24
```

---

## Internet Gateway

Provides internet connectivity.

---

## Route Table

```text
0.0.0.0/0 → Internet Gateway
```

Allows outbound internet traffic.

---

# Terraform Deployment

Initialize:

```bash
terraform init
```

Validate:

```bash
terraform validate
```

Plan:

```bash
terraform plan
```

Apply:

```bash
terraform apply
```

---

# Phase 6: Configure kubectl

## Install kubectl

```bash
curl -LO \
https://dl.k8s.io/release/stable/bin/linux/amd64/kubectl

chmod +x kubectl

sudo mv kubectl /usr/local/bin/
```

Verify:

```bash
kubectl version --client
```

---

## Update kubeconfig

```bash
aws eks update-kubeconfig \
--region ap-south-1 \
--name unipiper
```

---

## Verify Cluster

```bash
kubectl get nodes
```

Expected:

```text
STATUS = Ready
```

---

# Phase 7: Kubernetes Deployment

## deployment.yaml

```yaml
apiVersion: static-app/v1
kind: Deployment

metadata:
  name: static-app

spec:
  replicas: 2

  selector:
    matchLabels:
      app: static-app

  template:
    metadata:
      labels:
        app: static-app

    spec:
      containers:
      - name: static-app
        image: 610714125174.dkr.ecr.ap-south-1.amazonaws.com/static-app:v1

        ports:
        - containerPort: 80
```

---

## Deploy Application

```bash
kubectl apply -f deployment.yaml
```

---

## Verify

```bash
kubectl get deployments

kubectl get pods -o wide
```

---

# Phase 8: Kubernetes Service

## service.yaml

```yaml
apiVersion: v1
kind: Service

metadata:
  name: static-app-service

spec:
  selector:
    app: static-app

  ports:
  - port: 80
    targetPort: 80

  type: LoadBalancer
```

---

## Create Service

```bash
kubectl apply -f service.yaml
```

Verify:

```bash
kubectl get svc
```

---

# Troubleshooting Performed

## Issue 1: 403 Forbidden

Cause:

* Incorrect Nginx document root.
* Missing index.html.

Solution:

* Verified application files.
* Rebuilt Docker image.

---

## Issue 2: kubectl Access

Cause:

* kubeconfig not updated.

Solution:

```bash
aws eks update-kubeconfig \
--region ap-south-1 \
--name unipiper
```

---

## Issue 3: ECR Authentication

Cause:

* Docker login expired.

Solution:

```bash
aws ecr get-login-password \
| docker login
```

---

## Useful Commands

### Docker

```bash
docker images
docker ps
docker build
docker run
docker logs
```

### Kubernetes

```bash
kubectl get pods
kubectl get svc
kubectl get deployments
kubectl describe pod
kubectl logs
```

### Terraform

```bash
terraform init
terraform validate
terraform plan
terraform apply
terraform destroy
```

### AWS

```bash
aws configure
aws eks list-clusters
aws ecr describe-repositories
```

---

# Skills Demonstrated

* AWS Administration
* Terraform
* Docker
* Amazon ECR
* Amazon EKS
* Kubernetes
* Linux
* Networking
* Troubleshooting
* DevOps Practices

---

# Future Improvements

* Use Ingress Controller
* Configure HTTPS with ACM
* Implement CI/CD Pipeline
* Use Helm Charts
* Add Monitoring with Prometheus
* Add Grafana Dashboards
* Configure Auto Scaling
* Use Private Subnets

---

# Conclusion

Successfully deployed a static web application to Amazon EKS by:

1. Dockerizing the application.
2. Pushing the image to Amazon ECR.
3. Creating EKS infrastructure using Terraform.
4. Deploying the application using Kubernetes.
5. Exposing the application through a Kubernetes Service.
6. Verifying successful deployment and accessibility.

This project demonstrates an end-to-end Kubernetes deployment workflow on AWS using modern DevOps tools and practices.

Author: Shakeer Mohammed
