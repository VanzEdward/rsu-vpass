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
