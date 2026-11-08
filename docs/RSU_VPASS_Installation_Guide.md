# RSU VPASS — Comprehensive System Installation & Deployment Guide
**Romblon State University • Physical Assets and Security Office (PASO)**  
*Capstone Technical Documentation & Installation Manual*

---

## 1. Executive Overview

**RSU VPASS** (Vehicle Pass and Registration Management System) is an enterprise web application designed to automate university vehicle registration, cashier receipt verification, gate pass issuance, and security gate optical QR scanning at Romblon State University.

This guide provides step-by-step instructions for installing, configuring, and deploying RSU VPASS on any laptop, desktop computer, or campus local server, suitable for:
1. **Capstone Defense & Evaluation Panels** (Demonstration and standalone evaluation).
2. **On-Premise Deployment** (Campus security gates and PASO administrative offices).
3. **Capstone Manuscript Documentation** (Chapter 3 / Chapter 4 Implementation Appendix).

---

## 2. System Architecture

The application is engineered using a modern client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (Front-End)                    │
│   React 19 • Vite • Tailwind CSS v4 • Lucide Icons • JSQR   │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP Requests / REST API     │ JSON Response
               ▼                              │
┌─────────────────────────────────────────────────────────────┐
│                 Server Layer (Back-End)                     │
│    Node.js • Express.js • JWT Authentication • Multer       │
└──────────────┬──────────────────────────────▲───────────────┘
               │ SQL Queries (SSL Encrypted)  │ Data Rows
               ▼                              │
┌─────────────────────────────────────────────────────────────┐
│                 Database Layer (Data Store)                 │
│      TiDB Cloud Serverless MySQL / Local MySQL (XAMPP)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Hardware and Software Prerequisites

Before installing the system on a new computer or laptop, ensure the following requirements are met:

### 3.1 Software Requirements
| Software Component | Minimum Version | Recommended | Purpose |
| :--- | :--- | :--- | :--- |
| **Operating System** | Windows 10/11, macOS 12+, Ubuntu 20.04+ | Windows 11 (64-bit) | Host OS |
| **Node.js** | v18.16.0 LTS | v20.x or v22.x LTS | JavaScript runtime engine |
| **npm** | v9.0.0 | v10.x+ | Package manager (bundled with Node.js) |
| **Archive Utility** | Built-in Windows ZIP | Windows Extract / 7-Zip / WinRAR | Extract project archive from Google Drive / USB |
| **Web Browser** | Chrome 90+, Edge 90+, Safari 15+ | Google Chrome (Latest) | Camera and Barcode API support |
| **Database Engine** | MySQL 8.0+ | TiDB Cloud Serverless / XAMPP v8.2+ | Relational data persistence |

> [!NOTE]
> To verify if Node.js is installed on the computer, open PowerShell or Command Prompt and run:
> ```bash
> node -v
> npm -v
> ```
> If not installed, download the official LTS installer from [https://nodejs.org](https://nodejs.org).

### 3.2 Minimum Hardware Requirements
* **Processor**: Dual-Core 2.0 GHz (Intel Core i3 / AMD Ryzen 3 or equivalent).
* **RAM**: 4 GB minimum (8 GB recommended for simultaneous server and multi-tab browser testing).
* **Free Storage**: At least 2.5 GB available disk space for Node modules and compiled assets.
* **Camera / Webcam**: Built-in 720p HD webcam or USB camera (required for Live Selfie Capture and Gate QR Scanner).
* **Network Adapter**: Wi-Fi or Ethernet adapter (required for cloud database access and cross-device mobile testing).

---

## 4. Step-by-Step Installation Process

Follow these steps in order when setting up the system on a new laptop or PC:

### Step 1: Download and Extract the Project Archive (Google Drive / USB)

1. **Obtain the Project Package**:
   * **Google Drive**: Download the `rsuv-vpass.zip` file from your shared Google Drive link to the target laptop or PC.
   * **USB Flash Drive**: Copy the `rsuv-vpass.zip` file (or the unzipped `rsuv-vpass` folder) directly from your USB drive to the **Desktop** or **Documents** folder.

2. **Extract the ZIP Archive (If compressed)**:
   * Right-click the downloaded `rsuv-vpass.zip` file and select **Extract All...** (or open with 7-Zip / WinRAR).
   * Specify the destination folder (e.g. `C:\Users\<YourUsername>\Desktop\rsuv-vpass`).
   * Click **Extract** and wait for the extraction to finish.

3. **Open the Terminal inside the Project Folder**:
   * Open the extracted `rsuv-vpass` folder in Windows File Explorer.
   * Click the File Explorer **address bar** at the top, type `powershell` (or `cmd`), and press **Enter**.
   * *Alternatively*, open PowerShell and navigate using:
     ```bash
     cd "C:\Users\<YourUsername>\Desktop\rsuv-vpass"
     ```

---

### Step 2: Install Project Dependencies

The project contains dependencies in the root, the backend server, and the frontend client. Install them by running:

```bash
# 1. Install root workspace scripts
npm install

# 2. Install backend dependencies
cd server
npm install
cd ..

# 3. Install frontend client dependencies
cd client
npm install
cd ..
```

---

### Step 3: Configure Environment Variables (`.env`)

The server requires an environment configuration file to securely connect to the database, issue JWT authentication tokens, and configure services.

1. Navigate to the `server/` directory.
2. Locate the provided `.env.example` file.
3. Create a copy named `.env`:

```bash
# On Windows PowerShell:
Copy-Item server/.env.example server/.env
```

4. Open `server/.env` in any text editor (VS Code, Notepad, etc.) and configure the parameters:

```env
# ==============================================================
# RSU VPASS Backend Configuration
# ==============================================================
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection (TiDB Cloud Serverless MySQL or Local MySQL)
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_cluster_prefix.root
DB_PASSWORD=your_tidb_password_here
DB_NAME=rsu_vpass
DB_SSL=true

# Authentication Tokens
JWT_SECRET=rsu_vpass_super_secure_production_jwt_token_2026_key
JWT_EXPIRES_IN=7d

# Brevo (Sendinblue) Email Service (300 Free Transactional Emails / Day)
# Note: EMAIL_FROM must be a verified sender in your Brevo console
BREVO_API_KEY=xkeysib-your_brevo_api_key_here
EMAIL_FROM=your_verified_sender_email@gmail.com
EMAIL_FROM_NAME="RSU VPASS (PASO)"
```

> [!TIP]
> **Using Local MySQL (XAMPP / WampServer / MySQL Workbench):**  
> If using a local MySQL server instead of TiDB Cloud, set:
> ```env
> DB_HOST=127.0.0.1
> DB_PORT=3306
> DB_USER=root
> DB_PASSWORD=
> DB_NAME=rsu_vpass
> DB_SSL=false
> ```

---

### Step 4: Initialize the Database & Run Schema Migrations

Run the built-in database initializer to connect to MySQL, verify SSL, and automatically build all required tables (`users`, `vehicles`, `applications`, `vehicle_passes`, `verification_logs`, `system_settings`, etc.):

```bash
npm run db:init
```

**Expected Console Output:**
```
======================================================
  RSU VPASS — Cloud MySQL Database Initializer
======================================================
Connecting to: gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000
Database:     rsu_vpass
User:         your_cluster_prefix.root
SSL Enabled:  YES (Cloud Mode)
------------------------------------------------------
 Connected to MySQL successfully!
 Executing schema.sql to create tables...
 Schema executed successfully!

 Verified Tables in Database:
   - applications
   - password_resets
   - payments
   - system_settings
   - temporary_passes
   - users
   - vehicle_passes
   - vehicles
   - verification_logs

======================================================
 Cloud Database is 100% Ready for RSU VPASS!
======================================================
```

---

### Step 5: Build Frontend Production Assets

Compile the React frontend application into optimized static assets:

```bash
npm run build:client
```
*Vite will compile and output high-performance distribution assets directly to `client/dist/` in ~3–5 seconds.*

---

### Step 6: Start the Application

You can launch the system in either **Production Mode** (recommended for defense/demonstrations) or **Developer Mode**:

#### Mode A: Unified Production Server (Recommended)
This mode runs the entire system (both the Express REST API and static React frontend) through a single server on port `5000`:

```bash
npm start
```
* **System URL**: Open [http://localhost:5000](http://localhost:5000) in Google Chrome.

#### Mode B: Developer Hot-Reload Mode
This mode runs the Vite dev server with hot module reloading on port `5173` and the backend on port `5000`:

```bash
# Terminal 1 (Backend API):
npm run dev:server

# Terminal 2 (Frontend Client):
npm run dev:client
```
* **Client URL**: Open [http://localhost:5173](http://localhost:5173).

---

## 5. Cross-Device & Mobile Phone Setup (Guard Scanner & Client on Mobile)

One of the key strengths of RSU VPASS during a capstone presentation is demonstrating the **Security Guard QR Scanner** or **Client Pass Presentation** on a physical mobile phone while PASO Admin operates on the laptop.

### 5.1 Connecting from a Mobile Phone on the Same Wi-Fi
1. Ensure both the laptop (running the server) and your mobile phone are connected to the **same Wi-Fi network** or mobile hotspot.
2. Find the laptop's Local IP Address:
   * On Windows PowerShell, type:
     ```bash
     ipconfig
     ```
   * Look for `IPv4 Address` under your active Wi-Fi adapter (e.g. `192.168.1.15`).
3. Open the browser on your phone and navigate to:
   ```
   http://192.168.1.15:5000
   ```

### 5.2 Enabling Camera Access for Mobile Web Browsers
Modern mobile browsers (Chrome / Safari) require HTTPS to access phone cameras, but allow exemptions for local IP addresses:
* **In Android Google Chrome**:
  1. Open Chrome on your phone and go to: `chrome://flags`
  2. Search for: `#unsafely-treat-insecure-origin-as-secure`
  3. Enable it and type in: `http://192.168.1.15:5000`
  4. Relaunch Chrome. The Guard Scanner and Live Camera Selfie capture will now function with full camera hardware access!

---

## 6. Initial System Access & Administrative Setup

Once the system is launched, use the following procedure to set up accounts:

### 6.1 Administrator Access (PASO Admin)
* **Login URL**: [http://localhost:5000/login](http://localhost:5000/login)
* **School / Badge ID**: `PASO-ADMIN-01`
* **Default Password**: `admin`
* **Role**: `PASO_ADMIN`

*Upon logging in, you have access to:*
* Application Reviews & Document Inspector.
* Annual Academic Year Settings & Canva Sticker Theme selector.
* Security Guard Account Provisioning.
* Audit Logs & Gate Verification Records.

### 6.2 Provisioning the First Security Guard Account
Security Guard accounts are provisioned exclusively by PASO Administration to maintain campus security integrity:
1. Log in as PASO Admin.
2. Click **Security Guards** in the left sidebar navigation.
3. Click **+ Provision New Guard**.
4. Enter the officer's name (e.g., *Santos, Pedro M.*), email, contact number, and password.
5. The system automatically assigns Badge ID `GUARD-GATE-01`.
6. Click **Confirm & Register Guard**.
7. The Guard Officer can now sign in at `/login` with their Badge ID, select their active **Duty Gate Post** (Gate 1, 2, 3, or 4), and open the live viewfinder QR scanner.

### 6.3 Registering a Student / Employee Vehicle
1. Navigate to `/register` or click **"Fill Out Vehicle Gate Pass Registration Form"** on the login page.
2. Complete the personal information and upload/capture live photo.
3. Enter vehicle specifications (Plate number, make, model, color).
4. Upload Driver's License and vehicle OR/CR documents.
5. Submit application.
6. Admin approves the application, student uploads the Cashier official receipt, and PASO Admin issues the official digital pass.

---

## 7. Troubleshooting & FAQ

### Issue 1: Port 5000 is already in use (`EADDRINUSE: address already in use :::5000`)
* **Cause**: Another service or a previous instance of Node is still running in the background.
* **Resolution**:
  ```powershell
  # Windows PowerShell: Find and stop the process on port 5000
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```
  Or change `PORT=5001` inside `server/.env`.

### Issue 2: MySQL Connection Error (`getaddrinfo ENOTFOUND` or `ECONNREFUSED`)
* **Cause**: Incorrect database hostname, missing internet connection (for TiDB Cloud), or local MySQL service stopped.
* **Resolution**:
  1. Check internet connection if using TiDB Cloud MySQL.
  2. Test database connection directly using:
     ```bash
     npm run db:check
     ```
  3. Verify that `DB_SSL=true` is set when connecting to TiDB Cloud MySQL.

### Issue 3: Camera shows black screen or permission denied
* **Cause**: Browser camera permissions were dismissed or blocked.
* **Resolution**:
  1. Click the **padlock icon** or **camera icon** in the browser URL bar.
  2. Set **Camera** permission to **"Allow"**.
  3. Refresh the page.

### Issue 4: "Cannot access 'y' before initialization" Error
* **Resolution**: This issue has been fully resolved in the latest codebase. If encountered on an older build, run:
  ```bash
  npm run build:client
  ```
  And press `Ctrl + F5` in your browser to clear local cache.

---

## 8. Command Reference Summary Cheat Sheet

| Command | Working Directory | Purpose |
| :--- | :--- | :--- |
| `npm install` | Root / `server` / `client` | Installs all package dependencies |
| `npm run db:init` | Root | Connects to MySQL and builds all tables |
| `npm run db:check` | Root | Tests real-time database connection & latency |
| `npm run build:client` | Root | Compiles production React frontend assets |
| `npm start` | Root | Launches the unified production web server |
| `npm run dev:server` | Root | Starts backend server with auto-restart |
| `npm run dev:client` | Root | Starts Vite client dev server with HMR |
| `npm run logs:errors` | Root | Displays the latest backend server error logs |

---

*RSU VPASS Technical Manual • Developed for Romblon State University Physical Assets & Security Office (PASO).*

