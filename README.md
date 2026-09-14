# RSU VPASS — Vehicle Registration and Pass Management System
**Romblon State University — Physical Assets and Security Office (PASO)**

A modern web-based vehicle registration, gate verification, and pass management system built for students, employees, PASO administrators, and university security personnel.

---

## 🎨 Color Palette & Design System
* **Primary University Green**: `#0d5c3a` / `#116b43`
* **University Gold Accent**: `#d4af37` / `#f59e0b`
* **Clean Card & Surface White**: `#ffffff` / `#f8fafc`

---

## 📁 System Architecture & Directory Structure

```text
rsuv-vpass/
├── package.json                 # Root script runner
├── .gitignore                   # Ignores node_modules, dist, .env
├── server/                      # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                # Aiven MySQL pool with SSL support
│   ├── controllers/
│   │   ├── authController.js    # Login, signup, profile
│   │   ├── vehicleController.js # Vehicle registration & applications
│   │   ├── pasoController.js    # Review, approve/reject remarks, cashier payments
│   │   ├── passController.js    # Pass generation & visitor temporary passes
│   │   └── guardController.js   # QR pass verification & entry/exit logging
│   ├── database/
│   │   └── schema.sql           # Complete SQL tables + Demo Seed Data for Aiven
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── roleMiddleware.js    # Role guards (CLIENT, PASO_ADMIN, GUARD)
│   ├── routes/                  # Express route handlers
│   ├── .env.example             # Aiven DB, JWT, and Cloudinary environment template
│   └── server.js                # Main Express server (serves API & dist in production)
│
└── client/                      # React (Vite) + Tailwind CSS Frontend
    ├── src/
    │   ├── api/client.js        # API fetch wrapper
    │   ├── context/
    │   │   └── AuthContext.jsx  # User session & role state
    │   ├── components/
    │   │   ├── Navbar.jsx       # Clean Green & Gold navigation bar
    │   │   └── Sidebar.jsx      # Client navigation (matching PRD Section 8)
    │   ├── layouts/
    │   │   ├── ClientLayout.jsx # Client layout wrapper
    │   │   ├── AdminLayout.jsx  # PASO Admin layout wrapper
    │   │   └── GuardLayout.jsx  # Gate Security layout wrapper
    │   ├── pages/
    │   │   ├── auth/Login.jsx   # Login with 1-click demo role switchers
    │   │   ├── client/
    │   │   │   ├── Dashboard.jsx   # Metrics, pass preview & notification feed
    │   │   │   ├── MyVehicle.jsx   # Vehicle list & registration modal
    │   │   │   ├── VehiclePass.jsx # Wearable Pass, Pass Sticker & QR Modal
    │   │   │   ├── Applications.jsx# Application status tracker
    │   │   │   ├── Payments.jsx    # Cashier receipt reference submission
    │   │   │   └── Profile.jsx     # Account details
    │   │   ├── admin/
    │   │   │   └── AdminDashboard.jsx # Statistics & application review queue
    │   │   └── guard/
    │   │       └── GuardScanner.jsx   # Gate QR Scanner, manual search & logs
    │   ├── App.jsx              # Router configuration
    │   ├── index.css            # Tailwind theme tokens (White, Green, Gold)
    │   └── main.jsx
    └── vite.config.js
```

---

## 🚀 Getting Started Locally

### 1. Database Setup (Aiven Cloud MySQL)
1. Open your **Aiven Console** and navigate to your MySQL service.
2. In the query console, run the SQL script located at:
   `server/database/schema.sql`
   *(This creates all 7 tables and inserts the demonstration data for Juan Dela Cruz).*
3. Create `server/.env` based on `server/.env.example` with your Aiven credentials:
   ```env
   DB_HOST=your-aiven-host.aivencloud.com
   DB_PORT=your-port
   DB_USER=avnadmin
   DB_PASSWORD=your_password
   DB_NAME=rsu_vpass
   DB_SSL=true
   JWT_SECRET=your_secret_key
   ```

### 2. Running the Development Servers

```bash
# Terminal 1: Run Backend Server (Port 5000)
npm run dev:server

# Terminal 2: Run Frontend Client (Port 5173)
npm run dev:client
```

Open your browser at `http://localhost:5173`.

---

## 🌐 Deploying to Render.com

1. Push this repository to **GitHub**.
2. On **Render.com**, click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   * **Runtime**: `Node`
   * **Build Command**: `cd client && npm install && npm run build && cd ../server && npm install`
   * **Start Command**: `cd server && npm start`
5. In the **Environment Variables** tab on Render, add the variables from `server/.env.example`:
   * `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, `JWT_SECRET`.
6. Click **Deploy Web Service**. Render will build the React frontend into `client/dist` and start the Express server, which serves both the REST API and the website on a single service!
