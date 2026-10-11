import pool from '../config/db.js';

// Verify Pass (via QR Code string or pass number or plate)
export const verifyPass = async (req, res) => {
  try {
    const { code } = req.body; // Can be QR data payload, Pass Number, or Plate
    if (!code) return res.status(400).json({ message: 'Pass code or QR payload required' });

    let extractedPassNum = code.trim();
    let extractedPlate = '';
    if (code.startsWith('RSU-VPASS:')) {
      const parts = code.split(':');
      extractedPassNum = (parts[1] || '').trim();
      extractedPlate = (parts[2] || '').trim().replace(/\s+/g, '').toUpperCase();
    }
    const cleanCode = code.trim();
    const cleanPlate = (extractedPlate || cleanCode).replace(/\s+/g, '').toUpperCase();

    // 1. Check in vehicle_passes
    const [passes] = await pool.query(`
      SELECT 
        vp.id as pass_id, vp.pass_number, vp.valid_until, vp.status, vp.qr_code_data,
        v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model, v.vehicle_photo_url,
        u.full_name, u.school_id, COALESCE(a.applicant_photo, u.photo_url) as client_photo, u.contact_number,
        u.classification, u.year_course, u.department_unit
      FROM vehicle_passes vp
      JOIN vehicles v ON vp.vehicle_id = v.id
      JOIN users u ON vp.user_id = u.id
      LEFT JOIN applications a ON a.vehicle_id = v.id
      WHERE vp.pass_number = ? 
         OR vp.pass_number = ?
         OR vp.qr_code_data = ?
         OR REPLACE(UPPER(v.plate_number), ' ', '') = ?
      ORDER BY vp.id DESC
      LIMIT 1
    `, [cleanCode, extractedPassNum, cleanCode, cleanPlate]);

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
      SELECT * FROM temporary_passes 
      WHERE pass_number = ? 
         OR pass_number = ?
         OR qr_code_data = ?
         OR REPLACE(UPPER(plate_number), ' ', '') = ?
      ORDER BY id DESC
      LIMIT 1
    `, [cleanCode, extractedPassNum, cleanCode, cleanPlate]);

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
    const noSpacesSearch = `%${query.trim().replace(/\s+/g, '')}%`;
    let results = [];

    // 1. Search registered passes if not filtering VISITOR only
    if (classification === 'ALL' || classification === 'STUDENT' || classification === 'EMPLOYEE') {
      const [regResults] = await pool.query(`
        SELECT 
          vp.id as pass_id, vp.pass_number, vp.valid_until, vp.status, vp.qr_code_data,
          v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model,
          u.full_name, u.school_id, u.contact_number,
          COALESCE(a.applicant_photo, u.photo_url) as client_photo,
          u.year_course, u.department_unit,
          CASE 
            WHEN u.school_id LIKE 'EMP%' OR u.school_id LIKE 'FAC%' OR u.role = 'PASO_ADMIN' THEN 'EMPLOYEE'
            ELSE 'STUDENT'
          END as classification
        FROM vehicle_passes vp
        JOIN vehicles v ON vp.vehicle_id = v.id
        JOIN users u ON vp.user_id = u.id
        LEFT JOIN applications a ON a.vehicle_id = v.id
        WHERE u.full_name LIKE ? 
           OR u.school_id LIKE ? 
           OR v.plate_number LIKE ? 
           OR REPLACE(v.plate_number, ' ', '') LIKE ?
           OR vp.pass_number LIKE ?
        LIMIT 20
      `, [searchTerm, searchTerm, searchTerm, noSpacesSearch, searchTerm]);

      const filteredReg = classification === 'ALL' 
        ? regResults 
        : regResults.filter(r => r.classification === classification);

      results = results.concat(filteredReg);
    }

    // 2. Search temporary visitor passes if not filtering STUDENT or EMPLOYEE only
    if (classification === 'ALL' || classification === 'VISITOR') {
      const [tempResults] = await pool.query(`
        SELECT 
          id as pass_id, pass_number, valid_to as valid_until, status, qr_code_data,
          plate_number, vehicle_description as vehicle_type, '' as make, '' as model, '' as color, 2026 as year_model,
          visitor_name as full_name, host_name as school_id, '' as contact_number,
          destination, purpose, contact, id_presented, entry_gate,
          'VISITOR' as classification
        FROM temporary_passes
        WHERE visitor_name LIKE ? 
           OR plate_number LIKE ? 
           OR REPLACE(plate_number, ' ', '') LIKE ?
           OR pass_number LIKE ? 
           OR host_name LIKE ?
        LIMIT 20
      `, [searchTerm, searchTerm, noSpacesSearch, searchTerm, searchTerm]);

      results = results.concat(tempResults);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Manual search failed', error: error.message });
  }
};

// Get all registered vehicle passes for Guard scanner
export const getGuardPasses = async (req, res) => {
  try {
    const [apps] = await pool.query(`
      SELECT 
        a.id, a.app_ref_number, a.status, 
        a.applicant_photo, a.created_at,
        u.id as user_id, u.school_id, u.full_name, u.email, u.contact_number,
        u.classification, u.year_course, u.department_unit,
        v.id as vehicle_id, v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model,
        vp.id as pass_id, vp.pass_number, vp.valid_until, vp.qr_code_data, vp.status as pass_status
      FROM vehicle_passes vp
      JOIN vehicles v ON vp.vehicle_id = v.id
      JOIN users u ON vp.user_id = u.id
      LEFT JOIN applications a ON a.vehicle_id = v.id
      ORDER BY vp.id DESC
    `);

    const formatted = apps.map((app) => ({
      id: app.app_ref_number || `APP-2026-${String(app.id || app.pass_id).padStart(4, '0')}`,
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
      status: app.status || 'PASS_ISSUED',
      pass: {
        id: app.pass_id,
        passNumber: app.pass_number,
        validUntil: app.valid_until,
        qrData: app.qr_code_data,
        status: app.pass_status || 'ACTIVE',
      },
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching guard passes:', error);
    res.status(500).json({ message: 'Error fetching guard passes', error: error.message });
  }
};

// Create Digital Temporary Visitor Pass (1 to 7 Days Stay)
export const createTemporaryPass = async (req, res) => {
  try {
    const name = req.body.visitor_name || req.body.name;
    const plate = req.body.plate_number || req.body.plateNumber;
    const destination = req.body.destination || req.body.host_name || 'Administration Building';
    const purpose = req.body.purpose || 'Official Business';
    const contact = req.body.contact || 'N/A';
    const idPresented = req.body.id_presented || req.body.idPresented || "Driver's License";
    const vehicleType = req.body.vehicle_description || req.body.vehicleType || 'Motorcycle';
    const durationDays = parseInt(req.body.duration_days || req.body.validityDuration || req.body.validDays || 1, 10);
    const gateStation = req.body.entry_gate || req.body.gate || 'Gate 1';

    if (!name || !plate) {
      return res.status(400).json({ message: 'Visitor name and plate number are required' });
    }

    const passNumber = req.body.pass_number || req.body.passNumber || `TMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const validFrom = new Date();
    const validTo = new Date();
    validTo.setDate(validTo.getDate() + (durationDays || 1));
    const cleanPlate = plate.trim().toUpperCase().replace(/\s+/g, '');
    const qrData = `RSU-VPASS:${passNumber}:${cleanPlate}:VISITOR`;

    const [result] = await pool.query(`
      INSERT INTO temporary_passes 
      (pass_number, visitor_name, host_name, plate_number, vehicle_description, valid_from, valid_to, qr_code_data, status, created_by, destination, purpose, contact, id_presented, entry_gate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?)
    `, [
      passNumber,
      name.trim(),
      destination,
      plate.trim().toUpperCase(),
      vehicleType,
      validFrom,
      validTo,
      qrData,
      req.user ? req.user.id : null,
      destination,
      purpose,
      contact,
      idPresented,
      gateStation
    ]);

    // Automatically record ENTRY event in verification logs (single authoritative record)
    await pool.query(`
      INSERT INTO verification_logs 
      (pass_number, plate_number, owner_name, guard_id, verification_type, verification_method, verification_status, gate_station, classification)
      VALUES (?, ?, ?, ?, 'ENTRY', 'MANUAL_SEARCH', 'VALID', ?, 'VISITOR')
    `, [
      passNumber,
      plate.trim().toUpperCase(),
      name.trim(),
      req.user ? req.user.id : null,
      gateStation
    ]);

    const formattedPass = {
      id: passNumber,
      db_id: result.insertId,
      pass_number: passNumber,
      name: name.trim(),
      visitor_name: name.trim(),
      contact,
      idPresented,
      plateNumber: plate.trim().toUpperCase(),
      vehicleType,
      destination,
      purpose,
      validDays: durationDays,
      validUntil: durationDays === 1 ? 'Today • 11:59 PM (1 Day)' : `${validTo.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} (${durationDays} Days)`,
      entryGate: gateStation,
      entryTime: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Today`,
      entryDate: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'INSIDE',
      exitGate: null,
      exitTime: null,
      classification: 'VISITOR',
      qrData
    };

    res.status(201).json({
      message: 'Temporary visitor pass issued successfully',
      pass: formattedPass
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

    const formatted = passes.map(tp => {
      const entryDate = new Date(tp.created_at || tp.valid_from);
      const isExited = tp.status === 'EXITED';
      const isExpired = new Date(tp.valid_to) < new Date();

      return {
        id: tp.pass_number || `TMP-${tp.id}`,
        db_id: tp.id,
        pass_number: tp.pass_number,
        name: tp.visitor_name,
        visitor_name: tp.visitor_name,
        contact: tp.contact || 'N/A',
        idPresented: tp.id_presented || "Driver's License",
        plateNumber: tp.plate_number,
        plate_number: tp.plate_number,
        vehicleType: tp.vehicle_description || 'Motorcycle',
        destination: tp.destination || tp.host_name || 'Administration Building',
        purpose: tp.purpose || 'Official Business',
        validDays: Math.ceil((new Date(tp.valid_to) - new Date(tp.valid_from)) / (1000 * 60 * 60 * 24)) || 1,
        validUntil: isExpired ? 'Expired' : `${new Date(tp.valid_to).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`,
        entryGate: tp.entry_gate || 'Gate 1',
        entryTime: `${entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        entryDate: entryDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        status: isExited ? 'EXITED' : (isExpired ? 'EXPIRED' : 'INSIDE'),
        exitGate: tp.exit_gate,
        exitTime: tp.exit_gate ? 'Exited' : null,
        classification: 'VISITOR',
        qrData: tp.qr_code_data
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching temporary passes', error: error.message });
  }
};

// Log Visitor Exit Event
export const logVisitorExitEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const exitGate = req.body.exit_gate || req.body.gate || 'Gate 1';
    const cleanId = String(id).trim();
    const cleanPlate = cleanId.replace(/\s+/g, '').toUpperCase();

    const [passes] = await pool.query(`
      SELECT * FROM temporary_passes 
      WHERE id = ? 
         OR pass_number = ? 
         OR plate_number = ? 
         OR REPLACE(UPPER(plate_number), ' ', '') = ?
      ORDER BY id DESC
      LIMIT 1
    `, [cleanId, cleanId, cleanId, cleanPlate]);

    if (passes.length === 0) {
      return res.status(404).json({ message: 'Visitor pass not found' });
    }

    const pass = passes[0];

    // Update status to EXITED and record exit gate
    await pool.query(`
      UPDATE temporary_passes 
      SET status = 'EXITED', exit_gate = ?
      WHERE id = ?
    `, [exitGate, pass.id]);

    // Check if an EXIT log was already inserted in the last 10 seconds to avoid duplicates
    const [recentExit] = await pool.query(`
      SELECT id FROM verification_logs 
      WHERE (pass_number = ? OR plate_number = ?)
        AND verification_type = 'EXIT'
        AND timestamp >= NOW() - INTERVAL 10 SECOND
      LIMIT 1
    `, [pass.pass_number, pass.plate_number]);

    if (recentExit.length === 0) {
      // Log EXIT event in audit logs
      await pool.query(`
        INSERT INTO verification_logs 
        (pass_number, plate_number, owner_name, guard_id, verification_type, verification_method, verification_status, gate_station, classification)
        VALUES (?, ?, ?, ?, 'EXIT', 'MANUAL_SEARCH', 'VALID', ?, 'VISITOR')
      `, [
        pass.pass_number,
        pass.plate_number,
        pass.visitor_name,
        req.user ? req.user.id : null,
        exitGate
      ]);
    }

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
      (pass_number, plate_number, owner_name, guard_id, verification_type, verification_method, verification_status, gate_station, classification)
      VALUES (?, ?, ?, ?, 'ENTRY', 'MANUAL_SEARCH', 'VALID', 'Gate 1', 'VISITOR')
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
    const { 
      pass_number, passNumber,
      plate_number, plateNumber,
      owner_name, owner,
      verification_type, type,
      verification_method, method,
      verification_status, status,
      gate_station, gate,
      classification
    } = req.body;

    const passNum = pass_number || passNumber;
    const plate = plate_number || plateNumber;
    const ownerName = owner_name || owner || 'Registered Motorist';
    const vType = verification_type || type || 'ENTRY';
    const vMethod = verification_method || method || 'QR_SCAN';
    const vStatus = verification_status || status || 'VALID';
    const gateSt = gate_station || gate || 'Gate 1';
    const vClass = classification || 'STUDENT';

    const [result] = await pool.query(`
      INSERT INTO verification_logs 
      (pass_number, plate_number, owner_name, guard_id, verification_type, verification_method, verification_status, gate_station, classification)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      passNum,
      plate,
      ownerName,
      req.user ? req.user.id : null,
      vType,
      vMethod,
      vStatus,
      gateSt,
      vClass
    ]);

    res.status(201).json({ 
      message: 'Verification event recorded',
      id: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording verification log', error: error.message });
  }
};

// Get Recent Logs for Guard and Admin
export const getRecentLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(`
      SELECT vl.*, u.full_name as guard_name
      FROM verification_logs vl
      LEFT JOIN users u ON vl.guard_id = u.id
      ORDER BY vl.timestamp DESC
      LIMIT 100
    `);

    const formatted = logs.map(l => {
      const ts = new Date(l.timestamp);
      const timeStr = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = ts.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

      return {
        id: l.id,
        passNumber: l.pass_number,
        pass_number: l.pass_number,
        plateNumber: l.plate_number,
        plate_number: l.plate_number,
        owner: l.owner_name,
        owner_name: l.owner_name,
        classification: l.classification || 'STUDENT',
        type: l.verification_type,
        verification_type: l.verification_type,
        gate: l.gate_station || 'Gate 1',
        gate_station: l.gate_station || 'Gate 1',
        time: `${timeStr} Today`,
        date: dateStr,
        timestamp: l.timestamp,
        status: l.verification_status,
        verification_status: l.verification_status,
        method: l.verification_method,
        guard_name: l.guard_name
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};

