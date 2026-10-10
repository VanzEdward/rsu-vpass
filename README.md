# RSU VPASS — Vehicle Registration and Pass Management System
**Romblon State University — Physical Assets and Security Office (PASO)**

A full-stack, enterprise-grade vehicle registration, gate clearance verification, and pass management web application built for Romblon State University. Empowers university students, faculty, employees, PASO administrators, and on-duty campus gate security guards with real-time pass issuance, gate optical scanning, and credential tracking.

---

## 🎨 Design System & Visual Identity
* **Primary University Emerald Green**: `#059669` / `#047857` / `#065f46`
* **University Gold Accent**: `#d4af37` / `#f59e0b`
* **Surface Backgrounds**: `#ffffff` / `#f8fafc` / `#f1f5f9`
* **Typography**: Modern, responsive system font stacks with monospace accents for pass numbers and vehicle plates.

---

## 🌟 Key Features by User Portal

### 1. 🎓 Student & Employee Portal (Client)
* **4-Milestone Vehicle Registration Workflow**:
  * **Milestone 1 (Application Submission)**: Multi-step registration wizard collecting driver information, vehicle specifications (Motorcycle or 4-Wheels), vehicle classification, and document uploads.
  * **Live Selfie Identity Capture**: Built-in camera integration to capture a verified selfie for official pass issuance.
  * **Milestone 2 (PASO Evaluation)**: Real-time application tracking with admin review remarks and reason feedback on declined forms. Instant edit and re-submission without re-typing.
  * **Milestone 3 (Cashier Payment Verification)**: Upload university Cashier official receipts (OR #), proof photo, and track payment validation status.
  * **Milestone 4 (Pass Active & Clearance Granted)**: Instant issuance of digital gate pass credentials upon cashier verification.
* **Official Wearable ID Pass**:
  * Digital ID badge displaying driver photo, name, school ID, classification, vehicle specs, and gate QR code.
  * **1-Click High-Resolution PNG Exporter**: Downloads a crisp 300 DPI wearable pass card ready to print or save on mobile devices.
* **Official Vehicle Pass Sticker**:
  * Authentic Canva template integration: **Student Pass (Pink theme)** and **Employee Pass (Red theme)**.
  * Automatic canvas stamping of sequential Pass Numbers (`S-001`, `E-001`), vehicle plate numbers, and gate QR code.
  * High-resolution canvas download ready for physical adhesive windshield/bumper sticker printing.
* **Enlarged Gate QR Modal**:
  * High-contrast, optical scanner display for fast gate guard scanning at campus checkpoints.
  * Option to download isolated black-and-white QR code for custom sticker printing.
* **Multi-Vehicle Pass Switcher**:
  * Switch between multiple registered vehicles under the same account with distinct passes and plate numbers.
* **Annual Pass Renewal System**:
  * Pass validity strictly synchronized for 1 Academic Year (365 days).
  * Early renewal wizard prompting for fresh identity camera verification for the upcoming academic year.
* **My Vehicles & Applications Tracking**:
  * Live status cards (`Payment Pending`, `Active Pass`, `Under Review`, `Rejected`).
  * Direct re-submission flow for returned applications.

---

### 2. 🛡️ PASO Administrator Portal
* **Executive Dashboard**:
  * Real-time metrics: Total Applications, Active Passes Issued, Visitors on Campus, Total Gate Logs.
  * Quick-access links to review queues and gate reports.
* **Application Review Queue**:
  * Tabbed management: *Pending Review*, *Under Evaluation*, *Payment Verification*, *Approved*, *Rejected*.
  * Side-by-side document modal inspecting Driver's License, OR/CR, and Live Selfie.
  * One-click Approval, Decline with custom remarks, and Cashier Receipt Verification.
  * Automatic Sequential Pass Number Generator (`S-###` for Students, `E-###` for Employees).
* **Pass Management Directory**:
  * Centralized registry of all issued student and employee vehicle passes.
  * Pass validity inspection, expiration status indicators, and credential previews.
* **Security Guard Accounts Management**:
  * Provision, update, and manage on-duty gate security guards.
  * Assign Badge IDs (`GUARD-GATE-01`), duty gate posts, shift schedules, and credentials.
* **Reports & Gate Audit Logs**:
  * Real-time audit trail of every gate scan (Entry / Exit timestamps, gate post, guard on duty).
  * Temporary visitor tracking and campus vehicle occupancy.
  * CSV/PDF export capability for institutional reporting.
* **System Settings**:
  * **Academic Year & Pass Expiration Policy**: Configure live Academic Year (e.g., `2026-2027`), 1-Year pass validity rules (365 days), and advance renewal notice window.
  * **Administrator Information & Security**: Update administrator full name, login identifier (`PASO-ADMIN-01`), official email, contact phone, and account password.
  * **Factory Reset Administrator Information**: 1-click secure reset restoring administrator credentials and profile back to university factory defaults.

---

### 3. 👮 Gate Security Guard Portal
* **Mobile Viewfinder QR Scanner**:
  * High-performance, real-time camera QR reader powered by JSQR.
  * Instant optical decoding of student, employee, and visitor pass codes.
* **Instant Database Verification**:
  * Scans pass payload (`RSU-VPASS:[PassNumber]:[PlateNumber]:[SchoolID]`) and pulls verified records from the database.
  * Displays applicant live selfie photo, driver name, student/employee status, course/unit, plate number, vehicle make/model, pass number, and validity dates.
  * Visual status banners (**ACTIVE PASS** vs **EXPIRED PASS / UNREGISTERED**).
* **Interactive Audio & Haptic Feedback**:
  * High-frequency pleasant chime and vibration on valid pass scans.
  * Low-frequency warning buzz for expired or unauthorized passes.
* **Temporary Visitor Pass Generator**:
  * Issue instant temporary guest vehicle clearance passes directly at the gate.
  * Logs visitor name, plate number, ID presented, destination office, and expected stay.
  * 1-click visitor check-out logging on departure.
* **Manual Search & Spot-Check**:
  * Fast search by plate number, pass number, or school ID for manual driver verification.
* **Duty Gate Post Selector**:
  * Seamlessly toggle duty checkpoints (Gate 1, Gate 2, Gate 3, Gate 4).

---

## 🔑 Default Demonstration Accounts

The system includes pre-seeded demonstration accounts for rapid evaluation and testing. You can use the 1-click role switcher buttons on the Login page:

| Role | Login Identifier | Default Password | Description |
| :--- | :--- | :--- | :--- |
| **PASO Admin** | `PASO-ADMIN-01` | `admin` | Full administrator privileges, review queues, and system settings. |
| **Student / Client** | `2026-00001` | `student123` | Demo student account (Juan Dela Cruz) with registered motorcycle and active pass. |
| **Security Guard** | `GUARD-GATE-01` | `guard123` | Gate security officer (Officer Santos) with active camera scanner and gate logging. |

---

## 📁 System Architecture & Directory Structure

```text
rsuv-vpass/
├── package.json                    # Root script runner and build scripts
├── README.md                       # Comprehensive system documentation
├── server/                         # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                   # MySQL connection pool with SSL support
│   ├── controllers/
│   │   ├── authController.js       # Login, register, profile updates, and admin reset
│   │   ├── vehicleController.js    # Vehicle registration, application draft, updates
│   │   ├── pasoController.js       # Reviews, pass issuance, cashier receipts, guard management
│   │   ├── passController.js       # Pass validation, renewals, visitor temporary passes
│   │   └── guardController.js      # Gate scanner verification, entry/exit logging
│   ├── database/
│   │   └── schema.sql              # Database DDL schema, tables, and seeded demo records
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT authentication validator
│   │   └── roleMiddleware.js       # Role authorization guards (CLIENT, PASO_ADMIN, GUARD)
│   ├── routes/                     # Express API endpoint definitions
│   │   ├── authRoutes.js           # /api/auth routes
│   │   ├── vehicleRoutes.js        # /api/vehicles routes
│   │   ├── pasoRoutes.js           # /api/paso routes
│   │   ├── passRoutes.js           # /api/passes routes
│   │   └── guardRoutes.js          # /api/guard routes
│   ├── .env.example                # Database and JWT configuration template
│   └── server.js                   # Main HTTP server (serves REST API & frontend build)
│
└── client/                         # React 19 + Vite + Tailwind CSS Frontend
    ├── src/
    │   ├── api/
    │   │   └── client.js           # Authenticated API request helper
    │   ├── assets/
    │   │   ├── student_pass.png    # Canva student pass background template (Pink)
    │   │   └── employee_pass.png   # Canva employee pass background template (Red)
    │   ├── components/
    │   │   ├── Navbar.jsx          # Top navigation bar with notifications and profile dropdown
    │   │   ├── Sidebar.jsx         # Navigation sidebar
    │   │   └── RsuStickerPass.jsx  # High-DPI Canva sticker canvas generator and downloader
    │   ├── context/
    │   │   ├── AuthContext.jsx     # User authentication state & session management
    │   │   └── PassContext.jsx     # Global applications, passes, settings, and multi-tab sync
    │   ├── layouts/
    │   │   ├── ClientLayout.jsx    # Client portal shell & bottom navigation bar
    │   │   ├── AdminLayout.jsx     # PASO Admin portal shell with sidebar
    │   │   └── GuardLayout.jsx     # Gate Security layout shell
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx       # Login with 1-click quick-switch role buttons
    │   │   │   └── Register.jsx    # Multi-step student/employee registration
    │   │   ├── client/
    │   │   │   ├── Dashboard.jsx   # Metrics overview, pass summary & renewal notices
    │   │   │   ├── MyVehicle.jsx   # Vehicle cards, edit/resubmit, and renewal modal
    │   │   │   ├── VehiclePass.jsx # Wearable ID Pass, Vehicle Sticker & Gate QR Modal
    │   │   │   ├── Applications.jsx# Milestone progress timeline and review remarks
    │   │   │   ├── Payments.jsx    # Cashier receipt submission and OR tracking
    │   │   │   └── Profile.jsx     # Profile management and emergency contacts
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx    # Statistics & metric cards
    │   │   │   ├── AdminApplications.jsx # Application review queue and receipt verification
    │   │   │   ├── AdminPasses.jsx       # Master directory of active issued passes
    │   │   │   ├── AdminGuards.jsx       # Security guard account provisioning
    │   │   │   ├── AdminReports.jsx      # Gate traffic audit logs & visitor logs
    │   │   │   └── AdminSettings.jsx     # Academic year policy & Admin profile reset
    │   │   └── guard/
    │   │       └── GuardScanner.jsx      # Mobile viewfinder QR scanner, visitors, audio chimes
    │   ├── App.jsx                 # Route definitions and protected route wrappers
    │   ├── index.css               # Design tokens, custom animations, and Tailwind utilities
    │   └── main.jsx                # Application root entry point
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started Locally

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MySQL Database**: Local MySQL or Cloud MySQL (Aiven / PlanetScale / Railway)

### 1. Database Setup
1. Create a MySQL database named `rsu_vpass`.
2. Execute the initialization SQL script located at:
   ```bash
   server/database/schema.sql
   ```
   *This initializes all 7 core tables and seeds demonstration records.*
3. Copy `server/.env.example` to `server/.env` and update your database credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=rsu_vpass
   DB_SSL=false
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   ```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Launch the Development Environment
Run both backend and frontend servers simultaneously using the root scripts:

```bash
# Terminal 1: Start Backend Server (runs on http://localhost:5000)
npm run dev:server

# Terminal 2: Start Frontend Client (runs on http://localhost:5173)
npm run dev:client
```

Open your browser at **`http://localhost:5173`**.

---

## 🌐 Production Deployment (e.g. Render.com)

1. Push your repository to **GitHub**.
2. On **Render.com**, select **New +** → **Web Service**.
3. Connect your repository.
4. Configure service build and run commands:
   * **Environment**: `Node`
   * **Build Command**:
     ```bash
     cd client && npm install && npm run build && cd ../server && npm install
     ```
   * **Start Command**:
     ```bash
     cd server && npm start
     ```
5. In the **Environment Variables** section on Render, define:
   * `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, `JWT_SECRET`.
6. Click **Deploy Web Service**.
   * The server will compile the React production bundle into `client/dist` and serve both the API and client from a single unified service.

---

## 🛡️ License & Copyright
Developed for **Romblon State University — Physical Assets and Security Office (PASO)**.  
Main Campus, Liwanag, Odiongan, Romblon 5505.
