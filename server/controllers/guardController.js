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
    const { query, classification = 'ALL' } = req.query;
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search term is required' });
    }

    const searchTerm = `%${query.trim()}%`;
    let results = [];

    // 1. Search registered passes if not filtering VISITOR only
    if (classification === 'ALL' || classification === 'STUDENT' || classification === 'EMPLOYEE') {
      const [regResults] = await pool.query(`
        SELECT 
          vp.id as pass_id, vp.pass_number, vp.valid_until, vp.status,
          v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model,
          u.full_name, u.school_id, u.contact_number,
          CASE 
            WHEN u.school_id LIKE 'EMP%' OR u.school_id LIKE 'FAC%' OR u.role = 'PASO_ADMIN' THEN 'EMPLOYEE'
            ELSE 'STUDENT'
          END as classification
        FROM vehicle_passes vp
        JOIN vehicles v ON vp.vehicle_id = v.id
        JOIN users u ON vp.user_id = u.id
        WHERE u.full_name LIKE ? 
           OR u.school_id LIKE ? 
           OR v.plate_number LIKE ? 
           OR vp.pass_number LIKE ?
        LIMIT 20
      `, [searchTerm, searchTerm, searchTerm, searchTerm]);

      const filteredReg = classification === 'ALL' 
        ? regResults 
        : regResults.filter(r => r.classification === classification);

      results = results.concat(filteredReg);
    }

    // 2. Search temporary visitor passes if not filtering STUDENT or EMPLOYEE only
    if (classification === 'ALL' || classification === 'VISITOR') {
      const [tempResults] = await pool.query(`
        SELECT 
          id as pass_id, pass_number, valid_to as valid_until, status,
          plate_number, vehicle_description as vehicle_type, '' as make, '' as model, '' as color, 2026 as year_model,
          visitor_name as full_name, host_name as school_id, '' as contact_number,
          'VISITOR' as classification
        FROM temporary_passes
        WHERE visitor_name LIKE ?
           OR plate_number LIKE ?
           OR pass_number LIKE ?
           OR host_name LIKE ?
        LIMIT 20
      `, [searchTerm, searchTerm, searchTerm, searchTerm]);

      results = results.concat(tempResults);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Manual search failed', error: error.message });
  }
};

// Create Digital Temporary Visitor Pass (1 to 7 Days Stay)
export const createTemporaryPass = async (req, res) => {
  try {
    const { visitor_name, host_name, plate_number, vehicle_description, duration_days = 1 } = req.body;
    if (!visitor_name || !plate_number) {
      return res.status(400).json({ message: 'Visitor name and plate number are required' });
    }

    const passNumber = `TMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const validFrom = new Date();
    const validTo = new Date();
    validTo.setDate(validTo.getDate() + (parseInt(duration_days, 10) || 1));
    const cleanPlate = plate_number.trim().toUpperCase().replace(/\s+/g, '');
    const qrData = `RSU-VPASS:${passNumber}:${cleanPlate}:VISITOR`;

    const [result] = await pool.query(`
      INSERT INTO temporary_passes 
      (pass_number, visitor_name, host_name, plate_number, vehicle_description, valid_from, valid_to, qr_code_data, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `, [
      passNumber,
      visitor_name.trim(),
      host_name || 'Administration Building',
      plate_number.trim().toUpperCase(),
      vehicle_description || 'Motorcycle',
      validFrom,
      validTo,
      qrData,
      req.user ? req.user.id : null
    ]);

    // Automatically record ENTRY event in verification logs
    await pool.query(`
      INSERT INTO verification_logs 
      (pass_number, plate_number, owner_name, guard_id, verification_type, verification_method, verification_status)
      VALUES (?, ?, ?, ?, 'ENTRY', 'MANUAL_SEARCH', 'VALID')
    `, [
      passNumber,
      plate_number.trim().toUpperCase(),
      `${visitor_name.trim()} (Visitor)`,
      req.user ? req.user.id : null
    ]);

    res.status(201).json({
      message: 'Temporary visitor pass issued successfully',
      pass: {
        id: result.insertId,
        pass_number: passNumber,
        visitor_name,
        plate_number: plate_number.trim().toUpperCase(),
        valid_from: validFrom,
        valid_to: validTo,
        qr_code_data: qrData,
        status: 'ACTIVE'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating temporary pass', error: error.message });
  }
};

// Get All Temporary Visitor Passes (Active and Historical)
export const getTemporaryPasses = async (req, res) => {
  try {
    const [passes] = await pool.query(`
      SELECT tp.*, u.full_name as issued_by_guard
      FROM temporary_passes tp
      LEFT JOIN users u ON tp.created_by = u.id
      ORDER BY tp.created_at DESC
      LIMIT 100
    `);
    res.json(passes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching temporary passes', error: error.message });
  }
};

// Log Visitor Exit Event
export const logVisitorExitEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const [passes] = await pool.query('SELECT * FROM temporary_passes WHERE id = ? OR pass_number = ?', [id, id]);
    if (passes.length === 0) {
      return res.status(404).json({ message: 'Visitor pass not found' });
    }

    const pass = passes[0];

    // Log EXIT event in audit logs
    await pool.query(`
      INSERT INTO verification_logs 
      (pass_number, plate_number, owner_name, guard_id, verification_type, verification_method, verification_status)
      VALUES (?, ?, ?, ?, 'EXIT', 'MANUAL_SEARCH', 'VALID')
    `, [
      pass.pass_number,
      pass.plate_number,
      `${pass.visitor_name} (Visitor)`,
      req.user ? req.user.id : null
    ]);

    res.json({ message: 'Visitor exit successfully recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging visitor exit', error: error.message });
  }
};

// Renew Temporary Visitor Pass
export const renewTemporaryPass = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration_days = 1 } = req.body;

    const [passes] = await pool.query('SELECT * FROM temporary_passes WHERE id = ? OR pass_number = ?', [id, id]);
    if (passes.length === 0) {
      return res.status(404).json({ message: 'Visitor pass not found' });
    }

    const pass = passes[0];
    const newValidTo = new Date();
    newValidTo.setDate(newValidTo.getDate() + (parseInt(duration_days, 10) || 1));

    await pool.query(`
      UPDATE temporary_passes 
      SET valid_to = ?, status = 'ACTIVE' 
      WHERE id = ?
    `, [newValidTo, pass.id]);

    // Record renewal ENTRY event
    await pool.query(`
      INSERT INTO verification_logs 
      (pass_number, plate_number, owner_name, guard_id, verification_type, verification_method, verification_status)
      VALUES (?, ?, ?, ?, 'ENTRY', 'MANUAL_SEARCH', 'VALID')
    `, [
      pass.pass_number,
      pass.plate_number,
      `${pass.visitor_name} (Visitor Renewed)`,
      req.user ? req.user.id : null
    ]);

    res.json({ message: 'Visitor pass successfully renewed', valid_to: newValidTo });
  } catch (error) {
    res.status(500).json({ message: 'Error renewing temporary pass', error: error.message });
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

