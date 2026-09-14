import pool from '../config/db.js';

// Get active pass for the client
export const getMyPasses = async (req, res) => {
  try {
    const [passes] = await pool.query(`
      SELECT 
        vp.id as pass_id, vp.pass_number, vp.qr_code_data, vp.valid_until, vp.status, vp.issued_at,
        v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model, v.vehicle_photo_url,
        u.full_name, u.school_id, u.photo_url as client_photo
      FROM vehicle_passes vp
      JOIN vehicles v ON vp.vehicle_id = v.id
      JOIN users u ON vp.user_id = u.id
      WHERE vp.user_id = ?
      ORDER BY vp.issued_at DESC
    `, [req.user.id]);
    res.json(passes);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving pass details', error: error.message });
  }
};

// Create temporary pass (for visitors)
export const createTemporaryPass = async (req, res) => {
  try {
    const { visitor_name, host_name, plate_number, vehicle_description, valid_from, valid_to } = req.body;
    if (!visitor_name || !host_name || !plate_number || !valid_from || !valid_to) {
      return res.status(400).json({ message: 'Visitor details are incomplete' });
    }

    const passNumber = `TEMP-${Date.now().toString().slice(-6)}`;
    const qrData = `RSU-TEMP:${passNumber}:${plate_number}`;

    const [result] = await pool.query(`
      INSERT INTO temporary_passes 
      (pass_number, visitor_name, host_name, plate_number, vehicle_description, valid_from, valid_to, qr_code_data, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [passNumber, visitor_name, host_name, plate_number, vehicle_description || '', valid_from, valid_to, qrData, req.user.id]);

    res.status(201).json({ message: 'Temporary pass created successfully', passNumber, id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create temporary pass', error: error.message });
  }
};
