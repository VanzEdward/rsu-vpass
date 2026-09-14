import pool from '../config/db.js';

// Verify Pass (via QR Code string or pass number)
export const verifyPass = async (req, res) => {
  try {
    const { code } = req.body; // Can be QR data payload or Pass Number
    if (!code) return res.status(400).json({ message: 'Pass code or QR payload required' });

    // 1. Check in vehicle_passes
    const [passes] = await pool.query(`
      SELECT 
        vp.id as pass_id, vp.pass_number, vp.valid_until, vp.status,
        v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model, v.vehicle_photo_url,
        u.full_name, u.school_id, u.photo_url as client_photo, u.contact_number
      FROM vehicle_passes vp
      JOIN vehicles v ON vp.vehicle_id = v.id
      JOIN users u ON vp.user_id = u.id
      WHERE vp.pass_number = ? OR vp.qr_code_data = ?
    `, [code, code]);

    if (passes.length > 0) {
      const pass = passes[0];
      const isExpired = new Date(pass.valid_until) < new Date();
      return res.json({
        found: true,
        type: 'REGISTERED',
        isValid: pass.status === 'ACTIVE' && !isExpired,
        status: isExpired ? 'EXPIRED' : pass.status,
        pass
      });
    }

    // 2. Check in temporary_passes
    const [tempPasses] = await pool.query(`
      SELECT * FROM temporary_passes WHERE pass_number = ? OR qr_code_data = ?
    `, [code, code]);

    if (tempPasses.length > 0) {
      const temp = tempPasses[0];
      const now = new Date();
      const isValid = new Date(temp.valid_from) <= now && now <= new Date(temp.valid_to) && temp.status === 'ACTIVE';
      return res.json({
        found: true,
        type: 'TEMPORARY',
        isValid,
        status: isValid ? 'ACTIVE' : 'EXPIRED',
        pass: temp
      });
    }

    return res.status(404).json({ found: false, message: 'Pass not found or invalid' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying pass', error: error.message });
  }
};

// Fallback manual search (by owner name, School ID, plate number, or pass number)
export const manualSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search term is required' });
    }

    const searchTerm = `%${query.trim()}%`;
    const [results] = await pool.query(`
      SELECT 
        vp.id as pass_id, vp.pass_number, vp.valid_until, vp.status,
        v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model,
        u.full_name, u.school_id, u.contact_number
      FROM vehicle_passes vp
      JOIN vehicles v ON vp.vehicle_id = v.id
      JOIN users u ON vp.user_id = u.id
      WHERE u.full_name LIKE ? 
         OR u.school_id LIKE ? 
         OR v.plate_number LIKE ? 
         OR vp.pass_number LIKE ?
      LIMIT 20
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Manual search failed', error: error.message });
  }
};

// Log Entry or Exit Event
export const logVerification = async (req, res) => {
  try {
    const { pass_number, plate_number, owner_name, verification_type, verification_method, verification_status } = req.body;

    await pool.query(`
      INSERT INTO verification_logs 
      (pass_number, plate_number, owner_name, guard_id, verification_type, verification_method, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      pass_number,
      plate_number,
      owner_name,
      req.user ? req.user.id : null,
      verification_type || 'ENTRY',
      verification_method || 'QR_SCAN',
      verification_status || 'VALID'
    ]);

    res.status(201).json({ message: 'Verification event recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Error recording verification log', error: error.message });
  }
};

// Get Recent Logs for Guard
export const getRecentLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(`
      SELECT vl.*, u.full_name as guard_name
      FROM verification_logs vl
      LEFT JOIN users u ON vl.guard_id = u.id
      ORDER BY vl.timestamp DESC
      LIMIT 50
    `);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};
