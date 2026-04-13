Full-Stack Application with CI/CD, Kubernetes & Monitoring
Context
Build a simple full-stack CRUD application from scratch with production-grade infrastructure: Next.js frontend, FastAPI backend, PostgreSQL database, GitHub Actions CI/CD, Kubernetes deployment on AWS EC2, and Prometheus/Grafana monitoring.

Project Structure
week 12 - chua/
├── frontend/                    # Next.js app
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   └── src/
│       └── app/
│           ├── layout.tsx
│           ├── page.tsx         # Main UI - list, create, edit, delete items
│           └── globals.css
├── backend/                     # FastAPI (Python)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app + CORS + Prometheus
│       ├── database.py         # SQLAlchemy engine/session
│       ├── models.py           # SQLAlchemy ORM model
│       ├── schemas.py          # Pydantic request/response schemas
│       └── routes.py           # CRUD endpoints
├── k8s/                         # Kubernetes manifests
│   ├── namespace.yaml
│   ├── postgres-secret.yaml
│   ├── postgres-pvc.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── ingress.yaml
│   └── monitoring/
│       ├── prometheus-config.yaml
│       ├── prometheus-deployment.yaml
│       ├── prometheus-service.yaml
│       ├── grafana-deployment.yaml
│       └── grafana-service.yaml
├── .github/
│   └── workflows/
│       └── ci-cd.yaml          # Build, test, push images, deploy
├── docker-compose.yaml          # Local development
└── CLAUDE.md
1. Backend - FastAPI
Framework: FastAPI (modern, async, auto-docs)

Database: PostgreSQL via SQLAlchemy ORM

Data model - Item table:

Column	Type
id	Integer (PK)
name	String
description	Text
created_at	DateTime
updated_at	DateTime
Endpoints:

GET /api/items - list all items
POST /api/items - create an item
PUT /api/items/{id} - update an item
DELETE /api/items/{id} - delete an item
GET /health - health check (for k8s probes)
GET /metrics - Prometheus metrics
Key dependencies: fastapi, uvicorn, sqlalchemy, psycopg2-binary, prometheus-fastapi-instrumentator

2. Frontend - Next.js
App Router (Next.js 14+)
Single page UI showing a list of items with create/edit/delete
Fetches from backend API via environment variable NEXT_PUBLIC_API_URL
Dockerized with multi-stage build (build -> serve with next start)
3. Database - PostgreSQL
Standard PostgreSQL 15 image
Persistent storage via PVC in Kubernetes
Credentials stored in Kubernetes Secret
4. CI/CD - GitHub Actions
Workflow triggers: push to main, pull requests

Pipeline stages:

Lint & Test - backend pytest, frontend build check
Build Docker Images - backend + frontend
Push to Docker Hub (using DOCKERHUB_USERNAME / DOCKERHUB_TOKEN secrets)
Deploy to Kubernetes - kubectl apply via SSH or kubeconfig
Required GitHub Secrets:

Secret	Purpose
DOCKERHUB_USERNAME	Docker Hub username
DOCKERHUB_TOKEN	Docker Hub access token
KUBE_CONFIG	Base64-encoded kubeconfig for the EC2 k8s cluster
EC2_HOST	EC2 instance public IP/hostname
EC2_SSH_KEY	SSH private key to access EC2
EC2_USER	SSH user (e.g., ubuntu)
5. Kubernetes Manifests
Namespace: chua-app

Deployments:

postgres - 1 replica, PVC for data, secret for credentials
backend - 2 replicas, env vars for DB connection, liveness/readiness probes on /health
frontend - 2 replicas, env var for API URL, liveness/readiness probes
Services:

postgres-service - ClusterIP (internal only)
backend-service - ClusterIP
frontend-service - NodePort or LoadBalancer (external access)
Ingress: NGINX ingress routing /api/* to backend, /* to frontend

Monitoring stack:

Prometheus deployment scraping /metrics from backend
Grafana deployment with Prometheus as data source
6. Monitoring & Observability
Backend metrics: prometheus-fastapi-instrumentator auto-instruments all endpoints (request count, latency, status codes)
Prometheus: Scrapes backend /metrics every 15s
Grafana: Pre-configured to connect to Prometheus, accessible on NodePort
Health checks: All services have liveness + readiness probes
7. AWS EC2 Prerequisites (User Action)
The user needs to set up on the EC2 instance:

Kubernetes cluster - install k3s (lightweight) or kubeadm
kubectl configured
NGINX Ingress Controller installed in the cluster
Security groups allowing ports: 80, 443, 30000-32767 (NodePorts), 6443 (k8s API)
Docker Hub account for image registry
SSH access from GitHub Actions to EC2
8. Local Development
docker-compose.yaml spins up all 3 services locally for development.

Implementation Order
Backend (FastAPI + models + routes)
Frontend (Next.js UI)
Dockerfiles for both
docker-compose.yaml
Kubernetes manifests (app + DB)
Monitoring manifests (Prometheus + Grafana)
GitHub Actions CI/CD workflow
CLAUDE.md
Verification
Local: docker-compose up -> test CRUD via UI at localhost:3000
API: curl endpoints at localhost:8000/api/items and /docs (Swagger)
K8s: kubectl apply -f k8s/ -> verify pods running
CI/CD: Push to GitHub -> watch Actions workflow
Monitoring: Access Grafana dashboard, verify Prometheus targets