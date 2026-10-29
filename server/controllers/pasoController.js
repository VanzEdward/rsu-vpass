import pool from "../config/db.js";
import {
  sendRegistrationApprovedEmail,
  sendRegistrationRejectedEmail,
  sendReceiptRejectedEmail,
  sendPassIssuedEmail,
  sendGuardAccountCreatedEmail,
} from "../services/emailService.js";

// Get dashboard counts & statistics for PASO admin
export const getAdminStats = async (req, res) => {
  try {
    const [[pendingApps]] = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE status = "PENDING"',
    );
    const [[activePasses]] = await pool.query(
      'SELECT COUNT(*) as count FROM vehicle_passes WHERE status = "ACTIVE"',
    );
    const [[totalVehicles]] = await pool.query(
      "SELECT COUNT(*) as count FROM vehicles",
    );
    const [[totalUsers]] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "CLIENT"',
    );

    res.json({
      pendingApplications: pendingApps.count,
      activePasses: activePasses.count,
      totalVehicles: totalVehicles.count,
      totalClients: totalUsers.count,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stats", error: error.message });
  }
};

// Get all applications for review
export const getAllApplications = async (req, res) => {
  try {
    const [apps] = await pool.query(`
      SELECT 
        a.id, a.app_ref_number, a.status, a.rejection_reason, 
        a.applicant_photo, a.driver_license_url, a.or_cr_url,
        a.receipt_or_number, a.receipt_photo_url, a.receipt_rejection_remark,
        a.created_at, a.updated_at,
        u.id as user_id, u.school_id, u.full_name, u.email, u.contact_number,
        u.classification, u.year_course, u.department_unit,
        v.id as vehicle_id, v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model,
        vp.id as pass_id, vp.pass_number, vp.valid_until, vp.qr_code_data, vp.status as pass_status
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN vehicles v ON a.vehicle_id = v.id
      LEFT JOIN vehicle_passes vp ON vp.vehicle_id = v.id
      ORDER BY a.created_at DESC
    `);

    const formatted = apps.map((app) => ({
      id: app.app_ref_number || `APP-2026-${String(app.id).padStart(4, '0')}`,
      db_id: app.id,
      user_id: app.user_id,
      applicant_name: app.full_name,
      school_id: app.school_id,
      email: app.email,
      contact_number: app.contact_number || '',
      classification: app.classification || 'Student',
      department: app.year_course || app.department_unit || '',
      applicant_photo: app.applicant_photo,
      vehicle: {
        id: app.vehicle_id,
        make: app.make,
        model: app.model,
        year: String(app.year_model || '2026'),
        color: app.color,
        plateNumber: app.plate_number,
        type: app.vehicle_type,
      },
      documents: {
        driverLicense: app.driver_license_url,
        orCr: app.or_cr_url,
      },
      status: app.status,
      rejection_reason: app.rejection_reason,
      receiptRejectionRemark: app.receipt_rejection_remark,
      receipt: app.receipt_or_number ? {
        orNumber: app.receipt_or_number,
        receiptPhoto: app.receipt_photo_url,
        submittedAt: app.updated_at,
      } : null,
      pass: app.pass_number ? {
        id: app.pass_id,
        passNumber: app.pass_number,
        validUntil: app.valid_until,
        qrData: app.qr_code_data,
        status: app.pass_status || 'ACTIVE',
      } : null,
      submittedDate: new Date(app.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res
      .status(500)
      .json({ message: "Error fetching applications", error: error.message });
  }
};

// Review Application (Approve or Reject with mandatory remark)
export const reviewApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, rejection_reason } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be APPROVED or REJECTED" });
    }

    if (
      status === "REJECTED" &&
      (!rejection_reason || rejection_reason.trim() === "")
    ) {
      return res
        .status(400)
        .json({
          message: "Rejection reason is required when rejecting an application",
        });
    }

    let appCondition = 'id = ?';
    if (isNaN(Number(applicationId))) {
      appCondition = 'app_ref_number = ?';
    }

    await pool.query(
      `UPDATE applications SET status = ?, rejection_reason = ? WHERE ${appCondition}`,
      [status, status === "REJECTED" ? rejection_reason : null, applicationId],
    );

    // Trigger Brevo Email Notification (Non-blocking)
    try {
      const [appData] = await pool.query(
        `SELECT a.id, u.email, u.full_name, v.plate_number, v.make, v.model, v.vehicle_type
         FROM applications a
         JOIN users u ON a.user_id = u.id
         JOIN vehicles v ON a.vehicle_id = v.id
         WHERE ${appCondition}`,
        [applicationId]
      );

      if (appData && appData.length > 0) {
        const applicant = appData[0];
        const vehicleDesc = `${applicant.make || ''} ${applicant.model || ''}`.trim() || applicant.vehicle_type || 'Vehicle';

        if (status === 'APPROVED') {
          sendRegistrationApprovedEmail({
            toEmail: applicant.email,
            recipientName: applicant.full_name,
            vehicle: vehicleDesc,
            plateNumber: applicant.plate_number,
          }).catch((err) => console.error('[Brevo Hook Error]:', err));
        } else if (status === 'REJECTED') {
          sendRegistrationRejectedEmail({
            toEmail: applicant.email,
            recipientName: applicant.full_name,
            vehicle: vehicleDesc,
            plateNumber: applicant.plate_number,
            reason: rejection_reason,
          }).catch((err) => console.error('[Brevo Hook Error]:', err));
        }
      }
    } catch (emailErr) {
      console.error('[Brevo Hook Query Error]:', emailErr);
    }

    res.json({ message: `Application marked as ${status}` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error reviewing application", error: error.message });
  }
};

// Issue Official Vehicle Gate Pass after Cashier verification (Milestone 4)
export const issuePass = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { passNumber, validUntil, orNumber, amount } = req.body;

    let appCondition = 'a.id = ?';
    if (isNaN(Number(applicationId))) {
      appCondition = 'a.app_ref_number = ?';
    }

    const [apps] = await pool.query(
      `SELECT a.id, a.user_id, a.vehicle_id, a.receipt_or_number,
              u.school_id, u.full_name, u.email,
              v.plate_number, v.make, v.model, v.vehicle_type
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN vehicles v ON a.vehicle_id = v.id
       WHERE ${appCondition}`,
      [applicationId]
    );

    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const app = apps[0];
    const finalPassNum = passNumber || `S-${String(app.id).padStart(3, '0')}`;
    const finalValidUntil = validUntil ? new Date(validUntil).toISOString().split('T')[0] : `${new Date().getFullYear() + 1}-07-31`;
    const qrData = `RSU-VPASS:${finalPassNum}:${app.plate_number}:${app.school_id}`;

    // 1. Insert or update vehicle pass
    await pool.query(
      `INSERT INTO vehicle_passes (pass_number, vehicle_id, user_id, qr_code_data, valid_until, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')
       ON DUPLICATE KEY UPDATE pass_number = VALUES(pass_number), qr_code_data = VALUES(qr_code_data), valid_until = VALUES(valid_until), status = 'ACTIVE'`,
      [finalPassNum, app.vehicle_id, app.user_id, qrData, finalValidUntil]
    );

    // 2. Insert payment if OR number is available
    const finalOr = orNumber || app.receipt_or_number;
    if (finalOr) {
      await pool.query(
        `INSERT INTO payments (application_id, or_number, amount, recorded_by, remarks)
         VALUES (?, ?, ?, ?, 'Cashier verified by PASO Admin')
         ON DUPLICATE KEY UPDATE or_number = VALUES(or_number)`,
        [app.id, finalOr, amount || 150.00, req.user.id]
      );
    }

    // 3. Update application status
    await pool.query(
      `UPDATE applications SET status = 'PASS_ISSUED' WHERE id = ?`,
      [app.id]
    );

    // 4. Trigger Brevo Email
    try {
      const vehicleDesc = `${app.make || ''} ${app.model || ''}`.trim() || app.vehicle_type || 'Vehicle';
      sendPassIssuedEmail({
        toEmail: app.email,
        recipientName: app.full_name,
        vehicle: vehicleDesc,
        plateNumber: app.plate_number,
        passNumber: finalPassNum,
        validUntil: finalValidUntil,
      }).catch((err) => console.error('[Brevo Hook Error]:', err));
    } catch (e) {
      console.error('[Brevo Hook Query Error]:', e);
    }

    res.json({
      message: 'Official Vehicle Pass issued successfully!',
      passNumber: finalPassNum,
      validUntil: finalValidUntil,
      qrData
    });
  } catch (error) {
    console.error('Error in issuePass:', error);
    res.status(500).json({ message: 'Failed to issue vehicle pass', error: error.message });
  }
};

// Reject Cashier Receipt Proof with remark
export const rejectReceipt = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { remarks } = req.body;

    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ message: 'Rejection remark is required when declining a receipt' });
    }

    let appCondition = 'a.id = ?';
    if (isNaN(Number(applicationId))) {
      appCondition = 'a.app_ref_number = ?';
    }

    const [apps] = await pool.query(
      `SELECT a.id, a.user_id, a.vehicle_id,
              u.school_id, u.full_name, u.email,
              v.plate_number, v.make, v.model, v.vehicle_type
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN vehicles v ON a.vehicle_id = v.id
       WHERE ${appCondition}`,
      [applicationId]
    );

    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const app = apps[0];

    // Set remark and status back to APPROVED so applicant can re-upload
    await pool.query(
      `UPDATE applications 
       SET status = 'APPROVED', 
           receipt_rejection_remark = ? 
       WHERE id = ?`,
      [remarks.trim(), app.id]
    );

    // Send Brevo Email
    try {
      const vehicleDesc = `${app.make || ''} ${app.model || ''}`.trim() || app.vehicle_type || 'Vehicle';
      sendReceiptRejectedEmail({
        toEmail: app.email,
        recipientName: app.full_name,
        vehicle: vehicleDesc,
        plateNumber: app.plate_number,
        reason: remarks.trim(),
      }).catch((err) => console.error('[Brevo Hook Error]:', err));
    } catch (e) {
      console.error('[Brevo Hook Query Error]:', e);
    }

    res.json({ message: 'Receipt declined. Applicant has been notified to re-upload proof.' });
  } catch (error) {
    console.error('Error in rejectReceipt:', error);
    res.status(500).json({ message: 'Failed to reject receipt', error: error.message });
  }
};

// Record Cashier Payment / Official Receipt Reference
export const recordPayment = async (req, res) => {
  try {
    const { application_id, or_number, amount, remarks } = req.body;
    if (!application_id || !or_number) {
      return res
        .status(400)
        .json({ message: "Application ID and OR Number are required" });
    }

    // Insert payment record
    await pool.query(
      "INSERT INTO payments (application_id, or_number, amount, recorded_by, remarks) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE or_number = VALUES(or_number), amount = VALUES(amount)",
      [application_id, or_number, amount || 0, req.user.id, remarks || ""],
    );

    // Fetch application details to auto-generate pass
    const [appRows] = await pool.query(
      "SELECT user_id, vehicle_id FROM applications WHERE id = ?",
      [application_id],
    );
    if (appRows.length > 0) {
      const { user_id, vehicle_id } = appRows[0];
      const year = new Date().getFullYear();
      const passNumber = `VP-${year}-${String(application_id).padStart(4, "0")}`;
      const validUntil = `${year}-12-31`; // Standard annual validity
      const qrData = `RSU-VPASS:${passNumber}:${vehicle_id}:${user_id}`;

      // Insert or activate pass
      await pool.query(
        `
        INSERT INTO vehicle_passes (pass_number, vehicle_id, user_id, qr_code_data, valid_until, status)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE')
        ON DUPLICATE KEY UPDATE status = 'ACTIVE', valid_until = VALUES(valid_until)
      `,
        [passNumber, vehicle_id, user_id, qrData, validUntil],
      );

      // Trigger Brevo Email for Pass Issuance
      try {
        const [userData] = await pool.query(
          `SELECT u.email, u.full_name, v.plate_number, v.make, v.model, v.vehicle_type
           FROM users u
           JOIN vehicles v ON v.id = ?
           WHERE u.id = ?`,
          [vehicle_id, user_id]
        );
        if (userData && userData.length > 0) {
          const userObj = userData[0];
          const vehicleDesc = `${userObj.make || ''} ${userObj.model || ''}`.trim() || userObj.vehicle_type || 'Vehicle';
          sendPassIssuedEmail({
            toEmail: userObj.email,
            recipientName: userObj.full_name,
            vehicle: vehicleDesc,
            plateNumber: userObj.plate_number,
            passNumber,
            validUntil,
          }).catch((err) => console.error('[Brevo Hook Error]:', err));
        }
      } catch (e) {
        console.error('[Brevo Hook Query Error]:', e);
      }
    }

    res.json({
      message: "Payment recorded and official Vehicle Pass issued successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to record payment", error: error.message });
  }
};

// Get all Security Guard accounts
export const getGuards = async (req, res) => {
  try {
    const [guards] = await pool.query(`
      SELECT 
        id, school_id, email, full_name, first_name, last_name, middle_name, 
        contact_number, role, created_at, updated_at
      FROM users 
      WHERE role = 'GUARD'
      ORDER BY created_at DESC
    `);
    res.json(guards);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching guards", error: error.message });
  }
};

// Provision new Security Guard account (PASO Admin only)
export const createGuard = async (req, res) => {
  try {
    const {
      last_name,
      first_name,
      middle_name,
      school_id,
      email,
      contact_number,
      password,
    } = req.body;

    if (!last_name || !first_name || !school_id || !email || !password) {
      return res.status(400).json({
        message:
          "Last Name, First Name, Guard Badge/ID No., Email, and Password are required.",
      });
    }

    // Format Full Name strictly as: LAST NAME, FIRST NAME, M.I.
    const cleanLast = last_name.trim();
    const cleanFirst = first_name.trim();
    const cleanMI = middle_name ? middle_name.trim().toUpperCase() : "";
    const formattedMI = cleanMI
      ? cleanMI.endsWith(".")
        ? cleanMI
        : `${cleanMI}.`
      : "";
    const fullName = formattedMI
      ? `${cleanLast}, ${cleanFirst} ${formattedMI}`
      : `${cleanLast}, ${cleanFirst}`;

    // Check if school_id or email already exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE school_id = ? OR email = ?",
      [school_id.trim(), email.trim()],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "A user with this Guard Badge ID or Email already exists.",
      });
    }

    // Dynamically import bcryptjs if needed or import at top
    const bcrypt = (await import("bcryptjs")).default;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (
        school_id, email, password, full_name, first_name, last_name, middle_name,
        role, contact_number, classification
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'GUARD', ?, 'EMPLOYEE')`,
      [
        school_id.trim(),
        email.trim(),
        hashedPassword,
        fullName,
        cleanFirst,
        cleanLast,
        formattedMI || null,
        contact_number ? contact_number.trim() : null,
      ],
    );

    const newGuard = {
      id: result.insertId,
      school_id: school_id.trim(),
      email: email.trim(),
      full_name: fullName,
      first_name: cleanFirst,
      last_name: cleanLast,
      middle_name: formattedMI || null,
      contact_number: contact_number ? contact_number.trim() : null,
      role: "GUARD",
      created_at: new Date(),
    };

    // Trigger Brevo Email for Guard Provisioning
    sendGuardAccountCreatedEmail({
      toEmail: email.trim(),
      guardName: fullName,
      schoolId: school_id.trim(),
      rawPassword: password,
    }).catch((err) => console.error('[Brevo Guard Email Error]:', err));

    res.status(201).json({
      message: `Security Guard account for ${fullName} successfully created!`,
      guard: newGuard,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to create guard account",
        error: error.message,
      });
  }
};

// Delete / Revoke Security Guard account
export const deleteGuard = async (req, res) => {
  try {
    const { guardId } = req.params;
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ? AND role = "GUARD"',
      [guardId],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Guard account not found or already removed" });
    }

    res.json({ message: "Security Guard account successfully removed" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to delete guard account",
        error: error.message,
      });
  }
};

// Update / Edit Security Guard account and optionally reset password
export const updateGuard = async (req, res) => {
  try {
    const { guardId } = req.params;
    const {
      last_name,
      first_name,
      middle_name,
      school_id,
      email,
      contact_number,
      password,
    } = req.body;

    // Check if guard exists
    const [existingGuard] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND role = "GUARD"',
      [guardId],
    );
    if (existingGuard.length === 0) {
      return res
        .status(404)
        .json({ message: "Security guard account not found" });
    }

    const current = existingGuard[0];
    const cleanLast = (last_name || current.last_name || "").trim();
    const cleanFirst = (first_name || current.first_name || "").trim();
    const cleanMI =
      middle_name !== undefined
        ? middle_name
          ? middle_name.trim().toUpperCase()
          : ""
        : current.middle_name || "";
    const formattedMI = cleanMI
      ? cleanMI.endsWith(".")
        ? cleanMI
        : `${cleanMI}.`
      : "";
    const fullName = formattedMI
      ? `${cleanLast}, ${cleanFirst} ${formattedMI}`
      : `${cleanLast}, ${cleanFirst}`;

    const newSchoolId = (school_id || current.school_id).trim();
    const newEmail = (email || current.email).trim();

    // Check uniqueness excluding current user
    const [duplicates] = await pool.query(
      "SELECT id FROM users WHERE (school_id = ? OR email = ?) AND id != ?",
      [newSchoolId, newEmail, guardId],
    );

    if (duplicates.length > 0) {
      return res
        .status(409)
        .json({
          message: "Badge ID or Email is already taken by another user",
        });
    }

    let updateQuery = `
      UPDATE users SET
        full_name = ?,
        first_name = ?,
        last_name = ?,
        middle_name = ?,
        school_id = ?,
        email = ?,
        contact_number = ?
    `;
    const params = [
      fullName,
      cleanFirst,
      cleanLast,
      formattedMI || null,
      newSchoolId,
      newEmail,
      contact_number ? contact_number.trim() : null,
    ];

    if (password && password.trim() !== "") {
      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      updateQuery += ", password = ?";
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ? AND role = "GUARD"';
    params.push(guardId);

    await pool.query(updateQuery, params);

    const updated = {
      id: Number(guardId),
      school_id: newSchoolId,
      email: newEmail,
      full_name: fullName,
      first_name: cleanFirst,
      last_name: cleanLast,
      middle_name: formattedMI || null,
      contact_number: contact_number ? contact_number.trim() : null,
      role: "GUARD",
      updated_at: new Date(),
    };

    res.json({
      message: `Security Guard account for ${fullName} updated successfully!`,
      guard: updated,
      passwordChanged: !!(password && password.trim() !== ""),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to update guard account",
        error: error.message,
      });
  }
};

// Real-time email notification dispatcher for RSU VPASS triggers
export const dispatchEmailNotification = async (req, res) => {
  try {
    const {
      type,
      toEmail,
      recipientName,
      vehicle,
      plateNumber,
      reason,
      passNumber,
      validUntil,
      orNumber,
      fee,
      academicYear,
      schoolId,
      rawPassword,
      gatePost,
    } = req.body;

    if (!toEmail) {
      return res.status(400).json({ message: "Recipient email (toEmail) is required." });
    }

    let result = { success: true };

    switch (type) {
      case "REGISTRATION_APPROVED":
        result = await sendRegistrationApprovedEmail({
          toEmail,
          recipientName,
          vehicle,
          plateNumber,
          fee: fee || "150.00",
        });
        break;

      case "REGISTRATION_REJECTED":
        result = await sendRegistrationRejectedEmail({
          toEmail,
          recipientName,
          vehicle,
          plateNumber,
          reason,
        });
        break;

      case "RECEIPT_REJECTED":
        result = await sendReceiptRejectedEmail({
          toEmail,
          recipientName,
          vehicle,
          plateNumber,
          orNumber,
          reason,
        });
        break;

      case "PASS_ISSUED":
        result = await sendPassIssuedEmail({
          toEmail,
          recipientName,
          vehicle,
          plateNumber,
          passNumber,
          validUntil,
          academicYear,
        });
        break;

      case "GUARD_CREATED":
        result = await sendGuardAccountCreatedEmail({
          toEmail,
          guardName: recipientName,
          schoolId,
          rawPassword,
          gatePost,
        });
        break;

      default:
        return res.status(400).json({ message: `Unknown email trigger type: ${type}` });
    }

    res.json({ message: "Email notification processed successfully", result });
  } catch (error) {
    console.error("[Dispatch Email Error]:", error);
    res.status(500).json({ message: "Failed to dispatch email", error: error.message });
  }
};
