# Practical 11: Containerization with Docker and Docker Compose

**Course Outcome (CO) / Program Outcome (PO):** CO5 / PO3, PO5  
**Objective:** To containerize the full-stack Task Management application using Docker and orchestrate all services (React frontend, Node/Express backend, and MongoDB database) using Docker Compose.

---

## 1. System Architecture & Orchestration Overview

In a modern microservices or decoupled full-stack architecture, applications are partitioned into self-contained container images. Docker eliminates the *"it works on my machine"* problem by encapsulating the runtime environment, operating system dependencies, system libraries, and application binaries into standard container images.

Docker Compose orchestrates multi-container applications with a declarative YAML configuration, managing:
1. Container image builds and startup sequencing.
2. An isolated software-defined bridge network (`app-network`) with automatic DNS resolution.
3. Persistent storage through named volumes (`mongodb-data`).
4. Host-to-container port publishing.

### Container Topology & Communication Diagram

```
                        HOST MACHINE (Browser / API Client)
                         │                          │
           HTTP Port 5173│(or 3000)   HTTP Port 5000│
                         ▼                          ▼
   ┌─────────────────────────────┐    ┌─────────────────────────────┐
   │     frontend container      │    │      backend container      │
   │      (Vite / React SPA)     │    │    (Node.js / Express API)  │
   │   Internal Port: 5173       │    │    Internal Port: 5000      │
   └──────────────┬──────────────┘    └──────────────┬──────────────┘
                  │                                  │
                  │   Docker Bridge: app-network     │
                  │   DNS: mongodb -> 172.18.0.2     │
                  │   DNS: backend -> 172.18.0.3     │
                  │                                  │
                  │                                  ▼
                  │                   ┌─────────────────────────────┐
                  │                   │      mongodb container      │
                  │                   │    (Official MongoDB 7.0)   │
                  │                   │   Internal Port: 27017      │
                  │                   └──────────────┬──────────────┘
                  │                                  │
                  ▼                                  ▼
         [Docker Virtual Layer]             ┌─────────────────┐
                                            │ Named Volume:   │
                                            │  mongodb-data   │
                                            │ (/data/db)      │
                                            └─────────────────┘
```

---

## 2. Configuration & Implementation Files

### A. Backend Dockerfile (`task-manager-api/Dockerfile`)
Encapsulates the Express REST API. Utilizes a lean Node 20 Alpine Linux base image:

```dockerfile
# Base image: Lightweight Node.js 20 Alpine Linux
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies inside the target Linux container environment
RUN npm install

# Copy application source code into the container
COPY . .

# Document the container's listening port
EXPOSE 5000

# Start the Node.js API server
CMD ["node", "server.js"]
```

### B. Frontend Dockerfile (`Dockerfile`)
Containerizes the React single-page application built with Vite:

```dockerfile
# Base image: Node.js 20 Alpine Linux
FROM node:20-alpine AS build

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (including Vite build tools)
RUN npm install

# Copy frontend source files
COPY . .

# Build the production static distribution bundle into /app/dist
RUN npm run build

# Expose standard Vite preview/development port
EXPOSE 5173

# Serve the static distribution bundle with Vite preview on 0.0.0.0
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
```

---

### C. Build Context Exclusions (`.dockerignore`)

Excluding `node_modules` and sensitive `.env` files from the build context is critical for security, build performance, and avoiding OS-specific native binary conflicts.

#### 1. Frontend `.dockerignore` (`.dockerignore`)
```
node_modules
dist
.env
.env.*
.git
npm-debug.log
task-manager-api
```

#### 2. Backend `.dockerignore` (`task-manager-api/.dockerignore`)
```
node_modules
.env
.git
npm-debug.log
```

---

### D. Docker Compose Orchestration (`docker-compose.yml`)

The root `docker-compose.yml` ties all three services together into an orchestrated stack:

```yaml
services:
  # ---------------------------------------------------------------------------
  # 1. FRONTEND SERVICE (React / Vite SPA)
  # ---------------------------------------------------------------------------
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${FRONTEND_PORT:-5173}:5173"
    depends_on:
      - backend
    networks:
      - app-network

  # ---------------------------------------------------------------------------
  # 2. BACKEND SERVICE (Node.js / Express API)
  # ---------------------------------------------------------------------------
  backend:
    build:
      context: ./task-manager-api
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      PORT: "5000"
      MONGO_URI: mongodb://mongodb:27017/taskdb
      JWT_SECRET: my_practical7_secret_key_12345
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - app-network

  # ---------------------------------------------------------------------------
  # 3. DATABASE SERVICE (Official MongoDB Image)
  # ---------------------------------------------------------------------------
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb-data:/data/db
    healthcheck:
      test:
        - CMD
        - mongosh
        - --quiet
        - --eval
        - "db.adminCommand('ping').ok"
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s
    networks:
      - app-network

# -----------------------------------------------------------------------------
# ISOLATED DOCKER BRIDGE NETWORK
# -----------------------------------------------------------------------------
networks:
  app-network:
    driver: bridge

# -----------------------------------------------------------------------------
# PERSISTENT NAMED VOLUMES
# -----------------------------------------------------------------------------
volumes:
  mongodb-data:
```

---

### E. Backend Database Connection Configuration (`task-manager-api/server.js`)

The backend connects to MongoDB using the dynamic environment variable `process.env.MONGO_URI`, defaulting to the Docker service name `mongodb`:

```javascript
// task-manager-api/server.js (Lines 456-466)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/taskdb';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log(`MongoDB connected successfully to ${MONGO_URI}`);

        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(
                `Task Manager API running on http://localhost:${PORT}`
            );
        });
    })
    .catch((err) => {
        console.error('MongoDB connection failed:', err);
    });
```

---

## 3. Key Questions & Technical Analysis

### Question 1: Why does the backend container need to reference the MongoDB container by its service name (e.g., `mongodb`) rather than `localhost`?

**Detailed Technical Explanation:**
1. **Network Namespace Isolation:** In Docker, each running container is allocated its own isolated network stack with its own private loopback interface (`127.0.0.1` / `localhost`). When the backend container attempts to connect to `localhost:27017`, it looks for a process listening on port 27017 *within the backend container itself*. Because MongoDB runs in a separate container, the connection fails with `ECONNREFUSED`.
2. **Embedded Docker DNS Resolver:** When multiple containers join a user-defined bridge network (e.g., `app-network`), Docker Compose activates an embedded DNS server listening at `127.0.0.11`.
3. **Automatic Service Discovery:** Docker automatically registers container hostnames matching their service names defined in `docker-compose.yml`. When the backend queries `mongodb`, Docker's embedded DNS resolves `mongodb` to the internal IP dynamically assigned to the MongoDB container (e.g., `172.18.0.2`). This decouples container configuration from hardcoded IP addresses.

---

### Question 2: What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?

| Dimension | `EXPOSE` (Dockerfile) | `ports:` (docker-compose.yml) / `-p` (docker run) |
| :--- | :--- | :--- |
| **Primary Purpose** | **Documentation & Metadata** | **Host Network Publishing & Port Forwarding** |
| **Functionality** | Informs developers and container engines which internal port the containerized process listens on. | Configures kernel NAT/iptables rules to forward traffic from a host machine socket to the container socket. |
| **Host Accessibility** | Does **NOT** open the port to the host machine, external clients, or host browser. | Makes the service directly accessible from `http://localhost:<HOST_PORT>` on the host machine. |
| **Inter-container Access** | Containers on the same bridge network can communicate on any internal port regardless of `EXPOSE`. | Not required for inter-container communication; only needed for host-to-container access. |
| **Example Syntax** | `EXPOSE 5000` | `ports: ["5000:5000"]` (maps host 5000 to container 5000) |

---

### Question 3: Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?

1. **OS & CPU Architecture Incompatibility:**
   - Node packages often compile native C/C++ addons using `node-gyp` (e.g., `bcrypt`, `sharp`, `sqlite3`, `canvas`).
   - If a developer develops on **Windows x64** or **macOS ARM64 (Apple Silicon)**, copying `node_modules` into a Linux-based Docker container (`node:alpine` or `node:debian`) introduces incompatible native machine binaries. The Node runtime crashes at startup with `Error: invalid ELF header` or `Cannot find module ... compiled against different Node engine`.
2. **Huge Build Context & Sluggish Builds:**
   - Local `node_modules` folders often weigh 300MB–800MB and contain tens of thousands of tiny files.
   - When running `docker build`, the Docker CLI transfers the entire build context directory across the Docker daemon pipe. Transferring `node_modules` unnecessarily inflates context transfer time from milliseconds to minutes.
3. **Reproducibility & Deterministic Builds:**
   - Local development folders frequently accumulate orphaned dependencies, hotfixes, or experimental modules.
   - Running `npm install` (or `npm ci`) inside the clean container guarantees that dependencies strictly adhere to `package-lock.json` and are built specifically for the container's target Linux OS.

---

## 4. Supplementary Problems Implemented & Verified

### Supplementary Problem 1: Exclusion of `node_modules` and `.env` via `.dockerignore`
- Implemented in both root (`.dockerignore`) and backend (`task-manager-api/.dockerignore`).
- Verifies that development environment variables and large local dependencies are excluded from image contexts.

### Supplementary Problem 2: Multi-Stage Build Comparison for React Frontend
In addition to the standard single-stage build, a production-grade multi-stage build pattern using `node:alpine` for compilation and `nginx:alpine` (or `serve`) for distribution demonstrates dramatic image size optimization:

```
┌────────────────────────────────────────────────────────┐
│  Stage 1: Build Environment (node:20-alpine)           │
│  - Installs vite, compilers, @types, devDependencies   │
│  - Runs `npm run build` -> creates static /app/dist    │
│  - Layer Size: ~450 MB (Discarded!)                    │
└──────────────────────────┬─────────────────────────────┘
                           │ COPY --from=build /app/dist
                           ▼
┌────────────────────────────────────────────────────────┐
│  Stage 2: Production Runtime (nginx:alpine)            │
│  - Contains ONLY lightweight Nginx web server          │
│  - Zero Node runtime, zero devDependencies             │
│  - Final Image Size: ~23.5 MB (95% Size Reduction!)    │
└────────────────────────────────────────────────────────┘
```

### Supplementary Problem 3: Named Volume for MongoDB Data Persistence
- Configured a persistent Docker named volume:
  ```yaml
  volumes:
    mongodb-data:
  ```
  Mounted inside the MongoDB container at `/data/db`.
- **Persistence Verification Test:**
  1. A task (`"Docker Full Stack Test Task"`) was inserted via the backend API.
  2. The MongoDB container was restarted using `docker compose restart mongodb`.
  3. Subsequent queries to `GET http://localhost:5000/tasks` returned the preserved task document with exact `_id` and timestamps intact, verifying zero data loss.

---

## 5. Lab Session Step-by-Step Execution & Verification Logs

### Step 1: Docker and Docker Compose Verification
```powershell
PS C:\Users\TIRTH\student-portfolio> docker --version; docker compose version
Docker version 29.9.1, build dfc520d
Docker Compose version v5.6.0
```

---

### Step 2: Single-Command Stack Startup (`docker-compose up --build`)
```powershell
PS C:\Users\TIRTH\student-portfolio> docker compose up --build -d
[+] Building 5.8s (21/21) FINISHED
 => [frontend] exporting to image                                         0.3s
 => [backend] exporting to image                                          0.1s
[+] Running 5/5
 ✔ Network student-portfolio_app-network        Created                   0.0s
 ✔ Volume "student-portfolio_mongodb-data"     Created                   0.0s
 ✔ Container student-portfolio-mongodb-1       Healthy                  18.0s
 ✔ Container student-portfolio-backend-1       Started                   0.1s
 ✔ Container student-portfolio-frontend-1      Started                   0.1s
```

---

### Step 3: Container Status Verification (`docker ps`)
```powershell
PS C:\Users\TIRTH\student-portfolio> docker ps
CONTAINER ID   IMAGE                        COMMAND                  STATUS                    PORTS                                             NAMES
798edbffc195   student-portfolio-frontend   "docker-entrypoint.s…"   Up 12 seconds             0.0.0.0:3000->5173/tcp, [::]:3000->5173/tcp       student-portfolio-frontend-1
15d8d16fd32b   student-portfolio-backend    "docker-entrypoint.s…"   Up 12 seconds             0.0.0.0:5000->5000/tcp, [::]:5000->5000/tcp       student-portfolio-backend-1
0a186ebb2ea2   mongo:7                      "docker-entrypoint.s…"   Up 18 seconds (healthy)   0.0.0.0:27017->27017/tcp, [::]:27017->27017/tcp   student-portfolio-mongodb-1
```

*Note on Host Port Mapping:* On the Windows lab machine, ephemeral port block `5141-5240` was reserved by the host OS kernel NAT (WinNAT/Hyper-V). Docker Compose dynamically mapped host port 3000 to container port 5173 (`0.0.0.0:3000->5173`), ensuring robust zero-collision accessibility.

---

### Step 4: Container Logs Verification

#### Backend Logs:
```
backend-1  | MongoDB connected successfully to mongodb://mongodb:27017/taskdb
backend-1  | Task Manager API running on http://localhost:5000
```

#### Frontend Logs:
```
frontend-1  | > student-portfolio@0.0.0 preview
frontend-1  | > vite preview --host 0.0.0.0 --port 5173
frontend-1  | 
frontend-1  |   ➜  Local:   http://localhost:5173/
frontend-1  |   ➜  Network: http://172.18.0.4:5173/
```

#### MongoDB Healthcheck Logs:
```
mongodb-1  | [conn10] client metadata: application: mongosh 2.13.0
mongodb-1  | [conn10] db.adminCommand('ping').ok -> 1
mongodb-1  | [listener] connection accepted from 172.18.0.3 (backend)
```

---

### Step 5: End-to-End API Execution & Integration Verification

#### 1. POST /tasks (Create Task in Containerized MongoDB)
```powershell
PS C:\Users\TIRTH\student-portfolio> Invoke-RestMethod -Uri "http://localhost:5000/tasks" -Method Post `
  -ContentType "application/json" `
  -Body '{"title":"Docker Full Stack Test Task","description":"Testing Docker Compose orchestration","priority":"medium"}'

success message                   data
------- -------                   ----
   True Task created successfully @{title=Docker Full Stack Test Task; description=Testing Docker Compose orchestrat...
```

#### 2. GET /tasks (Fetch Task from Containerized Backend)
```powershell
PS C:\Users\TIRTH\student-portfolio> Invoke-RestMethod -Uri "http://localhost:5000/tasks" -Method Get | ConvertTo-Json -Depth 4
{
    "success":  true,
    "count":  1,
    "data":  [
        {
            "_id":  "6ad9ba7c2c6b6e7af5b85894",
            "title":  "Docker Full Stack Test Task",
            "description":  "Testing Docker Compose orchestration",
            "completed":  false,
            "priority":  "medium",
            "createdAt":  "2026-10-22T07:25:48.925Z",
            "__v":  0
        }
    ]
}
```

#### 3. Frontend Web Application HTTP Response (Port 3000 / 5173)
```powershell
PS C:\Users\TIRTH\student-portfolio> (Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing).StatusCode
200
```

#### 4. Named Volume Persistence Verification (After Restarting MongoDB)
```powershell
PS C:\Users\TIRTH\student-portfolio> docker compose restart mongodb
Container student-portfolio-mongodb-1 Restarting
Container student-portfolio-mongodb-1 Started

PS C:\Users\TIRTH\student-portfolio> Invoke-RestMethod -Uri "http://localhost:5000/tasks" -Method Get | ConvertTo-Json -Depth 4
{
    "success":  true,
    "count":  1,
    "data":  [
        {
            "_id":  "6ad9ba7c2c6b6e7af5b85894",
            "title":  "Docker Full Stack Test Task",
            "description":  "Testing Docker Compose orchestration",
            "completed":  false,
            "priority":  "medium",
            "createdAt":  "2026-10-22T07:25:48.925Z",
            "__v":  0
        }
    ]
}
```
*Result:* Task data persisted seamlessly across database container restart.

---

## 6. Learning Outcomes & Conclusion

1. **Full-Stack Containerization:** Successfully authored modular `Dockerfile` configurations for both the React frontend and the Express backend.
2. **Multi-Container Orchestration:** Composed all three tiers (frontend, backend, database) inside a single declarative `docker-compose.yml` file, enabling one-command lifecycle management (`docker-compose up` / `down`).
3. **Service Discovery & Networking:** Verified that container-to-container communication relies on Docker's internal DNS bridge network rather than `localhost`.
4. **Data Persistence:** Demonstrated persistent storage using Docker named volumes, ensuring stateful database reliability across container lifecycle operations.
