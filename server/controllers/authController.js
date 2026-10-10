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
    const { full_name, email, school_id, contact_number, department_unit, password } = req.body;

    // Check duplicate email or school_id
    if (email || school_id) {
      const [existing] = await pool.query(
        'SELECT id, school_id, email FROM users WHERE (LOWER(school_id) = LOWER(?) OR LOWER(email) = LOWER(?)) AND id != ?',
        [school_id ? school_id.trim() : '', email ? email.trim() : '', userId]
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
        department_unit = COALESCE(?, department_unit)
    `;
    const params = [
      full_name || null,
      school_id || null,
      email || null,
      contact_number || null,
      department_unit || null,
    ];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(userId);

    await pool.query(updateQuery, params);

    const [rows] = await pool.query(
      'SELECT id, school_id, email, full_name, role, contact_number, department_unit FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully!',
      user: rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

export const resetAdminProfile = async (req, res) => {
  try {
    if (req.user.role !== 'PASO_ADMIN') {
      return res.status(403).json({ message: 'Only PASO Admin can perform this action' });
    }

    // Default seeded password for PASO-ADMIN-01
    const defaultPassword = 'admin';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await pool.query(
      `UPDATE users SET
        full_name = 'PASO Administrator',
        school_id = 'PASO-ADMIN-01',
        email = 'paso@rsu.edu.ph',
        contact_number = '+63 917 111 2222',
        department_unit = 'Physical Assets and Security Office (PASO)',
        password = ?
      WHERE id = ?`,
      [hashedPassword, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, school_id, email, full_name, role, contact_number, department_unit FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Admin information and credentials have been reset to factory defaults!',
      user: rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset admin profile', error: error.message });
  }
};
