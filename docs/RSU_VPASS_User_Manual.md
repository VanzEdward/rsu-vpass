# ROMBLON STATE UNIVERSITY
### PHYSICAL ASSETS AND SECURITY OFFICE (PASO)
**Odiongan Main Campus, Romblon, Philippines**

---

# RSU VPASS: Automated Vehicle Pass & Campus Gate Security Management System
## OFFICIAL USER MANUAL
**Academic Years 2026–2027 • 2027–2028 • 2028–2029**

---

## Preface & System Introduction

This section provides the comprehensive user manual for the **RSU VPASS (Vehicle Pass System)** web application, designed to guide students, university faculty and staff, Physical Assets and Security Office (PASO) administrators, and campus gate security personnel in the proper use of its features and functions.

The RSU VPASS system is an institutional, multi-portal security platform that digitizes vehicle accreditation, Cashier payment verification, encrypted QR gate clearance generation, and real-time gate entry/exit access tracking across all checkpoints of Romblon State University Main Campus (Odiongan).

---

## Table of Contents

```
========================================================================================
TABLE OF CONTENTS
========================================================================================

PART I: CLIENT USER MANUAL (STUDENTS & EMPLOYEES) .............................. Page 1
   1.1  Account Registration Page .............................................. Page 2
   1.2  User Login & Authentication Page ....................................... Page 4
   1.3  Client Home Dashboard & Quick Actions ................................. Page 6
   1.4  Vehicle Registration Wizard: Step 1 (Vehicle Information) ............. Page 8
   1.5  Vehicle Registration Wizard: Step 2 (Live Photo ID Capture) ............ Page 10
   1.6  Vehicle Registration Wizard: Step 3 (OR/CR & License Upload) ........... Page 12
   1.7  Vehicle Registration Wizard: Step 4 (Review & University Pledge) ....... Page 14
   1.8  My Vehicles & Fleet Management ......................................... Page 16
   1.9  Annual Vehicle Pass In-Place Renewal ................................... Page 18
   1.10 Application Milestones & Status Tracker ................................ Page 20
   1.11 Cashier Payment & Official Receipt (OR) Proof Submission ............... Page 22
   1.12 Official Vehicle Pass View & Wearable ID PNG Download .................. Page 24
   1.13 Pure Optical Sticker QR Code Generation for Vehicle Decals ............. Page 26
   1.14 User Profile, Institutional ID & Emergency Contacts .................... Page 28

PART II: PASO ADMINISTRATOR USER MANUAL ........................................ Page 30
   2.1  Administrator Login & Security Credentials Authentication .............. Page 31
   2.2  Operational Dashboard Overview & Live KPI Metrics ...................... Page 33
   2.3  Vehicle Application Reviews & Document Xerox Inspection ................ Page 35
   2.4  Cashier Receipt Verification & Pass Issuance .......................... Page 37
   2.5  Pass Management & Annual Sticker Theme Visualizer ...................... Page 39
   2.6  Security Guard Management & Station Credential Generation ............. Page 41
   2.7  Reports, Gate Access Audit Logs & Excel Data Export .................... Page 43
   2.8  System Settings (Academic Year, Sticker Color Sets, Fees & Policy) ..... Page 45

PART III: GATE SECURITY GUARD USER MANUAL ..................................... Page 48
   3.1  Guard Login & Gate Station Assignment (Gates 1 to 4) ................... Page 49
   3.2  Mobile Live Optical QR Camera Scanner & Multi-Tone Beeps ............... Page 51
   3.3  Manual Plate & Pass Number Checkpoint Spot-Check ....................... Page 53
   3.4  Digital Temporary Visitor Pass Issuance (1 to 7 Days Stay) ............. Page 55
   3.5  Active Visitor In-Campus Stay Extension ................................ Page 57
   3.6  Real-Time Gate Station Entry / Exit Activity Stream ................... Page 59
========================================================================================
```

---

# PART I: CLIENT USER MANUAL
*(For RSU Students, Faculty, and Administrative Employees)*

---

### 1.1 Account Registration Page

```
+---------------------------------------------------------------------------------------+
|  [RSU LOGO]  ROMBLON STATE UNIVERSITY - MAIN CAMPUS (ODIONGAN)                         |
|  VEHICLE PASS REGISTRATION PORTAL                                                     |
+---------------------------------------------------------------------------------------+
|  Create Your VPASS Account                                                            |
|  Institutional credentials for students, faculty, and administrative staff            |
|                                                                                       |
|  [ Full Name: e.g. Juan Dela Cruz                 ]  [ Classification: [Student v] ] |
|  [ University ID: e.g. 2026-10492                 ]  [ Email: e.g. juan@rsu.edu.ph ] |
|  [ Contact Number: e.g. 09171234567               ]  [ Program/Dept: BS Information] |
|  [ Password: **********                           ]  [ Confirm Password: **********] |
|                                                                                       |
|  [====================== REGISTER VPASS ACCOUNT ===============================]     |
|                                                                                       |
|  Already have an account? Log In Here                                                 |
+---------------------------------------------------------------------------------------+
```

#### Purpose & Description
The Registration Page establishes an official identity for students or employees in the RSU VPASS database. It captures academic affiliation and university ID numbers to ensure only bona fide campus constituents register institutional passes.

#### Step-by-Step Instructions
1. Open your web browser and navigate to the RSU VPASS portal URL (`http://localhost:5000/register` or the deployed campus domain).
2. Enter your complete legal name in the **Full Name** field.
3. Select your institutional **Classification** from the dropdown (`Student` or `Employee`).
4. Enter your official **University ID Number** (e.g., `2026-10492` for students or `EMP-2026-0041` for employees).
5. Provide your active institutional or personal **Email Address** and a reachable **Contact Number**.
6. Enter your **Academic Department / Program** (e.g., *College of Engineering and Technology* or *CCMADI*).
7. Create a secure password (minimum 6 characters) and re-type it in the **Confirm Password** field.
8. Click **REGISTER VPASS ACCOUNT**.
9. The system validates uniqueness of your email and School ID in the database and redirects you to the login screen with a success notification.

---

### 1.2 User Login & Authentication Page

```
+---------------------------------------------------------------------------------------+
|  [SHIELD ICON]  RSU VPASS                                                              |
|  Institutional Vehicle Gate Access Control System                                     |
+---------------------------------------------------------------------------------------+
|  Sign In to Your Account                                                              |
|  Enter your authorized credentials to access your vehicle passes and gate clearances  |
|                                                                                       |
|  Identification No. or Email Address:                                                 |
|  [ e.g. 2026-10492 or student@rsu.edu.ph                                            ] |
|                                                                                       |
|  Account Password:                                                                    |
|  [ ******************                                                           (o) ] |
|                                                                                       |
|  [=========================== SIGN IN TO VPASS ====================================]   |
|                                                                                       |
|  [?] Forgot your password? Reset with OTP      |   No account? Create One Here        |
+---------------------------------------------------------------------------------------+
```

#### Purpose & Description
Authenticates users against the secure database. The system automatically inspects the assigned user role (`CLIENT`, `PASO_ADMIN`, or `GUARD`) and routes the user to their designated portal.

#### Step-by-Step Instructions
1. Navigate to `/login`.
2. Enter your registered **Email Address** or **University Identification Number** (e.g. `2026-10492`).
3. Enter your account **Password**. Click the eye icon `(o)` if you wish to verify your typed password.
4. Click **SIGN IN TO VPASS**.
5. Upon successful verification:
   - **Students & Employees** are directed to `/client/dashboard`.
   - **PASO Administrators** are directed to `/admin/dashboard`.
   - **Gate Guards** are directed to `/guard/scanner`.

---

### 1.3 Client Home Dashboard & Quick Actions

```
+---------------------------------------------------------------------------------------+
|  RSU VPASS  [Role: RSU Student]  [A.Y. 2026-2027 Active]        [Notifs (2)] [Profile] |
+---------------------------------------------------------------------------------------+
|  WELCOME BACK, JUAN DELA CRUZ!                                                        |
|  ID: 2026-10492  |  Program: BS Information Technology  |  Main Campus (Odiongan)     |
|                                                                                       |
|  [ + Register Vehicle ]  [ (o) Present Gate Pass ]  [ Track Requests ]  [ View Pass ] |
|                                                                                       |
|  +---------------------+  +----------------------+  +-------------------------------+ |
|  | MY REGISTERED FLEET |  | PENDING REQUESTS     |  | ACTIVE GATE CLEARANCES        | |
|  |        1 Vehicle    |  |    0 Under Review    |  |       1 Official VPASS        | |
|  +---------------------+  +----------------------+  +-------------------------------+ |
|                                                                                       |
|  CURRENT ACTIVE GATE CLEARANCE:                                                       |
|  +----------------------------------------------------------------------------------+ |
|  | Pass: S-001  |  Motorcycle: Honda Click 125 (Black)  |  Plate: NBM 1234          | |
|  | Academic Year: 2026-2027  |  Theme: Set 1 (Pink/Red) |  Valid Until: July 31, 2027| |
|  | [ Click to Enlarge Gate Scanner QR Code ]                                        | |
|  +----------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------+
```

#### Purpose & Description
The Client Dashboard serves as the central control deck for vehicle owners. It displays account verification badges, one-click action shortcuts, live vehicle fleet statistics, and instant access to your active gate pass.

#### Key Functions
- **Register Vehicle**: Starts the 4-step vehicle accreditation process.
- **Present Gate Pass**: Instantly pops up the dynamic high-contrast QR code for guard optical scanning at campus gates.
- **Track Requests**: Takes you directly to the 4-stage application milestone tracker.
- **Current Gate Pass Card**: Highlights your currently valid sticker credential, plate number, academic year bounds, and valid-until date.

---

### 1.4 Vehicle Registration Wizard: Step 1 (Vehicle Information)

```
+---------------------------------------------------------------------------------------+
|  RSU VEHICLE PASS APPLICATION  [Step 1 of 4: Vehicle Info]             [Auto-saving]  |
+---------------------------------------------------------------------------------------+
|  Enrolled Applicant Profile:                                                          |
|  Name: Juan Dela Cruz  |  ID: 2026-10492  |  Dept: BS Information Technology          |
|                                                                                       |
|  Plate Number / MV File No. *                  Vehicle Classification / Type *        |
|  [ NBM 1234                             ]      [ Motorcycle (Standard 2-Wheels)   v]  |
|                                                                                       |
|  Brand / Manufacturer *                        Model *                                |
|  [ Honda                                ]      [ Click 125                         ]  |
|                                                                                       |
|  Color *                                       Year Model *                           |
|  [ Matte Black                          ]      [ 2026                              ]  |
|                                                                                       |
|  [ Cancel & Close ]                                              [ Continue Step 2 ->]|
+---------------------------------------------------------------------------------------+
```

#### Purpose & Description
Step 1 captures physical vehicle specifications according to official Romblon State University PASO vehicle registration guidelines.

#### Step-by-Step Instructions
1. From the dashboard or My Vehicles, click **Register New Vehicle**.
2. Type your official LTO **Plate Number** or temporary **MV File Number** (e.g. `NBM 1234`).
   > [!NOTE]
   > The system performs automatic duplicate validation (space-insensitive and case-insensitive). If you type a plate number that already has an issued pass on your account, the wizard immediately alerts you and provides a one-click button to **Renew Existing Pass** instead of creating a duplicate entry.
3. Select your **Vehicle Classification / Type** from the dropdown menu (e.g. `Motorcycle`, `Sedan`, `SUV`, `Van`, `Pickup Truck`, etc.).
4. Enter the vehicle **Brand / Manufacturer** (e.g. *Honda*, *Yamaha*, *Toyota*).
5. Enter the **Model** (e.g. *Click 125*, *Vios*, *Aerox*).
6. Enter the registered **Color** and **Year Model**.
7. Click **Continue Step 2 ->**. All inputs are automatically preserved in local drafts.

---

### 1.5 Vehicle Registration Wizard: Step 2 (Live Photo ID Capture)

```
+---------------------------------------------------------------------------------------+
|  RSU VEHICLE PASS APPLICATION  [Step 2 of 4: Live Photo ID]            [Auto-saving]  |
+---------------------------------------------------------------------------------------+
|  APPLICANT LIVE IDENTIFICATION PHOTO                                                  |
|  Physical security policy requires a fresh live camera photo for official pass badges |
|                                                                                       |
|              +--------------------------+                                             |
|              |                          |                                             |
|              |   [ LIVE WEBCAM/PHONE    |                                             |
|              |     FACIAL CAPTURE ]     |                                             |
|              |                          |                                             |
|              +--------------------------+                                             |
|              [ (o) Take Live Camera Photo ]                                           |
|                                                                                       |
|  * High quality canvas compression (max 800x800) is applied automatically             |
|                                                                                       |
|  [ <- Previous Step ]                                            [ Continue Step 3 ->]|
+---------------------------------------------------------------------------------------+
```

#### Purpose & Description
Ensures pass authenticity and deters pass transfer by requiring a live selfie photo of the applicant. This photo is embedded on the wearable digital ID pass and displayed on the gate guard's mobile terminal upon scanning.

#### Step-by-Step Instructions
1. Click **Take Live Camera Photo**.
2. Allow your browser or mobile phone camera permission when prompted.
3. Center your face within the camera viewfinder guidelines.
4. Click the camera shutter button.
5. Review the photo preview. If clear, accept it; otherwise, click **Retake**.
6. Click **Continue Step 3 ->**.

---

### 1.6 Vehicle Registration Wizard: Step 3 (OR/CR & License Upload)

```
+---------------------------------------------------------------------------------------+
|  RSU VEHICLE PASS APPLICATION  [Step 3 of 4: Xerox / Documents]        [Auto-saving]  |
+---------------------------------------------------------------------------------------+
|  ATTACH REQUIRED VEHICLE ACCREDITATION DOCUMENTS                                      |
|  Upload clear photo/scanned Xerox copies of the following mandatory documents:        |
|                                                                                       |
|  1. Driver's License (Student / Professional / Non-Prof) *                            |
|     [ [Upload License File]  |  Status: [x] Attached (license_scan.jpg)             ] |
|                                                                                       |
|  2. Land Transportation Office (LTO) Official Receipt (OR) *                         |
|     [ [Upload LTO OR]        |  Status: [x] Attached (lto_or.jpg)                   ] |
|                                                                                       |
|  3. Land Transportation Office (LTO) Certificate of Registration (CR) *               |
|     [ [Upload LTO CR]        |  Status: [x] Attached (lto_cr.jpg)                   ] |
|                                                                                       |
|  * Files are compressed via client-side HTML5 canvas to guarantee instant upload      |
|                                                                                       |
|  [ <- Previous Step ]                                            [ Continue Step 4 ->]|
+---------------------------------------------------------------------------------------+
```

#### Purpose & Description
Collects mandatory documentary proof required by the Physical Assets and Security Office under Philippine road safety and university administrative policies.

#### Step-by-Step Instructions
1. Click **Upload License File** and select your valid Driver's License image.
2. Click **Upload LTO OR** and attach your latest annual LTO Official Receipt.
3. Click **Upload LTO CR** and attach your official Certificate of Registration.
   *(Combined OR/CR scans are accepted).*
4. Once all 3 documents show the green checkmark, click **Continue Step 4 ->**.

---

### 1.7 Vehicle Registration Wizard: Step 4 (Review & University Pledge)

```
+---------------------------------------------------------------------------------------+
|  RSU VEHICLE PASS APPLICATION  [Step 4 of 4: Review & Submit]          [Auto-saving]  |
+---------------------------------------------------------------------------------------+
|  APPLICATION SUMMARY & INSTITUTIONAL PLEDGE                                           |
|                                                                                       |
|  [Photo]  Applicant: Juan Dela Cruz (ID: 2026-10492)                                  |
|           Vehicle: Honda Click 125 (Matte Black, 2026)  |  Plate: NBM 1234            |
|           Documents: [x] Driver's License  [x] LTO OR  [x] LTO CR Attached            |
|                                                                                       |
|  +----------------------------------------------------------------------------------+ |
|  | UNIVERSITY SAFETY & TRAFFIC PLEDGE:                                              | |
|  | "I hereby pledge to obey and abide by the Romblon State University Rules         | |
|  | and Policies inside the campus."                                                 | |
|  |                                                                                  | |
|  | Applicant Signature: Juan Dela Cruz                   Date: November 19, 2026    | |
|  +----------------------------------------------------------------------------------+ |
|                                                                                       |
|  [ <- Previous Step ]                                  [ SUBMIT TO PASO REVIEW (->) ] |
+---------------------------------------------------------------------------------------+
```

#### Purpose & Description
Allows the applicant to perform a final inspection of all submitted data and execute the mandatory RSU Campus Safety & Traffic Pledge before sending the dossier to PASO.

#### Step-by-Step Instructions
1. Review all displayed vehicle specifications, attached photo ID, and uploaded documents.
2. Read the official university traffic pledge.
3. Click **SUBMIT TO PASO REVIEW**.
4. The system sends the data to the cloud database, clears your local draft, and opens the **Application Milestones & Status Tracker**.

---

### 1.8 My Vehicles & Fleet Management

```
+---------------------------------------------------------------------------------------+
|  MY VEHICLES                                                [ + Register New Vehicle ]|
|  Manage your registered campus vehicles, active passes, and pending clearances        |
+---------------------------------------------------------------------------------------+
|  +----------------------------------------------------------------------------------+ |
|  | [CAR ICON]  Honda Click 125 (2026)                           [ Active Pass (Set 1)| |
|  |             Motorcycle • Matte Black                                             | |
|  |                                                                                  | |
|  | Plate Number: NBM 1234                                                            | |
|  | Pass: S-001 • A.Y. 2026-2027 • Valid until July 31, 2027                          | |
|  |                                                                                  | |
|  | [ Active on A.Y. 2026-2027 (Set 1: Pink/Red) ]                                   | |
|  | Valid until July 31, 2027. Keeps Set 1 color unless renewed to A.Y. 2027-2028.   | |
|  |                                                                                  | |
|  | [ Renew for A.Y. 2027-2028 ]                                                     | |
|  +----------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------+
```

#### Purpose & Description
Provides a complete listing of all vehicles registered under your account. Each card displays the vehicle specs, current clearance status badge, assigned pass number, and academic year sticker theme.

#### Status Badges & Meaning
- **Active Pass**: Official gate clearance granted and currently valid for campus entry.
- **Pass Expired**: The 1-year academic validity period has elapsed. A prominent amber renewal notice appears.
- **Pending Review**: Submitted application is awaiting PASO Admin document verification.
- **Payment Pending**: Application approved by PASO; awaiting Cashier fee payment.
- **Receipt Under Verification**: Cashier receipt photo submitted; PASO is auditing payment.
- **Correction Required**: PASO returned the application with reviewer remarks.

---

### 1.9 Annual Vehicle Pass In-Place Renewal

```
+---------------------------------------------------------------------------------------+
|  ANNUAL PASS RENEWAL: Honda Click 125 (NBM 1234)                        [In-Place]    |
+---------------------------------------------------------------------------------------+
|  [SHIELD] STICKER & S-NUMBER PRESERVED CONFIRMATION:                                  |
|  Your assigned Pass Number (S-001) and physical QR sticker on your vehicle remain     |
|  100% valid. Once approved by PASO and verified by Cashier, the database extends gate |
|  clearance by 1 full academic year without issuing an unnecessary duplicate sticker!  |
|                                                                                       |
|  Vehicle specifications and Xerox documents are pre-filled.                           |
|  A fresh live camera photo is required to re-verify student enrollment.               |
|                                                                                       |
|  [ (o) Take Fresh Live Camera Selfie ]                                                |
|                                                                                       |
|  [ Cancel ]                                            [ SUBMIT PASS RENEWAL (->) ]   |
+---------------------------------------------------------------------------------------+
```

#### Purpose & Description
Enables clients to renew their vehicle pass for the next academic year without creating duplicate vehicle entries or generating unnecessary duplicate sticker numbers.

#### Step-by-Step Instructions
1. In **My Vehicles**, locate your vehicle and click **Renew for A.Y. [Next Year]** (or **Renew Pass for this Vehicle** if expired).
2. The renewal wizard pre-fills your vehicle make, model, color, and documents.
3. Take a fresh live camera photo (mandatory for annual re-verification).
4. Review your details and click **SUBMIT PASS RENEWAL**.
5. The existing application record is transitioned back to PASO review queue while preserving your original **Pass Number (S-001)**.

---

### 1.10 Application Milestones & Status Tracker

```
+---------------------------------------------------------------------------------------+
|  APPLICATION MILESTONES & STATUS                                                      |
|  Track the progress of your vehicle submissions through each university milestone     |
+---------------------------------------------------------------------------------------+
|  Application Ref: APP-2026-0001 • Honda Click 125 (NBM 1234)                          |
|                                                                                       |
|   (1) Form Submitted ===> (2) PASO Review ===> (3) Cashier Payment ===> (4) QR Issued |
|       [COMPLETED]             [COMPLETED]          [IN PROGRESS]          [PENDING]   |
|                                                                                       |
|  STATUS: APPROVED — PAY AT CASHIER WINDOW                                             |
|  Your vehicle registration was approved by PASO! Please pay the accreditation fee at  |
|  the Administration Building Cashier window, then submit your Official Receipt proof. |
|                                                                                       |
|  [====================== PROCEED TO CASHIER PAYMENT PROOF =========================] |
+---------------------------------------------------------------------------------------+
```

#### Purpose & Description
Provides a real-time 4-step progress tracker for every submitted vehicle application:
1. **Milestone 1 — Form Submitted**: Application and Xerox documents safely logged.
2. **Milestone 2 — PASO Review**: Security office verifies ownership and roadworthiness documents.
3. **Milestone 3 — Cashier Payment**: Client pays at the Cashier window and submits receipt proof.
4. **Milestone 4 — QR Pass Issued**: Official gate pass activated with 1-year academic validity.

---

### 1.11 Cashier Payment & Official Receipt (OR) Proof Submission

```
+---------------------------------------------------------------------------------------+
|  CASHIER PAYMENT & RECEIPT VERIFICATION                                               |
+---------------------------------------------------------------------------------------+
|  Application: APP-2026-0001 (Honda Click 125 • NBM 1234)                              |
|  Official Fee: PHP 150.00 (Motorcycle) / PHP 300.00 (4-Wheel)                         |
|                                                                                       |
|  Official Cashier Receipt (OR) Number *                                               |
|  [ e.g. OR-2026-89412                                                               ] |
|                                                                                       |
|  Clear Photo of University Cashier Official Receipt *                                 |
|  +----------------------------------------------------------------------------------+ |
|  |                                                                                  | |
|  |     [ [Attach Receipt Photo]  |  Status: or_receipt_photo.jpg attached ]        | |
|  |                                                                                  | |
|  +----------------------------------------------------------------------------------+ |
|                                                                                       |
|  [ SUBMIT CASHIER RECEIPT FOR PASO VERIFICATION ]                                     |
+---------------------------------------------------------------------------------------+
```

#### Step-by-Step Instructions
1. Visit the Romblon State University Cashier's Office at the Administration Building.
2. Pay the official accreditation fee (PHP 150.00 for motorcycles, PHP 300.00 for 4-wheel vehicles).
3. Request your official paper receipt with printed **OR Number**.
4. In RSU VPASS, go to **Milestones** or **Payments** and click **Submit Official Receipt**.
5. Type the exact printed **OR Number** in the text box.
6. Take or upload a crisp, well-lit photo of the paper receipt showing the date, amount, and OR number.
7. Click **SUBMIT CASHIER RECEIPT FOR PASO VERIFICATION**. Status updates to *Receipt Submitted — Awaiting PASO Verification*.

---

### 1.12 Official Vehicle Pass View & Wearable ID PNG Download

```
+---------------------------------------------------------------------------------------+
|  OFFICIAL VEHICLE PASS CREDENTIALS                                                    |
|  Physical Assets and Security Office (PASO) • Academic Year 2026-2027                  |
+---------------------------------------------------------------------------------------+
|  +----------------------------------------------------------------------------------+ |
|  | [RSU GREEN HEADER BANNER]  RSU VPASS  •  MAIN CAMPUS ODIONGAN  [ACTIVE PASS]    | |
|  |----------------------------------------------------------------------------------| |
|  | [Photo]  REGISTERED TO: JUAN DELA CRUZ                                           | |
|  |          ID: 2026-10492  |  Student • Motorcycle                                 | |
|  |                                                                                  | |
|  | Vehicle: Honda Click 125 (Black)      Plate Number: NBM 1234                     | |
|  | Pass Number: S-001                    Valid Until: July 31, 2027                 | |
|  |                                                                                  | |
|  |           +------------------------------------------------------+               | |
|  |           |                                                      |               | |
|  |           |          [ HIGH-RESOLUTION ENCRYPTED QR ]            |               | |
|  |           |                                                      |               | |
|  |           +------------------------------------------------------+               | |
|  |                      PASO GATE SECURITY VALIDATED                                | |
|  +----------------------------------------------------------------------------------+ |
|                                                                                       |
|  [ (v) DOWNLOAD WEARABLE ID PASS (PNG) ]      [ (v) DOWNLOAD STICKER QR CODE (PNG) ]  |
+---------------------------------------------------------------------------------------+
```

#### Step-by-Step Instructions
1. In the sidebar or bottom navigation, click **My Pass** (`/client/vehicle-pass`).
2. If you own multiple vehicles, use the top vehicle switcher tab to choose which pass to display.
3. Review your official digital pass credentials.
4. Click **DOWNLOAD WEARABLE ID PASS (PNG)**:
   - The system automatically draws a crisp, ultra-high-resolution 800x1200 pixel PNG badge directly in memory using HTML5 canvas.
   - The file is saved directly to your phone or computer, ready for lanyard printing or digital storage.

---

### 1.13 Pure Optical Sticker QR Code Generation for Vehicle Decals

#### Step-by-Step Instructions
1. On the **Vehicle Pass** page, click **DOWNLOAD STICKER QR CODE (PNG)**.
2. The system generates an ultra-sharp **1024x1024 pixel pure black-and-white QR code** with High Error Correction Level (`H`).
3. Save the PNG image file (`RSU-VPASS-STICKER-QR-NBM1234-S-001.png`).
4. Print this image on waterproof vinyl sticker decal paper and affix it to your vehicle's front windshield or motorcycle front fender for optical scanner reading at campus gates.

---

### 1.14 User Profile, Institutional ID & Emergency Contacts

```
+---------------------------------------------------------------------------------------+
|  INSTITUTIONAL VEHICLE PASS ACCOUNT                                                   |
+---------------------------------------------------------------------------------------+
|  [Photo]  Juan Dela Cruz  [RSU Student Badge]                                         |
|           BS Information Technology (CCMADI)                                          |
|           University ID: [ 2026-10492 ] [Copy ID]                                     |
|                                                                                       |
|  +-------------------------------+   +----------------------------------------------+ |
|  | TOTAL REGISTERED VEHICLES     |   | ACTIVE GATE PASSES                           | |
|  |         1 Vehicle             |   |        1 Official Pass                       | |
|  +-------------------------------+   +----------------------------------------------+ |
|                                                                                       |
|  Contact & Emergency Details                                            [ Edit Info ] |
|  Primary Contact: 09171234567                                                         |
|  Emergency Contact Name: Maria Dela Cruz                                              |
|  Relationship: Mother                Emergency Hotline: 09189876543                   |
|                                                                                       |
|  [ Change Account Password ]                                 [ Sign Out Account ]     |
+---------------------------------------------------------------------------------------+
```

#### Purpose & Instructions
- **Copy University ID**: Click the **Copy ID** button to copy your ID number to clipboard.
- **Edit Emergency Details**: Click **Edit Info**, update your primary phone and emergency contact name/relation, then click **Save Changes** (persisted directly to Aiven MySQL database).
- **Change Password**: Click **Change Account Password**, enter current and new password, and confirm.

---

# PART II: PASO ADMINISTRATOR USER MANUAL
*(For University Physical Assets and Security Office Personnel)*

---

### 2.1 Administrator Login & Security Credentials Authentication
1. Navigate to `/login`.
2. Enter your authorized administrator credentials (e.g. `sudosensai3@gmail.com`).
3. Enter your administrator password and click **SIGN IN TO VPASS**.
4. The system validates `role === 'PASO_ADMIN'` and immediately opens the administrative portal (`/admin/dashboard`).

---

### 2.2 Operational Dashboard Overview & Live KPI Metrics

```
+---------------------------------------------------------------------------------------+
|  PASO ADMIN PORTAL                                   [PASO Admin] [Superuser Badge]   |
|  Romblon State University • Vehicle Pass System                                       |
+---------------------------------------------------------------------------------------+
|  Dashboard Overview                                                                   |
|  Physical Assets and Security Office operational control panel                        |
|                                                                                       |
|  [ PENDING REVIEWS ]     [ ACTIVE PASSES ]      [ CAMPUS VISITORS ]    [ TOTAL LOGS ] |
|  [    2 In Queue   ]     [   48 Issued   ]      [    3 Inside     ]    [ 1,420 Logs ] |
|                                                                                       |
|  PENDING VEHICLE CLEARANCE REQUESTS:                                                  |
|  Ref        Applicant       Plate No.   Vehicle Type   Status               Action    |
|  APP-0041   Juan Dela Cruz  NBM 1234    Motorcycle     Receipt Verification [Review]  |
|  APP-0042   Robert Tan      ABC 5678    SUV (4-Wheel)  Form Submitted       [Review]  |
|                                                                                       |
|  RECENT CAMPUS GATE VERIFICATIONS (LIVE FEED):                                        |
|  Action   Gate    Plate No.   Driver          Classification  Timestamp     Status    |
|  ENTRY    Gate 1  NBM 1234    Juan Dela Cruz  STUDENT         Just now      VALID     |
|  ENTRY    Gate 2  VIS-991     Engr. Ramos     VISITOR         4 mins ago    VALID     |
+---------------------------------------------------------------------------------------+
```

#### Purpose & Key Features
- **4 Operational KPI Cards**: Displays real-time counts for Pending Reviews, Active Passes Issued, Visitors on Campus, and Total Gate Access Logs.
- **Pending Clearance Queue**: Prioritizes submissions needing immediate document or receipt verification.
- **Recent Gate Verifications Feed**: Real-time audit trail of gate entries and exits logged by gate guards.

---

### 2.3 Vehicle Application Reviews & Document Xerox Inspection

```
+---------------------------------------------------------------------------------------+
|  APPLICATION REVIEWS                                                                  |
|  Review submitted vehicle registrations, verify Xerox documents, and approve for Cashier|
+---------------------------------------------------------------------------------------+
|  Filter: [ All Applications (8) ]  [ Pending Form (1) ]  [ Receipts Submitted (2) ]   |
|                                                                                       |
|  [Inspect Modal View]                                                                 |
|  Applicant: Juan Dela Cruz  |  Classification: Student  |  ID: 2026-10492             |
|  Vehicle: Honda Click 125 (NBM 1234) • Motorcycle                                    |
|                                                                                       |
|  Submitted Documents:                                                                 |
|  [Driver's License Photo]     [LTO Official Receipt]      [LTO Cert of Registration]  |
|                                                                                       |
|  [ REJECT FORM (Remark Req) ]                          [ APPROVE FOR CASHIER PAYMENT ]|
+---------------------------------------------------------------------------------------+
```

#### Step-by-Step Instructions
1. In the admin sidebar, click **Application Reviews** (`/admin/applications`).
2. Click **Inspect** on any pending application.
3. Examine the applicant's live selfie photo, Driver's License, LTO OR, and LTO CR.
4. **To Approve**: Click **APPROVE FOR CASHIER PAYMENT**. The system sends an approval notification and unlocks Milestone 3 for the client.
5. **To Reject / Request Correction**:
   - Click **REJECT FORM**.
   - Type a mandatory remark explaining the mistake (e.g. *"LTO OR is blurry. Please upload a clear photo."*).
   - Click **Confirm Rejection**. The applicant is notified immediately via email and in-app banner.

---

### 2.4 Cashier Receipt Verification & Pass Issuance

```
+---------------------------------------------------------------------------------------+
|  CASHIER RECEIPT AUDIT & PASS ISSUANCE                                                |
+---------------------------------------------------------------------------------------+
|  Applicant: Juan Dela Cruz (NBM 1234)                                                 |
|  Submitted OR Number: OR-2026-89412                                                   |
|                                                                                       |
|  [ HIGH RESOLUTION CASHIER RECEIPT IMAGE AUDIT VIEW ]                                 |
|  Amount Verified: PHP 150.00  |  Stamped: Paid                                        |
|                                                                                       |
|  Assigned Pass Number: [ S-001 ] (Preserved on renewal)                               |
|  Target Academic Year: [ 2026-2027 ]  |  Validity: July 31, 2027                      |
|  Assigned Sticker Set: [ Set 1: Classic Pink & Red ]                                  |
|                                                                                       |
|  [ DECLINE RECEIPT (Re-upload) ]                       [ VERIFY & ISSUE VEHICLE PASS ]|
+---------------------------------------------------------------------------------------+
```

#### Step-by-Step Instructions
1. Filter the queue by **Receipts Submitted**.
2. Click **Verify Cashier Receipt**.
3. Confirm that the uploaded paper receipt shows an authentic RSU Cashier stamp, valid date, and correct fee.
4. **To Issue Pass**:
   - Click **VERIFY & ISSUE VEHICLE PASS**.
   - The database creates or updates the authoritative `vehicle_passes` row.
   - The pass is locked to the active Academic Year and assigned Sticker Theme.
   - A Brevo email notification containing the pass details and QR payload is dispatched automatically.
5. **If Receipt is Invalid**:
   - Click **DECLINE RECEIPT**.
   - Enter the reason (e.g., *"Payment amount is insufficient; please pay full motorcycle fee of PHP 150.00"*).
   - The client is prompted to re-upload proof without restarting their whole application.

---

### 2.5 Pass Management & Annual Sticker Theme Visualizer

```
+---------------------------------------------------------------------------------------+
|  PASS MANAGEMENT                                                                      |
|  Monitor approved vehicle gate pass stickers and inspect encrypted QR payloads        |
+---------------------------------------------------------------------------------------+
|  Filter: [ All Passes (48) ]  [ Student Vehicles (36) ]  [ Employee Vehicles (12) ]   |
|  [ Search plate, owner, or pass #...                                                ] |
|                                                                                       |
|  Pass #   Owner           Role      Plate No.  Theme & A.Y.     Valid Until   Actions |
|  S-001    Juan Dela Cruz  STUDENT   NBM 1234   Set 1 (2026-2027) July 31, 2027 [Inspect]|
|  E-002    Prof. Santos    EMPLOYEE  ABC 9912   Set 1 (2026-2027) July 31, 2027 [Inspect]|
|  S-003    Robert Tan      STUDENT   XYZ 4567   Set 2 (2027-2028) July 31, 2028 [Inspect]|
+---------------------------------------------------------------------------------------+
```

#### Features & Usage
- **Search & Filter**: Search instantaneously across plate numbers, pass numbers, and owner names.
- **Inspect Pass**: Opens a high-resolution modal preview showing both the physical wearable card and the exact physical sticker decal with dynamic Canva theme colors.

---

### 2.6 Security Guard Management & Station Credential Generation
1. In the admin sidebar, click **Security Guards** (`/admin/guards`).
2. Click **+ Add New Security Guard**.
3. Enter the guard's full name, assigned Gate Station (`Gate 1`, `Gate 2`, `Gate 3`, or `Gate 4`), email, and temporary password.
4. Click **Create Guard Account**. The guard can immediately log in from any mobile terminal at that gate.

---

### 2.7 Reports, Gate Access Audit Logs & Excel Data Export

```
+---------------------------------------------------------------------------------------+
|  REPORTS & GATE ACCESS LOGS                                  [ DOWNLOAD DATA REPORT ] |
|  Real-time campus access records from mobile guard scanners and visitor tracking      |
+---------------------------------------------------------------------------------------+
|  Tabs: [ Gate Access Audit Logs (1,420) ]   [ Campus Visitor Passes (3 Active) ]      |
|                                                                                       |
|  Filter: [ ALL ] [ ENTRY ] [ EXIT ] [ Spot-Checks ]   Gate: [ All Gates (1 - 4) v]     |
|                                                                                       |
|  Action   Gate    Plate No.  Driver / Owner    Classification  Timestamp      Status  |
|  ENTRY    Gate 1  NBM 1234   Juan Dela Cruz    STUDENT         Today 07:45 AM VALID   |
|  EXIT     Gate 1  NBM 1234   Juan Dela Cruz    STUDENT         Today 11:30 AM VALID   |
|  ENTRY    Gate 3  TMP-2026   Engr. Ramos       VISITOR         Today 01:15 PM VALID   |
+---------------------------------------------------------------------------------------+
```

#### Exporting Clean Clean Excel/CSV Data
1. Click **DOWNLOAD DATA REPORT**.
2. A dropdown presents two clean export choices:
   - **Gate Access Logs Audit**: Full timestamped movement trail of entries, exits, gate stations, and guard verification statuses.
   - **Campus Visitor Passes**: Full visitor log including destination, purpose, host person, stay validity, and contact numbers.
3. Choose your desired report. The file downloads as a clean, standardized, monochrome tabular dataset compatible with Microsoft Excel and Google Sheets without disruptive UI colors.

---

### 2.8 System Settings (Academic Year, Sticker Color Sets, Fees & Policy)

```
+---------------------------------------------------------------------------------------+
|  SYSTEM SETTINGS                                                                      |
|  Configure university academic year pass expiration policies and sticker color themes |
+---------------------------------------------------------------------------------------+
|  ACADEMIC YEAR & PASS EXPIRATION POLICY                                                |
|  Active Academic Year: [ 2026-2027 v]    Pass Expiration Date: [ July 31, 2027 ]      |
|  Presets: [ 2026-2027 ]  [ 2027-2028 ]  [ 2028-2029 ]                                 |
|                                                                                       |
|  ANNUAL VEHICLE STICKER COLOR THEME (CANVA TEMPLATES)                                 |
|  +----------------------------+  +----------------------------+  +------------------+ |
|  | Set 1: Classic Pink & Red  |  | Set 2: Emerald & Blue      |  | Set 3: Gold & Red| |
|  | Student: Rose Pink         |  | Student: Forest Emerald    |  | Student: Gold    | |
|  | Employee: Crimson Red      |  | Employee: Royal Navy Blue  |  | Employee: Maroon | |
|  | [ * Active for 2026-2027 ] |  | [ Click to Select ]        |  | [ Click to Select| |
|  +----------------------------+  +----------------------------+  +------------------+ |
|                                                                                       |
|  REGISTRATION FEES POLICY:                                                            |
|  Motorcycle Fee: [ PHP 150 ]   4-Wheel Fee: [ PHP 300 ]   Commercial: [ PHP 500 ]     |
|                                                                                       |
|  [ SAVE SYSTEM SETTINGS CHANGES ]                                                     |
+---------------------------------------------------------------------------------------+
```

#### How Annual Sticker Themes Work
- When PASO changes the Active Academic Year to `2027-2028`, the system defaults to **Set 2 (Forest Emerald & Royal Blue)**.
- **Critical Policy Protection**: Changing the active academic year does **not** alter previously issued passes. A student's A.Y. 2026–2027 pass remains Set 1 (Pink/Red) until they renew their pass for the new academic year.

---

# PART III: GATE SECURITY GUARD USER MANUAL
*(For University Gate Checkpoint Security Personnel)*

---

### 3.1 Guard Login & Gate Station Assignment (Gates 1 to 4)
1. Open the mobile scanner web application on the gate tablet or smartphone.
2. Sign in with your assigned guard credentials.
3. Select your duty checkpoint station (**Gate 1 - Main Entrance**, **Gate 2**, **Gate 3**, or **Gate 4**).
4. The terminal interface opens in optimized dark mode for daylight visibility and night-shift power efficiency.

---

### 3.2 Mobile Live Optical QR Camera Scanner & Multi-Tone Beeps

```
+---------------------------------------------------------------------------------------+
|  [GUARD] RSU VPASS GATE SCANNER  •  GATE 1 (MAIN ENTRANCE)        [Light] [Camera]   |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|                       +----------------------------------+                            |
|                       |  [ ]                        [ ]  |                            |
|                       |                                  |                            |
|                       |       ALIGN VEHICLE PASS QR      |                            |
|                       |         INSIDE THE FRAME         |                            |
|                       |                                  |                            |
|                       |  [ ]                        [ ]  |                            |
|                       +----------------------------------+                            |
|                                                                                       |
|  [ VERIFICATION RESULT POP-UP ]                                                       |
|  ==================================================================================== |
|  (v) GATE ACCESS GRANTED — VALID OFFICIAL VEHICLE PASS                                |
|  Owner: Juan Dela Cruz  |  Student (CCMADI)  |  Plate: NBM 1234                       |
|  Vehicle: Honda Click 125 (Black)            |  Pass #: S-001 (A.Y. 2026-2027)        |
|  Sticker Color Theme: Set 1 (Rose Pink Decal Verified)                                |
|  [ Photo Preview Matches Driver ]                                                     |
|                                                                                       |
|  [ LOG AS ENTRY ]                                [ LOG AS SPOT-CHECK ]                |
+---------------------------------------------------------------------------------------+
```

#### Step-by-Step Instructions
1. Tap **Start Camera**.
2. Point the device camera at the vehicle's windshield QR sticker or the driver's wearable digital ID pass.
3. The optical scanner parses the encrypted code in milliseconds:
   - **Valid Pass**: Plays a clear, positive high-pitched chime and vibrates once. The screen flashes green displaying the vehicle make, registered owner, photo ID, and sticker color set.
   - **Expired or Unregistered Pass**: Plays a low-frequency double warning buzz and vibrates with a double pulse. The screen flashes red with an expiration warning.
4. Tap **LOG AS ENTRY** or **LOG AS EXIT**. The event is permanently committed to the university gate audit trail.

---

### 3.3 Manual Plate & Pass Number Checkpoint Spot-Check
1. If a driver cannot present a QR sticker due to dirt or glare, tap the **Manual Search** tab.
2. Enter the vehicle **Plate Number** (spaces are ignored automatically) or **Pass Number** (e.g. `S-001`).
3. Matching registered vehicles and active temporary visitor passes appear instantly with driver photo and validity status.
4. Tap **Log Verification** to record the gate clearance.

---

### 3.4 Digital Temporary Visitor Pass Issuance (1 to 7 Days Stay)

```
+---------------------------------------------------------------------------------------+
|  ISSUE TEMPORARY CAMPUS VISITOR PASS                                                  |
+---------------------------------------------------------------------------------------+
|  Visitor Full Name *                           Plate Number *                         |
|  [ Engr. Robert Ramos                   ]      [ VIS-9912                           ] |
|                                                                                       |
|  Destination / Building *                      Host Official / Office *               |
|  [ College of Engineering & Tech        ]      [ Dean's Office                      ] |
|                                                                                       |
|  Purpose of Visit *                            ID Presented *                         |
|  [ Campus Facility Inspection           ]      [ PRC Professional License         v]  |
|                                                                                       |
|  Pass Validity Duration *                      Entry Gate                             |
|  [ 1 Day (Today until 11:59 PM)       v]      [ Gate 1 (Main Entrance)             ]  |
|                                                                                       |
|  [================ ISSUE DIGITAL VISITOR PASS & LOG ENTRY ==========================] |
+---------------------------------------------------------------------------------------+
```

#### Step-by-Step Instructions
1. Tap the **Issue Visitor Pass** tab.
2. Ask the visiting driver for their valid government or company ID.
3. Enter the visitor's **Full Name**, **Plate Number**, **Destination Building**, and **Purpose**.
4. Select the **Validity Duration** (`1 Day`, `2 Days`, `3 Days`, or `7 Days` for authorized contractors).
5. Click **ISSUE DIGITAL VISITOR PASS & LOG ENTRY**.
6. A digital temporary visitor pass with a unique QR code (`TMP-2026-XXXX`) is generated and logged into the campus audit feed automatically.

---

### 3.5 Active Visitor In-Campus Stay Extension
1. Under the **Visitor Passes** section, locate the visitor currently inside the campus.
2. Click **Extend Stay**.
3. Select additional days (e.g. +1 Day).
4. Click **Confirm Extension**. The expiration date is extended without creating a duplicate ENTRY log.

---

### 3.6 Real-Time Gate Station Entry / Exit Activity Stream
- Security personnel can monitor the live feed of all campus gate stations at the bottom of the scanner screen.
- Each entry shows the action (`ENTRY`, `EXIT`, or `CHECK`), gate station name, plate number, owner classification (`STUDENT`, `EMPLOYEE`, or `VISITOR`), and exact timestamp.

---

*End of RSU VPASS User Manual. Document approved by the Physical Assets and Security Office (PASO), Romblon State University.*
