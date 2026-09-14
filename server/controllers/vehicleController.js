import pool from '../config/db.js';

// Get all vehicles for current logged-in client
export const getMyVehicles = async (req, res) => {
  try {
    const [vehicles] = await pool.query(
      'SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving vehicles', error: error.message });
  }
};

// Register a new vehicle & create pending application
export const registerVehicle = async (req, res) => {
  try {
    const { plate_number, vehicle_type, make, model, color, year_model, driver_license_url, or_cr_url, vehicle_photo_url } = req.body;
    
    if (!plate_number || !vehicle_type || !make || !model || !color || !year_model) {
      return res.status(400).json({ message: 'Vehicle details are incomplete' });
    }

    // Insert vehicle
    const [vehResult] = await pool.query(
      'INSERT INTO vehicles (user_id, plate_number, vehicle_type, make, model, color, year_model, vehicle_photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, plate_number, vehicle_type, make, model, color, year_model, vehicle_photo_url || null]
    );

    const vehicleId = vehResult.insertId;

    // Create application
    const [appResult] = await pool.query(
      'INSERT INTO applications (user_id, vehicle_id, driver_license_url, or_cr_url, status) VALUES (?, ?, ?, ?, "PENDING")',
      [req.user.id, vehicleId, driver_license_url || '', or_cr_url || '']
    );

    res.status(201).json({
      message: 'Vehicle registration submitted for PASO review',
      vehicleId,
      applicationId: appResult.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to register vehicle', error: error.message });
  }
};

// Client applications & statuses
export const getMyApplications = async (req, res) => {
  try {
    const [apps] = await pool.query(`
      SELECT a.*, v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model
      FROM applications a
      JOIN vehicles v ON a.vehicle_id = v.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `, [req.user.id]);
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};
