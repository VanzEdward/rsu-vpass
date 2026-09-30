import pool from '../config/db.js';

// Get dashboard counts & statistics for PASO admin
export const getAdminStats = async (req, res) => {
  try {
    const [[pendingApps]] = await pool.query('SELECT COUNT(*) as count FROM applications WHERE status = "PENDING"');
    const [[activePasses]] = await pool.query('SELECT COUNT(*) as count FROM vehicle_passes WHERE status = "ACTIVE"');
    const [[totalVehicles]] = await pool.query('SELECT COUNT(*) as count FROM vehicles');
    const [[totalUsers]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "CLIENT"');

    res.json({
      pendingApplications: pendingApps.count,
      activePasses: activePasses.count,
      totalVehicles: totalVehicles.count,
      totalClients: totalUsers.count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Get all applications for review
export const getAllApplications = async (req, res) => {
  try {
    const [apps] = await pool.query(`
      SELECT 
        a.id as application_id, a.status, a.rejection_reason, a.driver_license_url, a.or_cr_url, a.created_at,
        u.id as user_id, u.school_id, u.full_name, u.email, u.contact_number,
        v.id as vehicle_id, v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model, v.vehicle_photo_url,
        p.or_number, p.amount, p.paid_at
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN vehicles v ON a.vehicle_id = v.id
      LEFT JOIN payments p ON p.application_id = a.id
      ORDER BY a.created_at DESC
    `);
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Review Application (Approve or Reject with mandatory remark)
export const reviewApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
    }

    if (status === 'REJECTED' && (!rejection_reason || rejection_reason.trim() === '')) {
      return res.status(400).json({ message: 'Rejection reason is required when rejecting an application' });
    }

    await pool.query(
      'UPDATE applications SET status = ?, rejection_reason = ? WHERE id = ?',
      [status, status === 'REJECTED' ? rejection_reason : null, applicationId]
    );

    res.json({ message: `Application marked as ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Error reviewing application', error: error.message });
  }
};

// Record Cashier Payment / Official Receipt Reference
export const recordPayment = async (req, res) => {
  try {
    const { application_id, or_number, amount, remarks } = req.body;
    if (!application_id || !or_number) {
      return res.status(400).json({ message: 'Application ID and OR Number are required' });
    }

    // Insert payment record
    await pool.query(
      'INSERT INTO payments (application_id, or_number, amount, recorded_by, remarks) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE or_number = VALUES(or_number), amount = VALUES(amount)',
      [application_id, or_number, amount || 0, req.user.id, remarks || '']
    );

    // Fetch application details to auto-generate pass
    const [appRows] = await pool.query('SELECT user_id, vehicle_id FROM applications WHERE id = ?', [application_id]);
    if (appRows.length > 0) {
      const { user_id, vehicle_id } = appRows[0];
      const year = new Date().getFullYear();
      const passNumber = `VP-${year}-${String(application_id).padStart(4, '0')}`;
      const validUntil = `${year}-12-31`; // Standard annual validity
      const qrData = `RSU-VPASS:${passNumber}:${vehicle_id}:${user_id}`;

      // Insert or activate pass
      await pool.query(`
        INSERT INTO vehicle_passes (pass_number, vehicle_id, user_id, qr_code_data, valid_until, status)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE')
        ON DUPLICATE KEY UPDATE status = 'ACTIVE', valid_until = VALUES(valid_until)
      `, [passNumber, vehicle_id, user_id, qrData, validUntil]);
    }

    res.json({ message: 'Payment recorded and official Vehicle Pass issued successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record payment', error: error.message });
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
    res.status(500).json({ message: 'Error fetching guards', error: error.message });
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
      password 
    } = req.body;

    if (!last_name || !first_name || !school_id || !email || !password) {
      return res.status(400).json({ 
        message: 'Last Name, First Name, Guard Badge/ID No., Email, and Password are required.' 
      });
    }

    // Format Full Name strictly as: LAST NAME, FIRST NAME, M.I.
    const cleanLast = last_name.trim();
    const cleanFirst = first_name.trim();
    const cleanMI = middle_name ? middle_name.trim().toUpperCase() : '';
    const formattedMI = cleanMI ? (cleanMI.endsWith('.') ? cleanMI : `${cleanMI}.`) : '';
    const fullName = formattedMI 
      ? `${cleanLast}, ${cleanFirst} ${formattedMI}`
      : `${cleanLast}, ${cleanFirst}`;

    // Check if school_id or email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE school_id = ? OR email = ?',
      [school_id.trim(), email.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        message: 'A user with this Guard Badge ID or Email already exists.' 
      });
    }

    // Dynamically import bcryptjs if needed or import at top
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (
        school_id, email, password, full_name, first_name, last_name, middle_name,
        role, contact_number, classification
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'GUARD', ?, 'STAFF')`,
      [
        school_id.trim(),
        email.trim(),
        hashedPassword,
        fullName,
        cleanFirst,
        cleanLast,
        formattedMI || null,
        contact_number ? contact_number.trim() : null
      ]
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
      role: 'GUARD',
      created_at: new Date()
    };

    res.status(201).json({
      message: `Security Guard account for ${fullName} successfully created!`,
      guard: newGuard
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create guard account', error: error.message });
  }
};

// Delete / Revoke Security Guard account
export const deleteGuard = async (req, res) => {
  try {
    const { guardId } = req.params;
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ? AND role = "GUARD"',
      [guardId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Guard account not found or already removed' });
    }

    res.json({ message: 'Security Guard account successfully removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete guard account', error: error.message });
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
      password 
    } = req.body;

    // Check if guard exists
    const [existingGuard] = await pool.query('SELECT * FROM users WHERE id = ? AND role = "GUARD"', [guardId]);
    if (existingGuard.length === 0) {
      return res.status(404).json({ message: 'Security guard account not found' });
    }

    const current = existingGuard[0];
    const cleanLast = (last_name || current.last_name || '').trim();
    const cleanFirst = (first_name || current.first_name || '').trim();
    const cleanMI = middle_name !== undefined ? (middle_name ? middle_name.trim().toUpperCase() : '') : (current.middle_name || '');
    const formattedMI = cleanMI ? (cleanMI.endsWith('.') ? cleanMI : `${cleanMI}.`) : '';
    const fullName = formattedMI 
      ? `${cleanLast}, ${cleanFirst} ${formattedMI}`
      : `${cleanLast}, ${cleanFirst}`;

    const newSchoolId = (school_id || current.school_id).trim();
    const newEmail = (email || current.email).trim();

    // Check uniqueness excluding current user
    const [duplicates] = await pool.query(
      'SELECT id FROM users WHERE (school_id = ? OR email = ?) AND id != ?',
      [newSchoolId, newEmail, guardId]
    );

    if (duplicates.length > 0) {
      return res.status(409).json({ message: 'Badge ID or Email is already taken by another user' });
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
      contact_number ? contact_number.trim() : null
    ];

    if (password && password.trim() !== '') {
      const bcrypt = (await import('bcryptjs')).default;
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      updateQuery += ', password = ?';
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
      role: 'GUARD',
      updated_at: new Date()
    };

    res.json({
      message: `Security Guard account for ${fullName} updated successfully!`,
      guard: updated,
      passwordChanged: !!(password && password.trim() !== '')
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update guard account', error: error.message });
  }
};


