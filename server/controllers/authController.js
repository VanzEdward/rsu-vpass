import { sendPasswordResetOtpEmail } from '../services/emailService.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { 
      school_id, 
      email, 
      password, 
      full_name, 
      contact_number,
      first_name,
      last_name,
      middle_name,
      age,
      current_address,
      permanent_address,
      drivers_license_no,
      classification = 'STUDENT',
      year_course,
      department_unit,
      emergency_name,
      emergency_relation,
      emergency_phone
    } = req.body;

    const computedFullName = full_name || [first_name, middle_name, last_name].filter(Boolean).join(' ');

    if (!school_id || !email || !password || !computedFullName) {
      return res.status(400).json({ message: 'Identification Card No., Email, Password, and Full Name are required.' });
    }

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id, school_id, email FROM users WHERE LOWER(school_id) = LOWER(?) OR LOWER(email) = LOWER(?)',
      [school_id.trim(), email.trim()]
    );
    if (existing.length > 0) {
      const isDuplicateId = existing.some(u => (u.school_id || '').toLowerCase() === school_id.trim().toLowerCase());
      if (isDuplicateId) {
        return res.status(409).json({ message: 'Identification Card No. is already registered in the system.' });
      }
      return res.status(409).json({ message: 'Email address is already registered in the system.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (
        school_id, email, password, full_name, role, contact_number,
        first_name, last_name, middle_name, age, current_address, permanent_address,
        drivers_license_no, classification, year_course, department_unit,
        emergency_name, emergency_relation, emergency_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        school_id, 
        email, 
        hashedPassword, 
        computedFullName, 
        'CLIENT', 
        contact_number || null,
        first_name || null,
        last_name || null,
        middle_name || null,
        age ? Number(age) : null,
        current_address || null,
        permanent_address || null,
        drivers_license_no || null,
        classification,
        year_course || null,
        department_unit || null,
        emergency_name || null,
        emergency_relation || null,
        emergency_phone || null
      ]
    );

    const newUser = {
      id: result.insertId,
      school_id,
      email,
      full_name: computedFullName,
      first_name: first_name || null,
      last_name: last_name || null,
      middle_name: middle_name || null,
      role: 'CLIENT',
      contact_number: contact_number || null,
      photo_url: null,
      age: age ? Number(age) : null,
      current_address: current_address || null,
      permanent_address: permanent_address || null,
      drivers_license_no: drivers_license_no || null,
      classification,
      year_course: year_course || null,
      department_unit: department_unit || null,
      emergency_name: emergency_name || null,
      emergency_relation: emergency_relation || null,
      emergency_phone: emergency_phone || null
    };

    const token = jwt.sign(
      { id: newUser.id, school_id: newUser.school_id, email: newUser.email, role: newUser.role, full_name: newUser.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ 
      message: 'Account successfully created and enrolled in RSU VPASS!', 
      userId: result.insertId,
      user: newUser,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Can be email or school_id
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR school_id = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, school_id: user.school_id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        school_id: user.school_id,
        email: user.email,
        full_name: user.full_name,
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name,
        role: user.role,
        contact_number: user.contact_number,
        photo_url: user.photo_url,
        age: user.age,
        current_address: user.current_address,
        permanent_address: user.permanent_address,
        drivers_license_no: user.drivers_license_no,
        classification: user.classification || 'STUDENT',
        year_course: user.year_course,
        department_unit: user.department_unit,
        emergency_name: user.emergency_name,
        emergency_relation: user.emergency_relation,
        emergency_phone: user.emergency_phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, school_id, email, full_name, first_name, last_name, middle_name, role, contact_number, photo_url, age, current_address, permanent_address, drivers_license_no, classification, year_course, department_unit, emergency_name, emergency_relation, emergency_phone FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

export const checkId = async (req, res) => {
  try {
    const { school_id } = req.query;
    if (!school_id) return res.json({ exists: false });
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE LOWER(school_id) = LOWER(?)',
      [school_id.trim()]
    );
    res.json({ exists: rows.length > 0 });
  } catch (error) {
    res.json({ exists: false });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      email,
      school_id,
      contact_number,
      department_unit,
      emergency_name,
      emergency_relation,
      emergency_phone,
      current_address,
      permanent_address,
      password
    } = req.body;

    const cleanField = (val) => {
      if (val === undefined || val === null) return null;
      const trimmed = String(val).trim();
      return trimmed !== '' ? trimmed : null;
    };

    const cleanSchoolId = cleanField(school_id);
    const cleanEmail = cleanField(email);

    // Check duplicate email or school_id when updating either field
    if (cleanEmail || cleanSchoolId) {
      const dupeConditions = [];
      const dupeParams = [];
      if (cleanSchoolId) {
        dupeConditions.push('LOWER(school_id) = LOWER(?)');
        dupeParams.push(cleanSchoolId);
      }
      if (cleanEmail) {
        dupeConditions.push('LOWER(email) = LOWER(?)');
        dupeParams.push(cleanEmail);
      }
      dupeParams.push(userId);

      const [existing] = await pool.query(
        `SELECT id, school_id, email FROM users WHERE (${dupeConditions.join(' OR ')}) AND id != ?`,
        dupeParams
      );
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Identification Card No. or Email is already taken by another account.' });
      }
    }

    let updateQuery = `
      UPDATE users SET
        full_name = COALESCE(?, full_name),
        school_id = COALESCE(?, school_id),
        email = COALESCE(?, email),
        contact_number = COALESCE(?, contact_number),
        department_unit = COALESCE(?, department_unit),
        emergency_name = COALESCE(?, emergency_name),
        emergency_relation = COALESCE(?, emergency_relation),
        emergency_phone = COALESCE(?, emergency_phone),
        current_address = COALESCE(?, current_address),
        permanent_address = COALESCE(?, permanent_address),
        updated_at = NOW()
    `;
    const params = [
      cleanField(full_name),
      cleanSchoolId,
      cleanEmail,
      cleanField(contact_number),
      cleanField(department_unit),
      cleanField(emergency_name),
      cleanField(emergency_relation),
      cleanField(emergency_phone),
      cleanField(current_address),
      cleanField(permanent_address),
    ];

    if (password && String(password).trim() !== '') {
      const hashedPassword = await bcrypt.hash(String(password).trim(), 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(userId);

    await pool.query(updateQuery, params);

    const [rows] = await pool.query(
      'SELECT id, school_id, email, full_name, first_name, last_name, middle_name, role, contact_number, photo_url, age, current_address, permanent_address, drivers_license_no, classification, year_course, department_unit, emergency_name, emergency_relation, emergency_phone FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully!',
      user: rows[0],
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Request One-Time PIN for Password Reset (Students and Employees ONLY)
export const requestPasswordReset = async (req, res) => {
  try {
    const { identifier, school_id, email } = req.body;
    const cleanId = (school_id || identifier || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanId || !cleanEmail) {
      return res.status(400).json({ 
        message: 'Both School ID and registered Email address are required.' 
      });
    }

    // Lookup user by school_id and email
    const [users] = await pool.query(
      `SELECT id, school_id, email, full_name, role, classification 
       FROM users 
       WHERE LOWER(school_id) = LOWER(?) AND LOWER(email) = LOWER(?)`,
      [cleanId, cleanEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        message: 'No account found matching the provided School ID and Email address. Please check your spelling.' 
      });
    }

    const user = users[0];

    // STRICT ROLE PROTECTION: ONLY STUDENTS AND EMPLOYEES! NOT ADMIN AND NOT GUARD!
    if (user.role === 'PASO_ADMIN' || user.role === 'GUARD') {
      return res.status(403).json({
        message: 'Self-service password recovery is available for Student and Employee motorist accounts only. Administrative and security personnel must contact the PASO Chief.'
      });
    }

    // Invalidate any previous unused OTPs for this user
    await pool.query(
      'UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [user.id]
    );

    // Generate secure 6-digit numeric OTP
    const otpCode = String(crypto.randomInt(100000, 1000000));

    // Save single-use OTP with 15-minute expiration
    await pool.query(
      `INSERT INTO password_resets (user_id, school_id, email, otp_code, expires_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
      [user.id, user.school_id, user.email, otpCode]
    );

    // Send email via Brevo
    let emailResult = { success: false };
    try {
      emailResult = await sendPasswordResetOtpEmail({
        toEmail: user.email,
        recipientName: user.full_name,
        schoolId: user.school_id,
        otpCode,
        classification: user.classification || 'STUDENT'
      });
    } catch (mailErr) {
      console.warn('[Password Reset Email Warning]:', mailErr.message);
    }

    // Mask email for security display (e.g. j***n@rsu.edu.ph)
    const [namePart, domainPart] = user.email.split('@');
    const maskedEmail = namePart.length <= 2 
      ? `${namePart[0]}*@${domainPart}` 
      : `${namePart[0]}***${namePart[namePart.length - 1]}@${domainPart}`;

    const isDevSimulation = !process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.includes('your_brevo');

    res.json({
      message: `A single-use 6-digit One-Time PIN has been sent to ${maskedEmail}. Valid for 15 minutes.`,
      emailMasked: maskedEmail,
      schoolId: user.school_id,
      classification: user.classification || 'STUDENT',
      demoOtp: isDevSimulation ? otpCode : undefined
    });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ message: 'Failed to process password reset request', error: error.message });
  }
};

// Verify One-Time PIN and set New Password (Single-Use Only!)
export const verifyAndResetPassword = async (req, res) => {
  try {
    const { school_id, identifier, email, otp, newPassword, confirmPassword } = req.body;
    const cleanId = (school_id || identifier || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();
    const pass = newPassword || '';

    if (!cleanId || !cleanEmail || !cleanOtp || !pass) {
      return res.status(400).json({ message: 'All fields (School ID, Email, One-Time PIN, and New Password) are required.' });
    }

    if (pass.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    if (confirmPassword && pass !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation password do not match.' });
    }

    // Find active, unused, non-expired OTP record
    const [records] = await pool.query(
      `SELECT pr.*, u.id as user_id, u.role, u.classification, u.full_name
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE LOWER(pr.school_id) = LOWER(?) 
         AND LOWER(pr.email) = LOWER(?)
         AND pr.otp_code = ?
         AND pr.used_at IS NULL
         AND pr.expires_at > NOW()
       ORDER BY pr.id DESC LIMIT 1`,
      [cleanId, cleanEmail, cleanOtp]
    );

    if (records.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid or expired One-Time PIN. Please check the 6 digits or request a fresh PIN.' 
      });
    }

    const resetRecord = records[0];

    // STRICT ROLE PROTECTION: NOT ADMIN AND NOT GUARD!
    if (resetRecord.role === 'PASO_ADMIN' || resetRecord.role === 'GUARD') {
      return res.status(403).json({ message: 'Unauthorized operation.' });
    }

    // IMMEDIATELY INVALIDATE AND MARK AS USED (SINGLE-USE ENFORCEMENT)
    await pool.query(
      'UPDATE password_resets SET used_at = NOW() WHERE id = ?',
      [resetRecord.id]
    );

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(pass, 10);
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, resetRecord.user_id]
    );

    res.json({
      message: 'Password successfully reset! You can now log in with your new credentials.',
      schoolId: resetRecord.school_id
    });
  } catch (error) {
    console.error('Error in verifyAndResetPassword:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};

/**
 * Change Password for Authenticated Users (Profile Settings)
 * Requires valid current password and updates the hash in users table
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: 'Please enter your current password.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match.' });
    }

    // Fetch user with current password hash
    const [users] = await pool.query('SELECT id, password, school_id, email, full_name FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const user = users[0];

    // Verify current password with bcrypt
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return res.status(400).json({ message: 'Current password is incorrect. Please try again.' });
    }

    // Ensure new password is not identical to current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from your current password.' });
    }

    // Hash new password and save to database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password successfully updated! Your account is now secured with the new password.'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};
