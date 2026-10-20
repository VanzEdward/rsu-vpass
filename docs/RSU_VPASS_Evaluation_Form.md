# ROMBLON STATE UNIVERSITY
### Physical Assets and Security Office (PASO)
#### Main Campus, Odiongan, Romblon, Philippines

---

# SYSTEM EVALUATION FORM
## RSU VPASS: Automated Vehicle Registration, Gate Clearance Verification, and Pass Management System

---

### **GENERAL INSTRUCTIONS**
Please evaluate the **RSU VPASS Web Application** by checking the appropriate box corresponding to your assessment for each item. Your objective rating and feedback will be used to determine the system's software quality, operational readiness, and user acceptance prior to full institutional deployment across university campus gates.

---

### **EVALUATOR PROFILE**

* **Evaluator Name (Optional):** __________________________________________________
* **Designation / Position:** __________________________________________________
* **Department / College / Office:** __________________________________________________
* **Date of Evaluation:** ________________________

**Evaluator Category (Please check one):**
- [ ] **IT Expert / Technical Panelist** (Software Engineer, IT Faculty, Systems Analyst)
- [ ] **PASO Administrator / Office Staff** (Physical Assets & Security Personnel)
- [ ] **Campus Gate Security Guard** (On-duty Security Officer)
- [ ] **Client / Vehicle Owner - Student** (Enrolled Undergraduate / Graduate Student)
- [ ] **Client / Vehicle Owner - Employee** (Faculty, Administrative Personnel, Contractor)

---

### **EVALUATION RATING SCALE**

The evaluation criteria are rated based on a 5-point Likert Scale adhering to the **ISO/IEC 25010 Software Quality Standards**:

| Rating | Scale Range | Level of Agreement | Descriptive Interpretation |
| :---: | :---: | :--- | :--- |
| **5** | 4.50 – 5.00 | **Strongly Agree (SA)** | **Excellent / Fully Implemented**: Exceeds standards; flawless execution and responsiveness. |
| **4** | 3.50 – 4.49 | **Agree (A)** | **Very Good / Well Implemented**: Fully functional with minor or negligible cosmetic issues. |
| **3** | 2.50 – 3.49 | **Moderately Agree (MA)** | **Satisfactory / Acceptable**: Meets basic requirements; functional but has room for refinement. |
| **2** | 1.50 – 2.49 | **Disagree (D)** | **Fair / Needs Improvement**: Partially implemented; contains noticeable shortcomings. |
| **1** | 1.00 – 1.49 | **Strongly Disagree (SD)** | **Poor / Not Implemented**: Deficient or missing critical required functionality. |

---

## PART I: ISO/IEC 25010 SOFTWARE QUALITY EVALUATION
*(Applicable to all evaluators, with emphasis on IT Experts and Technical Panelists)*

### 1. Functional Suitability
*Measures the degree to which the system provides functions that meet stated and implied needs when used under specified conditions.*

| # | Evaluation Criteria | 5 (SA) | 4 (A) | 3 (MA) | 2 (D) | 1 (SD) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: |
| 1.1 | **Workflow Completeness:** The 4-milestone vehicle registration workflow (Submission → Evaluation → Cashier Payment → Pass Issuance) covers the complete institutional vehicle clearance cycle. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 1.2 | **Identity Verification:** The built-in live camera selfie feature accurately captures driver identity to prevent identity fraud and unauthorized vehicle transfers. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 1.3 | **Sequential Pass Numbering:** The system correctly issues sequential, categorized pass identifiers (`S-001` for Students, `E-001` for Employees) without collisions or skipping. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 1.4 | **Cashier Payment Compliance:** The Cashier receipt upload and Official Receipt (OR) validation effectively prevent issuing passes to non-compliant applicants. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 1.5 | **Rapid Gate Verification:** The gate scanner decodes encrypted pass QR codes and retrieves the owner's photo, vehicle specs, and active status accurately. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 1.6 | **Visitor Gate Management:** The temporary pass module properly logs visitor identity, Philippine ID presented, vehicle type, and duration. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 1.7 | **Entry & Exit Audit Logging:** The system records real-time campus gate entry and exit timestamps with accurate gate stations and guard IDs. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Subtotal / Mean Score:** | | | | | |

---

### 2. Usability & User Interface Aesthetics
*Measures the degree to which the system can be used by specified users to achieve specified goals with effectiveness, efficiency, and satisfaction.*

| # | Evaluation Criteria | 5 (SA) | 4 (A) | 3 (MA) | 2 (D) | 1 (SD) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: |
| 2.1 | **Visual Hierarchy & University Identity:** The application follows clean RSU Emerald Green (`#059669`) and Gold branding with modern typography and card components. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2.2 | **Navigation Clarity:** Navigation across client, admin, and guard portals is intuitive with self-explanatory menus, tabs, and action buttons. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2.3 | **Form Usability & Custom Controls:** Dropdown menus (Vehicle Types, Philippine IDs, Durations) use custom floating dialogs that avoid native OS wheel clipping. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2.4 | **Error Prevention & Confirmation:** Critical operations (e.g., Signing out, Rejecting applications, Resetting credentials) include confirmation dialogs to prevent misclicks. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2.5 | **Feedback Mechanisms:** System actions provide immediate visual notifications, toast messages, and color-coded status badges (`Active Pass`, `Pending Review`, `Rejected`). | [ ] | [ ] | [ ] | [ ] | [ ] |
| 2.6 | **Credential Presentation:** The wearable ID pass and physical vehicle pass sticker (Canva-style pink/red) are well-proportioned, legible, and ready for 300 DPI export. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Subtotal / Mean Score:** | | | | | |

---

### 3. Performance Efficiency & Responsiveness
*Measures performance relative to the amount of resources used under stated conditions.*

| # | Evaluation Criteria | 5 (SA) | 4 (A) | 3 (MA) | 2 (D) | 1 (SD) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: |
| 3.1 | **Camera Scanner Decoding Speed:** The optical QR code viewfinder (jsQR) decodes passes in under 1 second under normal gate lighting conditions. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 3.2 | **Page Load Speed:** Web pages and dashboard analytical widgets render quickly without noticeable latency on standard campus internet / 4G cellular data. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 3.3 | **Image Processing & Compression:** Driver photos, OR/CR documents, and cashier receipts upload smoothly without crashing or stalling mobile browsers. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 3.4 | **Real-Time Data Sync:** Gate logs, review decisions, and application status updates reflect across open tabs and multiple devices in real-time. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Subtotal / Mean Score:** | | | | | |

---

### 4. Security, Integrity & Privacy
*Measures the degree to which the system protects information and data so that unauthorized persons cannot read or modify them.*

| # | Evaluation Criteria | 5 (SA) | 4 (A) | 3 (MA) | 2 (D) | 1 (SD) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: |
| 4.1 | **Role-Based Access Control (RBAC):** Access to administrative queues, guard scanners, and client records is strictly enforced by user role (`CLIENT`, `PASO_ADMIN`, `GUARD`). | [ ] | [ ] | [ ] | [ ] | [ ] |
| 4.2 | **Credential & Password Encryption:** User passwords are encrypted using bcrypt hashing before transmission and storage. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 4.3 | **Token Authentication:** Secure JSON Web Tokens (JWT) protect REST API endpoints from unauthorized inspection and session hijacking. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 4.4 | **QR Code Anti-Counterfeiting:** The scanner intercepts troll URLs, external meme QR codes, and forged pass strings with dedicated alert notifications. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 4.5 | **Data Privacy Compliance:** Personal driver information, emergency contacts, and license photos are accessible only to authorized PASO officers and security personnel. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Subtotal / Mean Score:** | | | | | |

---

### 5. Reliability & Fault Tolerance
*Measures the degree to which a system performs specified functions under specified conditions for a specified period of time.*

| # | Evaluation Criteria | 5 (SA) | 4 (A) | 3 (MA) | 2 (D) | 1 (SD) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: |
| 5.1 | **Notification Read-State Retention:** Read notifications stay marked as read even after closing the browser tab or reopening the application session. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 5.2 | **Hardware Camera Fallback:** If camera access is restricted or denied, the system alerts the guard gracefully and offers manual plate/ID search alternatives. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 5.3 | **Draft Auto-Saving:** In-progress application drafts are preserved locally so users do not lose filled data if a tab is accidentally closed. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 5.4 | **Cloud Database Resilience:** Transactions to the cloud database (Aiven MySQL) handle transient network reconnects gracefully. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Subtotal / Mean Score:** | | | | | |

---

### 6. Maintainability & Portability
*Measures the ease with which the software can be modified, tested, and operated on different environments.*

| # | Evaluation Criteria | 5 (SA) | 4 (A) | 3 (MA) | 2 (D) | 1 (SD) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: |
| 6.1 | **Cross-Device Adaptability:** The web application displays seamlessly on smartphones (Android/iOS), tablets, laptops, and desktop computers. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 6.2 | **Browser Compatibility:** Operates consistently across major web browsers (Google Chrome, Safari, Mozilla Firefox, Microsoft Edge). | [ ] | [ ] | [ ] | [ ] | [ ] |
| 6.3 | **System Configurability:** Administrative configurations (Academic Year, validity duration, sticker fees) can be adjusted without modifying source code. | [ ] | [ ] | [ ] | [ ] | [ ] |
| 6.4 | **Architectural Cleanliness:** Modern modular codebase (React 19 + Express.js REST API + MySQL DDL) facilitates future university ERP integration. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Subtotal / Mean Score:** | | | | | |

---

## PART II: ROLE-SPECIFIC USER ACCEPTANCE EVALUATION (UAT)

### SECTION A: CLIENT / VEHICLE OWNER PORTAL (Students & Employees)
*(To be evaluated by Students, Faculty, and Staff)*

| # | Feature / User Experience | 5 (SA) | 4 (A) | 3 (MA) | 2 (D) | 1 (SD) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: |
| A.1 | Submitting vehicle registration, uploading driver's license, and taking a live selfie was easy and straightforward. | [ ] | [ ] | [ ] | [ ] | [ ] |
| A.2 | The application milestone tracker clearly shows what stage my request is in (Evaluation, Payment, Approved). | [ ] | [ ] | [ ] | [ ] | [ ] |
| A.3 | Uploading the Cashier Official Receipt (OR) photo and entering the receipt number was simple to accomplish. | [ ] | [ ] | [ ] | [ ] | [ ] |
| A.4 | The digital wearable ID pass and downloadable Canva vehicle pass sticker look official, sharp, and easy to save. | [ ] | [ ] | [ ] | [ ] | [ ] |
| A.5 | The enlarged QR code modal is convenient to present to the guard at university gate checkpoints. | [ ] | [ ] | [ ] | [ ] | [ ] |
| A.6 | The in-app bell notifications and Brevo email alerts kept me well-informed of approval decisions and remarks. | [ ] | [ ] | [ ] | [ ] | [ ] |
| A.7 | The sign-out confirmation modal prevents me from accidentally logging out of my account. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Section A Mean Score:** | | | | | |

---

### SECTION B: PASO ADMINISTRATOR PORTAL
*(To be evaluated by PASO Officers, Campus Safety Directors, and Panelists)*

| # | Feature / User Experience | 5 (SA) | 4 (A) | 3 (MA) | 2 (D) | 1 (SD) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: |
| B.1 | The executive dashboard provides clear real-time visibility into pending reviews, issued passes, and campus traffic. | [ ] | [ ] | [ ] | [ ] | [ ] |
| B.2 | The document verification modal allows efficient inspection of applicant photos, OR/CR, and driver licenses. | [ ] | [ ] | [ ] | [ ] | [ ] |
| B.3 | Providing specific rejection remarks gives applicants clear instructions to correct errors without re-typing. | [ ] | [ ] | [ ] | [ ] | [ ] |
| B.4 | Cashier payment verification and sequential pass generation (`S-###` / `E-###`) operate seamlessly. | [ ] | [ ] | [ ] | [ ] | [ ] |
| B.5 | Managing security guard accounts, shift gate posts, and credentials is uncomplicated and secure. | [ ] | [ ] | [ ] | [ ] | [ ] |
| B.6 | Audit logs provide an immutable, timestamped record of every gate entry and exit across campus. | [ ] | [ ] | [ ] | [ ] | [ ] |
| B.7 | System settings allow configuring the live academic year and pass policy without engineering assistance. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Section B Mean Score:** | | | | | |

---

### SECTION C: GATE SECURITY GUARD PORTAL
*(To be evaluated by Gate Security Personnel and Safety Officers)*

| # | Feature / User Experience | 5 (SA) | 4 (A) | 3 (MA) | 2 (D) | 1 (SD) |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: |
| C.1 | The mobile camera QR code scanner is fast, responsive, and easy to aim at drivers' mobile phones or stickers. | [ ] | [ ] | [ ] | [ ] | [ ] |
| C.2 | The camera flip button smoothly switches between front and rear phone cameras for flexible gate handling. | [ ] | [ ] | [ ] | [ ] | [ ] |
| C.3 | The verification screen immediately shows the driver's verified selfie photo, plate number, and clearance status. | [ ] | [ ] | [ ] | [ ] | [ ] |
| C.4 | The audio chimes (pleasant beep for valid, warning buzz for invalid) and haptic vibrations assist quick gate decisions. | [ ] | [ ] | [ ] | [ ] | [ ] |
| C.5 | Manual search allows quick driver lookup by vehicle plate number, school ID, or pass number when QR is unavailable. | [ ] | [ ] | [ ] | [ ] | [ ] |
| C.6 | Issuing a visitor pass with Philippine valid ID choices and duration takes under 30 seconds at the gate. | [ ] | [ ] | [ ] | [ ] | [ ] |
| C.7 | Logging entry and exit for regular passes and visitor vehicles prevents duplicate entries and keeps counts accurate. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Section C Mean Score:** | | | | | |

---

## PART III: OVERALL EVALUATION SUMMARY & SCORING

### Summary of Criteria Scores

| Evaluation Dimension | Total Items | Calculated Mean Rating | Verbal Interpretation |
| :--- | :---: | :---: | :--- |
| **1. Functional Suitability** | 7 | ________ | ____________________ |
| **2. Usability & UI Aesthetics** | 6 | ________ | ____________________ |
| **3. Performance Efficiency** | 4 | ________ | ____________________ |
| **4. Security & Privacy** | 5 | ________ | ____________________ |
| **5. Reliability & Fault Tolerance** | 4 | ________ | ____________________ |
| **6. Maintainability & Portability** | 4 | ________ | ____________________ |
| **Part I Overall Mean Rating** | **30** | ________ | ____________________ |
| **Part II UAT Mean Rating (Applicable Role)** | **7** | ________ | ____________________ |
| **GRAND COMPOSITE MEAN RATING** | **37** | **________** | **____________________** |

**Interpretation Guide:**
* **4.50 – 5.00:** Excellent / Outstanding (Highly Recommended for Institutional Adoption)
* **3.50 – 4.49:** Very Satisfactory (Recommended for Institutional Adoption)
* **2.50 – 3.49:** Satisfactory (Acceptable with Minor Revisions)
* **1.50 – 2.49:** Fair / Needs Major Revision
* **1.00 – 1.49:** Poor / Rejected

---

## PART IV: QUALITATIVE FEEDBACK & RECOMMENDATIONS

**1. What are the key strengths and most commendable features of the RSU VPASS system?**
____________________________________________________________________________________________________
____________________________________________________________________________________________________
____________________________________________________________________________________________________

**2. What areas, features, or workflows require further improvement or enhancement?**
____________________________________________________________________________________________________
____________________________________________________________________________________________________
____________________________________________________________________________________________________

**3. General Comments, Technical Observations, or Recommendations for Campus Deployment:**
____________________________________________________________________________________________________
____________________________________________________________________________________________________
____________________________________________________________________________________________________

---

### **RECOMMENDATION STATUS (Please check one):**
- [ ] **APPROVED FOR FULL CAMPUS IMPLEMENTATION** — The system meets all institutional security, usability, and technical standards.
- [ ] **APPROVED SUBJECT TO MINOR REVISIONS** — The system is functional; implement noted minor enhancements.
- [ ] **FOR RE-EVALUATION** — The system requires major revisions before campus deployment.

---

### **ATTESTATION & SIGNATURE**

I hereby certify that I have thoroughly evaluated the **RSU VPASS (Vehicle Pass and Security Management System)** of Romblon State University and that the ratings and comments provided above represent my honest, professional assessment.

<br />

__________________________________________________
**Signature Over Printed Name of Evaluator**

**Date:** ________________________
