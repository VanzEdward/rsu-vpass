import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { school_id, email, password, full_name, contact_number } = req.body;
    if (!school_id || !email || !password || !full_name) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // Check if user exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE school_id = ? OR email = ?',
      [school_id, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'School ID or Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (school_id, email, password, full_name, role, contact_number) VALUES (?, ?, ?, ?, ?, ?)',
      [school_id, email, hashedPassword, full_name, 'CLIENT', contact_number || null]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
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
      process.env.JWT_SECRET || 'rsu_vpass_super_secret_jwt_token_2026_romblon',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        school_id: user.school_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        photo_url: user.photo_url
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, school_id, email, full_name, role, contact_number, photo_url FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};
