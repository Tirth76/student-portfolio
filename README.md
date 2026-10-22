# Full-Stack Student Portfolio & Task Management Platform

[![CI Pipeline](https://github.com/Tirth76/student-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Tirth76/student-portfolio/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18%20%7C%2020-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Jest](https://img.shields.io/badge/Tested%20with-Jest%20%26%20Supertest-red.svg)](https://jestjs.io/)
[![Docker](https://img.shields.io/badge/Docker-Orchestrated-blue.svg)](https://www.docker.com/)

A modern, full-stack application featuring a React/Vite single-page application frontend, an event-driven Node.js & Express REST API with MongoDB persistent storage, Docker containerization, and continuous integration via GitHub Actions.

---

## 🚀 CI/CD Pipeline (GitHub Actions)

This repository includes a production-grade CI/CD pipeline defined in `.github/workflows/ci.yml` that automatically validates every push and pull request targeting the `main` branch.

### Pipeline Stages:
1. **Code Quality & Linting (`lint` job):**
   - Runs `oxlint` static code analysis to catch syntax and formatting issues before build.
2. **Build & Automated Testing (`build-and-test` job):**
   - Installs root and backend dependencies.
   - Executes the automated test suite (`jest` + `supertest`) verifying REST API endpoints.
   - Compiles the frontend production bundle (`vite build`).

---

## 🛠️ Quick Start & Local Execution

### 1. Run Automated Tests
```bash
# From the project root:
npm test

# Or directly in the backend directory:
cd task-manager-api
npm test
```

### 2. Run Linting
```bash
npm run lint
```

### 3. Run Development Servers
```bash
# Frontend (Vite)
npm run dev

# Backend (Express API)
cd task-manager-api
npm start
```

### 4. Docker Compose Orchestration
```bash
docker compose up --build
```

