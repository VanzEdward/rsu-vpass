# RSU VPASS — Complete System Demo & Quick Walkthrough Guide
**Romblon State University • Physical Administration & Security Office (PASO)**  
*Web-Based Vehicle Registration & Automated QR Pass Gate Access Control System*

---

## 📌 1. System Overview & Architecture

RSU VPASS is a unified campus mobility and vehicle security management platform built for **Romblon State University**. It connects three interconnected roles through a centralized cloud database (**Aiven MySQL**):

```
 ┌──────────────────────┐      ┌─────────────────────────┐      ┌──────────────────────────┐
 │    Client Portal     │      │   PASO Administration   │      │    Security Guard Gate   │
 │ (Students/Employees) │      │  (Review & Management)  │      │   (Live Scanner Outpost) │
 └──────────┬───────────┘      └────────────┬────────────┘      └────────────┬─────────────┘
            │                               │                                │
            └───────────────────────┬───────┴────────────────────────────────┘
                                    ▼
                    ┌───────────────────────────────┐
                    │  Cloud REST API & Aiven MySQL │
                    │   (Persistent Storage & Auth) │
                    └───────────────────────────────┘
```

---

## 🔑 2. Demo User Credentials & Access

Use these default credentials to quickly test all three distinct roles in the application:

| Role | Portal URL | Username / Identifier | Default Password | Initial Setup / Note |
| :--- | :--- | :--- | :--- | :--- |
| **PASO Admin** | `/login` | `PASO-ADMIN-01` | `admin` | Full administrative review, stats, and pass management |
| **Gate Guard** | `/login` | `GUARD-GATE-01` | `guard` | Prompts for **Shift Gate Selection** upon sign in (Gate 1, 2, etc.) |
| **Client (Student/Staff)**| `/login` or `/register`| *Self-Registered School ID* | *User-Created* | Or click **"Quick Demo: Student"** on login screen |

---

## 🎬 3. End-to-End System Demonstration Flow

Follow this 3-act sequence for a comprehensive presentation or live thesis demonstration:

```
[ ACT 1: Client Portal ] ──► [ ACT 2: PASO Admin Portal ] ──► [ ACT 3: Guard Gate Portal ]
  • Register & Login           • Review Applicant               • Station at Gate Post
  • Submit Vehicle & Docs      • Inspect OR/CR & Selfie         • Scan QR Pass with Camera
  • Live Camera Selfie         • One-Click Approval             • Trigger Entry / Exit
  • Receive Issued QR Pass     • Pass Issued to Cloud DB        • Issue Visitor Day Pass
```

---

### 🟢 ACT 1: Client Portal (Student & Employee Experience)

#### Step 1.1: Registration & Login
1. Navigate to the **Login** screen (`/login`).
2. If creating a new account, click **"Create an account"** (`/register`):
   - Enter Full Name, University School ID, Institutional Email, Phone Number, and Classification (**Student** or **Employee / Faculty**).
3. Sign in to access the **Client Dashboard** (`/client/dashboard`).

#### Step 1.2: Registering a Vehicle & Milestone Application
1. Click **"Register Vehicle"** or navigate to **Applications** (`/client/applications`).
2. Complete the multi-step vehicle application form:
   - **Vehicle Details**: Plate Number (e.g., `123 VPN` or `MV-45892`), Vehicle Make & Model (e.g., *Yamaha Aerox 155* / *Toyota Vios*), Vehicle Type (*Motorcycle, Sedan, SUV, Van*), and Color.
   - **Document Uploads**: Official Receipt (OR), Certificate of Registration (CR), and Driver's License photo.
   - **Live Applicant Selfie Capture**: Click **"Open Camera"** to take an instant verification selfie. Supports **Flip Camera** (front/back camera) with automatic image compression to preserve memory on mobile devices and iPads.
   - **Emergency Contact**: Name and contact phone number.
3. Submit the application. Notice the interactive **Milestone Progress Tracker**:
   - `Application Submitted` ➔ `Documents Under Review` ➔ `Approved & Verified` ➔ `Digital QR Pass Issued`.

#### Step 1.3: Digital Vehicle Pass Inspection
1. Navigate to **Vehicle Pass** (`/client/vehicle-pass`).
2. Once approved by PASO, the live pass appears with:
   - Official RSU VPASS ID (e.g., `S-2026-0042` or `E-2026-0018`).
   - Dynamic high-resolution **QR Code** containing verifiable pass signatures.
   - Vehicle plate number, vehicle photo, driver name, and validity expiration date.
   - **Download / Print Pass** button for physical windshield or dashboard placement.

#### Step 1.4: Notification Bell & Sign-Out Confirmation
1. Click the **Notification Bell** icon in the navigation bar to see status updates (e.g., *"Application Approved"*).
2. Click **"Mark all as read"** — the read state persists across new tabs and sessions.
3. Click **"Sign Out"** — note the **Sign Out Confirmation Dialog** that prevents accidental clicks.

---

### 🔵 ACT 2: PASO Admin Portal (Campus Administration)

#### Step 2.1: Login as Administrator
1. Navigate to `/login`.
2. Click the quick-switch button **"PASO Admin"** or enter `PASO-ADMIN-01` / `admin`.
3. You will land on the **Admin Dashboard** (`/admin/dashboard`).

#### Step 2.2: Live Operations & Analytics
1. Observe the live KPI dashboard cards:
   - Total Registered Vehicles
   - Active Digital Passes
   - Pending Applications requiring review
   - Today's Campus Gate Access Traffic
2. Review recent gate activity logs and vehicle distribution charts.

#### Step 2.3: Application Review & Document Verification Center
1. Navigate to **Applications** (`/admin/applications`).
2. Locate the client application submitted in Act 1 (status: `PENDING`).
3. Click **"Review Application"**:
   - Inspect the applicant's driver details, department, and contact info.
   - View the uploaded **Official Receipt (OR)** and **Certificate of Registration (CR)**.
   - Inspect the **Driver's License** and **Live Applicant Selfie Photo**.
4. Click **"Approve Application"** (or specify rejection remarks if documents are deficient).
5. The system immediately creates an active digital pass in the cloud database and notifies the client.

#### Step 2.4: Pass Management & Inspect Pass
1. Navigate to **Pass Management** (`/admin/passes`).
2. Search for the approved vehicle by Plate Number (e.g., `123 VPN`).
3. Click **"Inspect Pass"**:
   - Displays the official digital pass modal with the verifiable QR code.
   - Show that administrators can inspect, print, or revoke passes if violations occur.

---

### 🛡️ ACT 3: Gate Security Guard Outpost (Campus Gate Checkpoint)

#### Step 3.1: Guard Login & Shift Gate Post Assignment
1. Log out or open a separate window/phone browser at `/login`.
2. Click **"Gate Guard"** or enter `GUARD-GATE-01` / `guard`.
3. **Shift Post Selection Modal**:
   - Guard must select their assigned campus gate (e.g., **Gate 1 - Main Campus Gate**).
   - Once confirmed, all entry and exit transactions are stamped with this gate outpost.

#### Step 3.2: Live Camera QR Scanner
1. On the **Scanner** tab (`/guard/scanner`), click **"Start Scanner"**:
   - Enables the live video feed.
   - Click the **"Flip Camera"** button to alternate between back camera (for vehicles) and front selfie camera.
   - Point the camera at the client's QR code from Act 1 (or use the built-in Quick Simulator buttons).
2. **Instant Verification Result**:
   - Audio beep and haptic feedback.
   - Green **"ACCESS GRANTED / PASS VERIFIED"** badge.
   - Displays driver photo, full name, School ID, vehicle model, plate number, classification, and expiration status.
3. Click **"Log Entry"** (green button) or **"Log Exit"** (blue button).
   - A success banner confirms the timestamped log has been saved to the cloud database.

#### Step 3.3: Anti-Counterfeit & Troll QR Interceptor Demo
1. Test scanning an unauthorized QR code (such as a random website URL, a YouTube/meme link, or a forged string):
   - The system intercepts the code and displays a distinct alert:
     - ⚠️ **"External Website URL Detected"**
     - ⚠️ **"External Media / Meme QR Detected (Troll Code)"**
     - ⚠️ **"Counterfeit / Unregistered RSU Format"**
   - Demonstrates that malicious or irrelevant QR codes cannot bypass gate security.

#### Step 3.4: Manual Plate Number / ID Search Fallback
1. What if a driver's phone screen is cracked or the camera is unavailable?
2. In the **Quick Plate / ID Search** bar, type the plate number: `123 VPN`.
3. Press **Enter** or click **Search**:
   - The authoritative cloud record is retrieved instantly.
   - Allows the guard to verify driver credentials and log Entry/Exit manually.

#### Step 3.5: Visitor Day Pass Issuance
1. Click the **"Visitors"** tab.
2. Click **"+ Issue Visitor Pass"**:
   - **Visitor Name**: e.g., *Engr. Marco Santos*
   - **Valid ID Presented**: Click the styled dropdown to select a recognized Philippine ID (*Driver's License (LTO), Philippine National ID, Passport, PRC ID, etc.*).
   - **Vehicle Type**: Choose from styled vehicle choices (*Motorcycle, Sedan/Hatchback, SUV, Van, etc.*).
   - **Plate Number**: e.g., *NCS 8941*
   - **Destination**: e.g., *Office of the University President / Admin Bldg*
   - **Pass Duration**: Select validity (*1 Day, 2 Days, 3 Days, 7 Days*).
3. Click **"Generate Visitor Pass"**:
   - Generates an instant temporary visitor pass with a unique QR code.
   - Automatically tracks the visitor in the **Active Visitors Inside** count.

#### Step 3.6: Active Visitors Tracking & Exiting
1. View the **Active Visitors** list under the Visitors tab:
   - Displays real-time badge count of visitors currently inside the campus.
2. When the visitor departs, click **"Log Exit"**:
   - Changes the visitor status to `EXITED` and clears them from active campus occupancy.

#### Step 3.7: Gate Verification Logs
1. Click the **"Logs"** tab.
2. Filter logs by **ALL**, **ENTRY**, or **EXIT**.
3. View the live audit trail with exact timestamps, plate numbers, driver names, vehicle classifications, and verification methods (`QR_SCAN` or `MANUAL_SEARCH`).

---

## 💡 4. Key Highlights to Emphasize in Presentations

| Feature | Engineering Benefit |
| :--- | :--- |
| **Aiven Cloud MySQL Synchronization** | All transactions across clients, administrators, and guards sync in real time without local data loss. |
| **Mobile & iPad Optimization** | High-resolution image capture includes automated compression and chunking to prevent mobile Safari quota crashes. |
| **Zero-Interruption Camera Control** | Seamless camera flipping (front/back) with hardware permission error handling and fallbacks. |
| **Security Countermeasure** | Dedicated regex-based interception of fake passes, meme links, and external URLs. |
| **Accidental Miss-Click Prevention** | Universal sign-out confirmation dialogs across all portals. |
| **Persistent Notification State** | Read/unread notification tracking retained across browser tab reloads and device re-authentications. |

---

*Document generated for RSU VPASS Project Demonstration & Evaluation Reference.*
