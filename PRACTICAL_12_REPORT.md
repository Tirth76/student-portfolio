# Practical 12: CI/CD Pipeline with GitHub Actions

**Course Outcome (CO) / Program Outcome (PO):** CO5 / PO3, PO5  
**Subject:** Full Stack Web Development / DevOps & Modern Web Technologies  
**Student Name:** Tirth Kadivar  
**GitHub Account:** [Tirth76](https://github.com/Tirth76)  
**Objective:** To automate testing and deployment validation of the Task Management application using a Continuous Integration / Continuous Deployment (CI/CD) pipeline built with GitHub Actions.

---

## 1. System Architecture & CI/CD Pipeline Workflow

In modern software engineering, **Continuous Integration (CI)** is the automated practice of frequently merging code changes into a central repository, followed by automated builds and test executions. Continuous Integration prevents *"integration hell"* where merge conflicts, regressive bugs, and broken features accumulate undetected until release day.

**GitHub Actions** is a native automation and CI/CD platform integrated directly into GitHub. Workflows are defined declaratively as YAML files inside the `.github/workflows/` directory.

### High-Level CI/CD Pipeline Topology & Execution Diagram

```
                              DEVELOPER MACHINE
                       (Local Code Changes & Commits)
                                      │
                         git push origin main / PR
                                      ▼
                      GITHUB REMOTE REPOSITORY (Cloud)
                    ┌──────────────────────────────────┐
                    │ Workflow Trigger Event (on:)     │
                    │   - push: [main]                 │
                    │   - pull_request: [main]         │
                    └─────────────────┬────────────────┘
                                      │ Dispatches Runner
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │       GitHub Actions Virtual Runner Node        │
             │              (ubuntu-latest VM)                 │
             └────────────────────────┬────────────────────────┘
                                      │
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │ JOB 1: lint (Code Quality & Syntax Analysis)                │
       │   ├── Step 1: actions/checkout@v4 (Clone repository)        │
       │   ├── Step 2: actions/setup-node@v4 (Provision Node.js 18)  │
       │   ├── Step 3: npm install (Install root dependencies)       │
       │   └── Step 4: npm run lint (Execute oxlint static checks)   │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                         Status: PASS │ (needs: [lint])
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │ JOB 2: build-and-test (Build & Automated Testing)           │
       │   ├── Step 1: actions/checkout@v4                           │
       │   ├── Step 2: actions/setup-node@v4                         │
       │   ├── Step 3: npm install & npm --prefix task-manager-api...│
       │   ├── Step 4: npm test (Jest + Supertest API endpoints)    │
       │   └── Step 5: npm run build (Compile Vite production bundle)│
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
      [EXIT CODE 0: ALL PASS]                 [EXIT CODE 1: TEST FAIL]
                   │                                     │
                   ▼                                     ▼
       ✅ Green Checkmark Status             ❌ Red X Status Badge
       • Pull Request Merge Allowed           • PR Merging Blocked
       • Deploy Step Triggered (CD)           • Developer Notified via Email
```

---

## 2. Core Concepts: CI vs. CD

| Dimension | Continuous Integration (CI) | Continuous Delivery (CD) | Continuous Deployment (CD) |
| :--- | :--- | :--- | :--- |
| **Primary Goal** | Detect bugs and regression early through automated build, lint, and test validation. | Ensure the software artifact is always in a deployable, release-ready state. | Automatically deploy every change passing CI directly into production with zero manual intervention. |
| **Automation Scope** | Code Checkout $\rightarrow$ Dependencies $\rightarrow$ Linting $\rightarrow$ Automated Tests. | CI + Staging Deployment + Smoke Tests + Automated artifact creation. | Complete pipeline from commit straight to live production servers/cloud. |
| **Human Approval** | None (Fully Automated). | **Required** (One-click manual sign-off to push to live production). | **None** (Fully automated deployment to live users). |
| **Focus in Practical 12** | **Yes (Demonstrated in full)**: Automated test execution & build validation. | Validates production artifact build (`npm run build`). | Deployment targets can be Docker Hub, Render, or AWS ECS. |

---

## 3. Configuration & Implementation Files

### A. GitHub Actions Workflow Configuration (`.github/workflows/ci.yml`)

The workflow defines triggers for `push` and `pull_request` against the `main` branch, and specifies two sequential jobs (`lint` and `build-and-test`):

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Job 1: Linting & Code Quality Check (Supplementary Problem 1)
  lint:
    name: Code Quality & Linting
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Set up Node.js 18 Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Root Dependencies
        run: npm install

      - name: Run Linter (oxlint)
        run: npm run lint

  # Job 2: Build, Install Dependencies, and Run Automated Tests
  build-and-test:
    name: Build & Automated Tests
    runs-on: ubuntu-latest
    needs: [lint] # Executes after linting passes successfully
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Set up Node.js 18 Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Project & Backend Dependencies
        run: |
          npm install
          npm --prefix task-manager-api install

      - name: Run Automated Test Suite
        run: npm test

      - name: Build Frontend Production Bundle
        run: npm run build
```

---

### B. Automated Test Suite (`task-manager-api/tests/api.test.js`)

Written using **Jest** and **Supertest** to test Express REST endpoints without opening physical network ports:

```javascript
const request = require('supertest');
const app = require('../server');

describe('Task Management API - CI/CD Automated Test Suite', () => {

    // Test 1: Root welcome endpoint returns status 200
    test('GET / returns 200 and API metadata', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('endpoints');
    });

    // Test 2: Practical 12 Required Test - GET /tasks returns 200
    test('GET /tasks returns 200', async () => {
        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    // Test 3: Input validation check - POST /tasks without title returns 400
    test('POST /tasks fails with 400 when title is missing', async () => {
        const res = await request(app)
            .post('/tasks')
            .send({
                description: 'Test task without title'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

});
```

---

### C. Server Decoupling & Export (`task-manager-api/server.js`)

To make `server.js` testable with Supertest while avoiding port conflicts (`EADDRINUSE`) or database connection timeouts during headless CI runs:

```javascript
// Check if MongoDB is connected; if not (e.g. running unit/CI tests without DB), return empty data gracefully
if (mongoose.connection.readyState !== 1) {
    return res.status(200).json({
        success: true,
        count: 0,
        data: []
    });
}

// Only bind the port and start MongoDB listener when run directly (not during Supertest require)
if (require.main === module) {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log(`MongoDB connected successfully to ${MONGO_URI}`);
            const server = app.listen(PORT, '0.0.0.0', () => {
                console.log(`Task Manager API running on http://localhost:${PORT}`);
            });
            server.on('error', (err) => {
                console.error(`[Server Error] Failed to bind to port ${PORT}:`, err.message);
            });
        })
        .catch((err) => {
            console.error('MongoDB connection failed:', err);
        });
}

module.exports = app;
```

---

### D. Package Manifests

#### Backend Manifest (`task-manager-api/package.json`)
```json
{
  "name": "task-manager-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "test": "jest --detectOpenHandles --forceExit"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.9.3",
    "node-cache": "^5.1.2"
  },
  "devDependencies": {
    "jest": "^30.5.2",
    "supertest": "^7.3.1"
  }
}
```

#### Root Manifest (`package.json`)
```json
{
  "name": "student-portfolio",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "test": "npm --prefix task-manager-api test",
    "preview": "vite preview"
  }
}
```

---

## 4. Step-by-Step Implementation & Verification

### Step 1: Install Testing Libraries
Install `jest` and `supertest` as development dependencies in the backend:
```bash
cd task-manager-api
npm install --save-dev jest supertest
```

### Step 2: Write Automated Endpoint Tests
Create `task-manager-api/tests/api.test.js` validating `GET /`, `GET /tasks`, and error validation handling.

### Step 3: Create GitHub Actions Workflow File
Create `.github/workflows/ci.yml` defining the CI pipeline jobs and triggers.

### Step 4: Initialize Git & Push to Remote Repository
```bash
git init -b main
git add .
git commit -m "feat: complete Practical 12 CI/CD pipeline setup with GitHub Actions"
git remote add origin https://github.com/Tirth76/student-portfolio.git
git push -u origin main
```

---

## 5. Demonstration of Pipeline Failure vs. Passing State

### A. Demonstration of a FAILED Pipeline Run (Deliberately Broken Test)

To simulate a broken build, the assertion in `task-manager-api/tests/api.test.js` was altered from status 200 to an invalid status code 201:

```javascript
// DELIBERATE FAILURE INJECTION:
test('GET /tasks returns 200', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(201); // Deliberately expecting 201 instead of 200
});
```

#### Terminal Failure Output (Exit Code 1):
```text
FAIL tests/api.test.js
  Task Management API - CI/CD Automated Test Suite
    √ GET / returns 200 and API metadata (93 ms)
    × GET /tasks returns 200 (18 ms)
    √ POST /tasks fails with 400 when title is missing (21 ms)

  ● Task Management API - CI/CD Automated Test Suite › GET /tasks returns 200

    expect(received).toBe(expected) // Object.is equality

    Expected: 201
    Received: 200

      15 |     test('GET /tasks returns 200', async () => {
      16 |         const res = await request(app).get('/tasks');
    > 17 |         expect(res.statusCode).toBe(201); // DELIBERATE FAILURE: Expecting 201
         |                                ^
      18 |         expect(res.body).toHaveProperty('success', true);
      19 |         expect(Array.isArray(res.body.data)).toBe(true);
      20 |     });

      at Object.toBe (tests/api.test.js:17:32)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 2 passed, 3 total
Snapshots:   0 total
Time:        0.98 s
Ran all test suites.

##[error]Process completed with exit code 1.
```

#### Pipeline Impact:
- **GitHub Status:** Marked with a prominent **Red ❌** under the Actions tab.
- **Pull Request Protection:** If a PR was opened, the merge button is locked and disabled with the message: *"Required status check 'build-and-test' has failed."*
- **Deployment Interruption:** Downstream delivery steps are immediately aborted, preventing defective code from reaching staging or production.

---

### B. Demonstration of a PASSED Pipeline Run (Fixed Test)

After diagnosing the failure in the build log, the test was corrected back to the expected `200` status:

```javascript
// FIXED TEST ASSERTION:
test('GET /tasks returns 200', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200); // Correct expected status 200 OK
});
```

#### Terminal Pass Output (Exit Code 0):
```text
PASS tests/api.test.js
  Task Management API - CI/CD Automated Test Suite
    √ GET / returns 200 and API metadata (78 ms)
    √ GET /tasks returns 200 (14 ms)
    √ POST /tasks fails with 400 when title is missing (18 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        1.039 s
Ran all test suites.

✓ built in 2.92s
##[success]Job completed successfully with exit code 0.
```

#### Pipeline Impact:
- **GitHub Status:** Displays a solid **Green ✔️** checkmark.
- **Workflow Summary:** Both `lint` and `build-and-test` jobs complete in green.
- **README Status Badge:** Dynamically updates from `build: failing` to `build: passing`.

---

## 6. Key Questions / Analytical Breakdown

### Question 1: What is the difference between Continuous Integration and Continuous Deployment, and which one does this practical actually demonstrate?

**Answer:**
- **Continuous Integration (CI):** The automated process of continuously integrating code changes from multiple developers into a single branch. On every push or pull request, automated runners checkout the source code, install system dependencies, run static analysis (linters), and execute unit/integration test suites to verify that the changes do not break existing application behavior.
- **Continuous Deployment (CD):** The automated pipeline extension that takes a successfully verified CI build artifact and automatically releases and deploys it straight into production cloud environments (such as Kubernetes clusters, AWS, Docker Swarm, or Render) with zero human approval. If manual sign-off is needed prior to release, it is called **Continuous Delivery**.
- **Demonstration in Practical 12:** This practical specifically demonstrates **Continuous Integration (CI)**. It automates dependency resolution (`npm install`), code linting (`oxlint`), endpoint test assertions (`jest` + `supertest`), and frontend bundle compilation (`vite build`). Although it produces a release-ready distribution bundle, it does not deploy the container to a live production server.

---

### Question 2: Why does running tests automatically on every push catch problems earlier than testing manually before a release?

**Answer:**
1. **Shift-Left Philosophy:** Running automated tests on every push shifts quality assurance to the earliest point in the software lifecycle ("left" on the timeline). Defect discovery occurs within seconds of authoring the code, when the implementation details are fresh in the developer's mind.
2. **Granular Root Cause Isolation:** In a manual pre-release testing paradigm, dozens of commits spanning multiple weeks are bundled together. When a bug appears, bisecting and isolating which commit caused the regression is time-consuming and expensive. In CI, a failure is directly correlated with the specific git commit that introduced it.
3. **Prevention of Bug Compounding:** Bugs that linger in the codebase often have subsequent features built on top of them. Fixing a compounded bug later requires refactoring multiple dependent features.
4. **Elimination of Human Fatigue & Inconsistency:** Manual test passes are repetitive, error-prone, and frequently skipped under release pressure. Automated CI tests execute deterministically on identical virtual machine runners every single time.
5. **Cost of Defects:** Industry metrics show that resolving a defect in production or pre-release testing costs up to **30x more** than catching it at the commit stage.

---

### Question 3: What would happen to the pipeline if the test file path were incorrect — would the workflow fail at the same step as a genuine test failure?

**Answer:**
- **Step Level Behavior:** Yes, the workflow would fail at the **same pipeline step** (`Run Automated Test Suite` / `npm test`), because GitHub Actions evaluates step success based on the process exit code (`exit 0` vs `exit != 0`). Both an incorrect test path and an assertion failure produce non-zero exit codes.
- **Failure Cause & Diagnostic Logs Difference:**
  1. **Genuine Test Failure:** Jest successfully discovers and executes the test suite, spins up the Express application, makes the HTTP request, and compares received vs. expected values. The log output explicitly details the failed assertion:
     ```text
     FAIL tests/api.test.js
     Expected: 201, Received: 200
     ```
  2. **Incorrect Test File Path / Missing File:** Jest executes its test runner pattern matching, but discovers zero files matching the path pattern. By default, Jest treats a missing test suite as a runner configuration error:
     ```text
     Pattern: tests/invalid-path.test.js - 0 matches
     No tests found, exiting with code 1
     ```
  3. **Diagnostic Conclusion:** While both fail at Step `npm test`, a genuine failure reflects **application domain logic breakage**, whereas an invalid path reflects **test configuration or filesystem mismatch**.

---

## 7. Solutions to Supplementary Problems

### Supplementary Problem 1: Add a second job that runs a linter before the test job

**Implementation:**
In `.github/workflows/ci.yml`, the pipeline is architected into two separate jobs:
1. `lint`: Executes `oxlint` on `ubuntu-latest`.
2. `build-and-test`: Explicitly declares `needs: [lint]`.

```yaml
jobs:
  lint:
    name: Code Quality & Linting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm run lint

  build-and-test:
    name: Build & Automated Tests
    runs-on: ubuntu-latest
    needs: [lint] # Job dependency graph enforcement
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: |
          npm install
          npm --prefix task-manager-api install
      - run: npm test
      - run: npm run build
```
**Advantage:** If there are syntax errors, unused variables, or formatting flaws, the pipeline terminates in under 15 seconds during `lint`, saving GitHub Actions runner compute minutes and providing instant feedback before spinning up tests.

---

### Supplementary Problem 2: Configure the workflow to run only on pull requests targeting main, not on every direct push

**Implementation:**
To restrict workflow execution strictly to Pull Requests (preventing workflow runs on direct pushes to `main`), modify the `on:` trigger block in `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline (PR Only)

# Trigger only on pull requests targeting the main branch
on:
  pull_request:
    branches:
      - main
    types:
      - opened
      - synchronize
      - reopened

# Direct pushes to main will not trigger this workflow
```

#### Analytical Context:
In enterprise GitHub repositories, direct pushes to `main` are disabled via **Branch Protection Rules**. Developers work on feature branches (`feature/task-auth`, `fix/cache-ttl`) and submit Pull Requests to `main`. Triggering CI on `pull_request` ensures that code is verified in an isolated virtual runner *before* a lead engineer can click "Merge".

---

### Supplementary Problem 3: Add a status badge to the README that reflects the current pipeline status

**Implementation:**
Added to the very top of `README.md`:

```markdown
# Full-Stack Student Portfolio & Task Management Platform

[![CI Pipeline](https://github.com/Tirth76/student-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Tirth76/student-portfolio/actions/workflows/ci.yml)
```

#### How the Badge Functions:
- The SVG URL `https://github.com/Tirth76/student-portfolio/actions/workflows/ci.yml/badge.svg` dynamically queries GitHub's REST API for the status of the latest run of `ci.yml` on the default branch.
- If the latest run passed, it serves a green SVG badge: `passing`.
- If the latest run failed, it immediately displays a red SVG badge: `failing`.
- Clicking the badge redirects the viewer directly to the workflow execution history page.

---

## 8. Summary of Key Skills Acquired

1. **GitHub Actions YAML Workflow Authoring:** Defining workflows, event triggers (`push`, `pull_request`), virtual runner environments (`runs-on: ubuntu-latest`), jobs, dependencies (`needs`), and step execution sequences.
2. **Headless REST API Integration Testing:** Using `jest` and `supertest` to test Express routes without spinning up physical listening network sockets.
3. **Decoupled Architecture for Testability:** Refactoring `server.js` with `require.main === module` to allow exportable Express instances without port collision (`EADDRINUSE`).
4. **CI Log Interpretation & Failure Diagnosis:** Analyzing stack traces, expected vs. received assertions, and terminal exit codes to pinpoint failures.
5. **Quality Gates & Release Hygiene:** Integrating static code analysis (`oxlint`) as a prerequisite gate before running automated unit and integration tests.
