# PROJECT: P14 – PARKING VIOLATION TRACKER
## Full-Stack MERN Web Application with Automata Theory & Deterministic Network Routing

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Automata Theory](https://img.shields.io/badge/Automata-DFA%20%26%20Regex-green.svg)](https://en.wikipedia.org/wiki/Deterministic_finite_automaton)
[![Tests Passing](https://img.shields.io/badge/Part%20D%20Tests-17%2F17%20Passed-brightgreen.svg)](#10-part-d--testing-suite-and-verification)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-darkgreen.svg)](https://www.mongodb.com/)

---

## 1. Executive Summary & Objective

**Parking Violation Tracker (P14)** is a comprehensive, production-grade, responsive full-stack MERN web application engineered for municipal parking wardens, regional enforcement handlers, and traffic division dispatchers.

The system addresses three foundational engineering challenges:
1. **Automata Theory & Computability (Part A):** Validates Karnataka vehicle registration numbers using an 11-state Deterministic Finite Automaton (DFA) $M = (Q, \Sigma, \delta, q_0, F)$ verified with 100% mathematical consensus against regular expression `^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$`, alongside a 5-state DFA for violation codes `^PV[0-9]{2}$`.
2. **Deterministic Violation Classification:** Maps every accepted report into exactly five predefined categories (**No-Permit**, **Overstay**, **Wrong-Zone**, **Obstruction**, and **Disabled-Bay**) with strict deterministic tie-breaker priority weighting to prevent arbitrary categorization.
3. **Computer Networks & Routing (Part B):** Dispatches violation packets deterministically across **six territorial enforcement zones** using the vehicle plate's first 4 characters (`KA01` to `KA06`) as the routing key. Manages handler availability, maximum workloads, automatic failover to designated reserve backup wardens, priority-based queue scheduling (Critical $\to$ High $\to$ Normal, FIFO), and central fallback escalation.

---

## 2. Technology Stack

### Frontend
- **Framework:** React.js 18 (Vite 6)
- **Styling:** Modern Clean CSS Design System (`#0f172a` Dark Navy Sidebar, Light Grey `#f8fafc` Canvas, Blue Buttons `#2563eb`, Green `#16a34a` for Resolved, Orange `#f59e0b` for Pending, Red `#ef4444` for Critical)
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios with centralized interceptors
- **Visual Analytics:** Recharts (Bar Charts, Line/Area Charts, Pie & Donut Charts)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js v24 (ES Modules)
- **Framework:** Express.js 4 REST APIs
- **Database:** MongoDB & Mongoose ORM
- **In-Memory Zero-Config Engine:** Embedded `mongodb-memory-server` fallback for instant out-of-the-box execution when standalone MongoDB service is absent
- **Middleware:** CORS, Morgan HTTP logger, Dotenv

### Academic & Verification Tools
- **Python Demonstration:** Standalone `dfa_validation.py` script demonstrating Part A Automata Theory DFA & Regex validation.
- **Automated CLI Runner:** `backend/test-runner-cli.js` executing all 17 documented test cases.

---

## 3. Project Directory Structure

```
parking-violation-tracker/
├── package.json                         # Root project scripts & metadata
├── README.md                            # Complete technical documentation & architecture
├── dfa_validation.py                    # Standalone Python DFA & Regex demonstration
│
├── backend/
│   ├── package.json                     # Backend dependencies & scripts
│   ├── test-runner-cli.js               # CLI test suite executing Part D 17 tests
│   ├── .env                             # Active environment configuration
│   ├── .env.example                     # Sample environment template
│   └── src/
│       ├── config/
│       │   └── db.js                    # MongoDB connection with MongoMemoryServer fallback
│       ├── models/
│       │   ├── Report.js                # Report schema (19 fields, validations, indexes)
│       │   ├── Handler.js               # Handler schema (depots, workload, capacity)
│       │   ├── RoutingRule.js           # Territorial routing key & backup rules
│       │   └── ActivityLog.js           # Comprehensive status change audit trail
│       ├── utils/
│       │   ├── automataValidator.js     # DFA & Regex JS engines with transition tracing
│       │   ├── classifier.js            # 5-category deterministic classification engine
│       │   ├── router.js                # Part B deterministic 6-zone routing & dispatch
│       │   └── testRunner.js            # 17 documented unit & integration test cases
│       ├── controllers/
│       │   ├── reportController.js      # CRUD, lifecycle advancement, audit logging
│       │   ├── validationController.js  # Live DFA & Regex validation endpoints
│       │   ├── routingController.js     # Routing matrix, live simulation, fallback queue
│       │   ├── handlerController.js     # Warden management, availability toggles
│       │   └── analyticsController.js   # Aggregations for trends, categories, zones
│       ├── routes/
│       │   ├── reportRoutes.js
│       │   ├── validationRoutes.js
│       │   ├── routingRoutes.js
│       │   ├── handlerRoutes.js
│       │   └── analyticsRoutes.js
│       ├── seeds/
│       │   └── seedData.js              # Baseline handlers, rules, and sample reports
│       └── server.js                    # Express application entrypoint
│
└── frontend/
    ├── package.json                     # Frontend dependencies (React, Vite, Recharts)
    ├── vite.config.js                   # Vite config with backend API proxy
    ├── index.html                       # HTML5 entrypoint with Google Fonts
    └── src/
        ├── main.jsx                     # React root mount
        ├── App.jsx                      # App router & shell layout
        ├── index.css                    # Professional administrative design system
        ├── api/
        │   └── index.js                 # Central Axios API client
        ├── components/
        │   ├── Navbar.jsx               # Top header with health indicators
        │   ├── Sidebar.jsx              # Dark navy sidebar navigation
        │   ├── StatusBadge.jsx          # Color-coded report status indicators
        │   ├── PriorityBadge.jsx        # Urgency badges (Normal, High, Critical)
        │   ├── CategoryBadge.jsx        # 5-category visual badges
        │   └── DfaVisualizerModal.jsx   # Interactive DFA transition graph modal
        └── pages/
            ├── LandingPage.jsx          # Hero portal, key stats, architecture highlights
            ├── ReportSubmissionPage.jsx # Live DFA/Regex plate validation & submit form
            ├── UserDashboard.jsx        # Search, filters, reports table, audit modal
            ├── HandlerDashboard.jsx     # Warden console, duty toggle, workload meter
            ├── RoutingDashboard.jsx     # 6-zone matrix, dispatch simulator, fallback queue
            ├── AnalyticsDashboard.jsx   # Recharts line, bar, pie, and workload charts
            ├── AutomataTheoryDemoPage.jsx # Interactive DFA stepper & formal tuple explorer
            └── TestingPage.jsx          # Live runner for 17 documented test cases
```

---

## 4. Part A – Automata Theory & Computability

### 4.1 Karnataka Vehicle Plate Format
- **Format:** `[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}`
- **Examples:**
  - `KA03AB1234`: **Valid** (2-letter series)
  - `KA05C5678`: **Valid** (1-letter series)
  - `KA03A1234`: **Valid** (1-letter series)
  - `K03AB1234`: **Invalid** (Single state letter)
  - `KA3AB1234`: **Invalid** (1 digit in district code)
  - `KA03AB123`: **Invalid** (Only 3 serial digits)

### 4.2 Formal DFA Definition: $M = (Q, \Sigma, \delta, q_0, F)$
- **States $Q$:** $\{q_0, q_1, q_2, q_3, q_4, q_5, q_6, q_7, q_8, q_9, q_{10}, q_{dead}\}$
- **Alphabet $\Sigma$:** $\{A-Z, 0-9\}$
- **Start State:** $q_0$
- **Accepting States $F$:** $\{q_{10}\}$
- **Transition Function $\delta$:**
  - $\delta(q_0, [A-Z]) \to q_1$ (State letter 1)
  - $\delta(q_1, [A-Z]) \to q_2$ (State letter 2)
  - $\delta(q_2, [0-9]) \to q_3$ (District digit 1)
  - $\delta(q_3, [0-9]) \to q_4$ (District digit 2)
  - $\delta(q_4, [A-Z]) \to q_5$ (Series letter 1)
  - $\delta(q_5, [A-Z]) \to q_6$ (Series letter 2)
  - $\delta(q_5, [0-9]) \to q_7$ (Single-letter branch: 1st digit of 4-digit serial)
  - $\delta(q_6, [0-9]) \to q_7$ (Two-letter branch: 1st digit of 4-digit serial)
  - $\delta(q_7, [0-9]) \to q_8$ (Serial digit 2)
  - $\delta(q_8, [0-9]) \to q_9$ (Serial digit 3)
  - $\delta(q_9, [0-9]) \to q_{10}$ (Serial digit 4 – **Accepting State**)
  - Any unauthorized input or extra characters transition to $q_{dead}$.

### 4.3 Violation Code DFA: $M_v = (S, \Sigma_v, \delta_v, s_0, F_v)$
- **Format:** `PV` followed by exactly two digits (`PV[0-9]{2}`)
- **States:** $\{s_0, s_1, s_2, s_3, s_4, s_{dead}\}$
- **Transitions:**
  - $\delta_v(s_0, 'P') \to s_1$
  - $\delta_v(s_1, 'V') \to s_2$
  - $\delta_v(s_2, [0-9]) \to s_3$
  - $\delta_v(s_3, [0-9]) \to s_4$ (**Accepting State**)
  - Additional characters transition to $s_{dead}$.

---

## 5. Five-Category Violation Classification

Every valid violation is mapped deterministically to one of five predefined categories:

| Code | Violation Title | Category | Severity | Default Urgency | Priority Rank |
|---|---|---|---|---|---|
| **PV01** | Parked without valid parking permit or ticket | **No-Permit** | LOW | Normal | Rank 5 |
| **PV02** | Unauthorized commercial parking in private bay | **No-Permit** | MEDIUM | Normal | Rank 5 |
| **PV03** | Forged, defaced, or expired permit decal | **No-Permit** | MEDIUM | High | Rank 5 |
| **PV04** | Meter expired parking (under 2 hours) | **Overstay** | LOW | Normal | Rank 4 |
| **PV05** | Extended overstay in restricted bay (> 2 hours) | **Overstay** | MEDIUM | High | Rank 4 |
| **PV06** | Overnight unauthorized parking in day-only zone | **Overstay** | MEDIUM | Normal | Rank 4 |
| **PV07** | Residential permit parked in commercial bay | **Wrong-Zone** | MEDIUM | Normal | Rank 3 |
| **PV08** | Heavy commercial vehicle in residential zone | **Wrong-Zone** | HIGH | High | Rank 3 |
| **PV09** | Government / Consular reserved bay infringement | **Wrong-Zone** | HIGH | Critical | Rank 3 |
| **PV10** | Blocking emergency fire lane or fire hydrant | **Obstruction** | CRITICAL | Critical | Rank 2 |
| **PV11** | Double parking blocking active traffic lane | **Obstruction** | CRITICAL | Critical | Rank 2 |
| **PV12** | Blocking pedestrian walkway or bicycle lane | **Obstruction** | HIGH | High | Rank 2 |
| **PV13** | Parking in handicap bay without disability badge | **Disabled-Bay** | CRITICAL | Critical | Rank 1 (Highest) |
| **PV14** | Obstructing wheelchair ramp or tactile paving | **Disabled-Bay** | CRITICAL | Critical | Rank 1 (Highest) |
| **PV15** | Fraudulent use of disabled patron badge | **Disabled-Bay** | CRITICAL | Critical | Rank 1 (Highest) |

### Deterministic Priority Rule
When conflicting conditions occur, the system resolves priority hierarchically:
$$\text{Disabled-Bay (Rank 1)} \succ \text{Obstruction (Rank 2)} \succ \text{Wrong-Zone (Rank 3)} \succ \text{Overstay (Rank 4)} \succ \text{No-Permit (Rank 5)}$$
Unrecognized violation codes (e.g., `PV99`) are **never silently assigned** to a valid category; they are strictly flagged with `error: UNKNOWN_VIOLATION_CODE`.

---

## 6. Part B – Computer Networks and Routing

### 6.1 Enforcement Zones and Routing Keys

The vehicle registration number's first 4 characters act as the **Routing Key**:

| Routing Key | Enforcement Zone | Territorial Area | Central Enforcement Depot |
|---|---|---|---|
| **KA01** | **Zone 1** | Central Business District (CBD - MG Road / Brigade Road) | CBD Central Depot #1 |
| **KA02** | **Zone 2** | Bengaluru West (Rajajinagar / Malleshwaram) | West Zone Depot #2 |
| **KA03** | **Zone 3** | Bengaluru East (Indiranagar / Whitefield Tech Corridor) | East Zone Tech Depot #3 |
| **KA04** | **Zone 4** | Bengaluru North (Yeshwanthpur / Hebbal Ring Road) | North Zone Transit Depot #4 |
| **KA05** | **Zone 5** | Bengaluru South (Jayanagar / Koramangala / BTM) | South Zone Civic Depot #5 |
| **KA06** | **Zone 6** | Outer Suburbs (Electronics City / Sarjapur Expressway) | Suburban Expressway Depot #6 |

### 6.2 Deterministic Dispatch Algorithm
When a report packet arrives:
1. **Validation Check:** Verify plate and code format. Malformed inputs are rejected before routing.
2. **Key Extraction:** Extract the 4-character key (e.g., `KA01`).
3. **Territorial Lookup:** Map key to enforcement zone. If key is unknown (e.g., `KA99`), route directly to `FALLBACK_CENTRAL`.
4. **Primary Handler Eligibility:** Check if designated primary handler is `availability === true` and `currentWorkload < maximumCapacity`.
5. **Reserve Backup Failover:** If primary handler is offline or at maximum capacity, automatically select the designated backup handler.
6. **Central Fallback Escalation:** If all handlers in the zone are unavailable or at 100% capacity, escalate the report to the Central Fallback Queue with `status: Escalated` and record the full escalation rationale.
7. **Priority Queue Ordering:** Active reports waiting in queue are ordered deterministically by:
   - **Urgency Weight:** $\text{Critical (3)} > \text{High (2)} > \text{Normal (1)}$
   - **Tie-Breaker:** First-In, First-Out (FIFO) based on `submissionTimestamp`.
8. **Concurrency & Deduplication:** Enforced via MongoDB unique index on `reportId`.

---

## 7. Database Schemas (MongoDB & Mongoose)

### 1. `Reports` Collection
- `reportId`: String (Unique, Indexed)
- `reporterName`: String (Required)
- `vehicleNumber`: String (Uppercase, Required)
- `violationCode`: String (Uppercase, Required)
- `description`: String
- `location`: String (Required)
- `urgency`: Enum (`Normal`, `High`, `Critical`)
- `category`: Enum (`No-Permit`, `Overstay`, `Wrong-Zone`, `Obstruction`, `Disabled-Bay`, `Unclassified`)
- `validationStatus`: Enum (`VALID`, `INVALID`, `FLAGGED`)
- `validationMethod`: Enum (`DFA`, `REGEX`, `HYBRID_AGREEMENT`)
- `routingKey`: String (`KA01`–`KA06`)
- `zone`: String (`Zone 1`–`Zone 6`)
- `priority`: Enum (`Normal`, `High`, `Critical`)
- `handlerId`: String (References `Handler.handlerId` or `FALLBACK_CENTRAL`)
- `handlerName`: String
- `status`: Enum (`Pending`, `Assigned`, `In Progress`, `Resolved`, `Escalated`, `Rejected`)
- `routingDecision`: String (Audit explanation)
- `escalationReason`: String (Nullable)
- `submissionTimestamp`: Date (Indexed)
- `resolvedTimestamp`: Date (Nullable)

### 2. `Handlers` Collection
- `handlerId`: String (Unique, Indexed)
- `name`: String (Required)
- `zone`: String (Required)
- `team`: String (Required)
- `branch`: String (Required)
- `depot`: String (Required)
- `availability`: Boolean (Default: `true`)
- `maximumCapacity`: Number (Default: 5)
- `currentWorkload`: Number (Default: 0)
- `isBackup`: Boolean (Default: `false`)
- `contactNumber`: String

### 3. `RoutingRules` Collection
- `routingKey`: String (Unique, Required)
- `zone`: String (Required)
- `zoneName`: String
- `primaryHandler`: String
- `backupHandlers`: [String]
- `priorityRules`: Object (`criticalEscalation`, `maxQueueWaitMinutes`, `autoDispatchBackup`)

### 4. `ActivityLogs` Collection
- `reportId`: String (Indexed)
- `action`: Enum (`SUBMITTED`, `VALIDATED`, `ROUTED`, `STATUS_CHANGE`, `BACKUP_DISPATCHED`, `ESCALATED_FALLBACK`, `PRIORITY_OVERRIDE`, `RESOLVED`, `REJECTED`)
- `previousStatus`: String
- `newStatus`: String
- `performedBy`: String
- `timestamp`: Date
- `remarks`: String

---

## 8. REST API Endpoints

### Reports
- `POST /api/reports` – Submit, validate, classify, and route a new report
- `GET /api/reports` – Get paginated reports with search and multi-criteria filters
- `GET /api/reports/:id` – Get single report details with activity audit log trail
- `PUT /api/reports/:id/status` – Update report lifecycle status with workload adjustment
- `DELETE /api/reports/:id` – Delete report and safely decrement handler workload

### Validation (Part A)
- `POST /api/validate/vehicle` – Validate vehicle plate with DFA trace & regex agreement
- `POST /api/validate/violation` – Validate violation code with DFA trace & category preview

### Routing & Queues (Part B)
- `GET /api/routing` – Retrieve complete 6-zone matrix, handlers, and capacities
- `POST /api/routing/dispatch` – Dry-run simulate dispatch decision for any vehicle plate
- `GET /api/routing/queue` – Priority-ordered active queue and central fallback queue

### Handlers
- `GET /api/handlers` – List all wardens and workload metrics
- `POST /api/handlers` – Register new handler
- `PUT /api/handlers/:id` – Update handler availability or maximum capacity
- `GET /api/handlers/:id/reports` – Get reports assigned to a specific handler

### Analytics
- `GET /api/analytics/summary` – Summary KPI counts
- `GET /api/analytics/categories` – 5-category distribution
- `GET /api/analytics/zones` – 6-zone breakdown
- `GET /api/analytics/daily` – Daily violation and resolution trends
- `GET /api/analytics/workload` – Handler capacity utilization

### Verification
- `GET /api/test-suite` – Run all 17 documented test cases live

---

## 9. User Interface & Pages

1. **Landing Page (`/`):** Hero banner, real-time KPI counter cards, architectural pillar overview, quick navigation CTA.
2. **Report Submission Page (`/submit`):** Form with live debounced DFA/Regex validation, inline error indicators, category auto-detection, zone routing preview, and modal DFA transition graph stepper.
3. **User Dashboard (`/dashboard`):** 5-lifecycle summary metrics, search bar, multi-parameter filters (Category, Zone, Priority, Status), responsive records table, and detailed report modal with complete activity history.
4. **Handler Dashboard (`/handlers`):** Warden console, handler switcher, live workload progress bar against capacity, on-duty/off-duty availability toggle, and quick status progression buttons (`Pending` $\to$ `Assigned` $\to$ `In Progress` $\to$ `Resolved`).
5. **Routing Management Dashboard (`/routing`):** 6 enforcement zones cards, live dispatch simulator, central fallback queue inspector, and full roster table with availability toggles.
6. **Analytics Dashboard (`/analytics`):** Recharts visualization including daily activity trend line chart, 5-category distribution bar chart, 6-zone distribution bar chart, priority split donut chart, and handler workload utilization chart.
7. **Automata Theory Demo Page (`/automata`):** Interactive sandbox for Part A showing transition functions $\delta(q, c) \to q'$ step-by-step with state nodes and preset test buttons.
8. **Testing Page (`/testing`):** Part D test suite console with live 1-click execution, summary pass rates, category filtering, and Markdown report export.

---

## 10. Part D – Testing Suite and Verification

The system includes **17 documented test cases** covering every functional requirement. All 17 tests execute with **100% pass rate**:

| # | Test Case Name | Category | Input / Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| **01** | Valid Vehicle Number | Automata (DFA & Regex) | `KA03AB1234` | DFA State $q_{10}$, Valid=true | State $q_{10}$, Valid=true, Agreement=true | **PASS** |
| **02** | Invalid Vehicle Number | Automata (DFA & Regex) | `K03AB1234` | Rejection, DFA State $q_{dead}$ | State $q_{dead}$, Valid=false | **PASS** |
| **03** | Incomplete Vehicle Number | Automata (DFA & Regex) | `KA03AB123` | Rejection, Final State $q_9$ | Final State $q_9$, Valid=false | **PASS** |
| **04** | Valid Violation Code | Automata (DFA & Regex) | `PV01` | DFA State $s_4$, Valid=true | State $s_4$, Valid=true, Agreement=true | **PASS** |
| **05** | Invalid Violation Code | Automata (DFA & Regex) | `PV1` | Rejection, Final State $s_3$ | Final State $s_3$, Valid=false | **PASS** |
| **06** | Unknown Violation Code | Classification Engine | `PV99` | `isUnknown: true`, `Unclassified` | Flagged as unknown, not silently mapped | **PASS** |
| **07** | Correct Classification | Classification Engine | `PV13`, `PV10`, `PV01` | Disabled-Bay, Obstruction, No-Permit | Exact 5-category deterministic mapping | **PASS** |
| **08** | Conflicting Patterns | Classification Engine | `PV01` with `Disabled-Bay` | Priority escalation to Disabled-Bay | Escalated to Disabled-Bay (Rank 1) | **PASS** |
| **09** | Correct Zone Mapping | Routing & Dispatch | `KA01...`, `KA03...`, `KA06...` | Key extraction KA01, KA03, KA06 | First 4 chars extracted accurately | **PASS** |
| **10** | Unknown Routing Zone | Routing & Dispatch | `KA99ZZ9999` | Escalated to `FALLBACK_CENTRAL` | Dispatched to Central Fallback Queue | **PASS** |
| **11** | Handler Unavailable | Routing & Dispatch | Primary marked off-duty | Routed to reserve backup warden | Assigned to backup handler HND-KA04-02 | **PASS** |
| **12** | Capacity Exceeded | Routing & Dispatch | Primary at 100% workload | Primary bypassed, backup selected | Diverted to eligible reserve backup | **PASS** |
| **13** | Backup Provisioning | Handler Management | System roster inspection | Designated reserve handlers exist | Backup wardens verified in all zones | **PASS** |
| **14** | Priority Queue Ordering | Queue Scheduling | [Normal, Critical, High] queue | Ordered: Critical $\to$ High $\to$ Normal | Deterministic priority comparator passed | **PASS** |
| **15** | Report Status Update | Lifecycle Management | Advance to `Resolved` | Workload decremented, resolvedAt set | Status changed, timestamp recorded | **PASS** |
| **16** | Central Fallback Dispatch | Routing & Dispatch | All zone handlers saturated | Routed to Central Authority | Escalated with audit reason recorded | **PASS** |
| **17** | Duplicate Prevention | Database Integrity | Insert duplicate `reportId` | Blocked by unique index E11000 | Duplicate rejected cleanly | **PASS** |

---

## 11. Installation & Quick Start Guide

### Prerequisites
- Node.js v18 or higher (v24 recommended)
- Python 3.8+ (for Part A academic script)
- Optional: Standalone MongoDB (if not running, the application automatically uses embedded `MongoMemoryServer`)

### Step 1: Clone or Navigate to Project
```bash
cd C:\Users\Administrator\.gemini\antigravity\scratch\parking-violation-tracker
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### Step 3: Run Part D Test Suite
```bash
# Run 17-test verification suite
node backend/test-runner-cli.js
```

### Step 4: Run Python Part A Academic Demonstration
```bash
python dfa_validation.py
```

### Step 5: Start the Full-Stack Application
In two separate terminal windows:

**Terminal 1 – Start Backend API:**
```bash
cd backend
npm start
# Backend runs at http://localhost:5000
```

**Terminal 2 – Start Frontend UI:**
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:3000
```

Open `http://localhost:3000` in your web browser to access the complete application!
