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

// Register a new vehicle & create pending application (Milestone 1)
export const registerVehicle = async (req, res) => {
  try {
    const { 
      plateNumber, plate_number,
      vehicleType, vehicle_type = 'Motorcycle',
      make, model, color, year = '2026', year_model = 2026,
      applicant_photo,
      driverLicense, driver_license_url,
      orCr, or_cr_url,
      vehicle_photo_url
    } = req.body;
    
    const finalPlate = (plateNumber || plate_number || '').trim().toUpperCase();
    const finalType = vehicleType || vehicle_type || 'Motorcycle';
    const finalMake = (make || '').trim();
    const finalModel = (model || '').trim();
    const finalColor = (color || '').trim();
    const finalYear = parseInt(year || year_model || 2026, 10);
    const finalLicense = driverLicense || driver_license_url || '';
    const finalOrCr = orCr || or_cr_url || '';
    const finalPhoto = applicant_photo || null;

    if (!finalPlate || !finalMake || !finalModel || !finalColor) {
      return res.status(400).json({ message: 'Plate Number, Make, Model, and Color are required.' });
    }

    // Check if plate already registered
    const [existingPlate] = await pool.query('SELECT id, user_id FROM vehicles WHERE UPPER(plate_number) = ?', [finalPlate]);
    let vehicleId;
    if (existingPlate.length > 0) {
      if (existingPlate[0].user_id !== req.user.id) {
        return res.status(409).json({ message: `Plate number "${finalPlate}" is already registered by another user.` });
      }
      vehicleId = existingPlate[0].id;
      await pool.query(
        'UPDATE vehicles SET vehicle_type = ?, make = ?, model = ?, color = ?, year_model = ? WHERE id = ?',
        [finalType, finalMake, finalModel, finalColor, finalYear, vehicleId]
      );
    } else {
      const [vehResult] = await pool.query(
        'INSERT INTO vehicles (user_id, plate_number, vehicle_type, make, model, color, year_model, vehicle_photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, finalPlate, finalType, finalMake, finalModel, finalColor, finalYear, vehicle_photo_url || null]
      );
      vehicleId = vehResult.insertId;
    }

    // Insert Application
    const [appCountRows] = await pool.query('SELECT COUNT(*) as cnt FROM applications');
    const appRef = `APP-2026-${String((appCountRows[0].cnt || 0) + 1).padStart(4, '0')}`;

    const [appResult] = await pool.query(
      `INSERT INTO applications (
        app_ref_number, user_id, vehicle_id, status, applicant_photo, driver_license_url, or_cr_url
      ) VALUES (?, ?, ?, 'PENDING', ?, ?, ?)`,
      [appRef, req.user.id, vehicleId, finalPhoto, finalLicense, finalOrCr]
    );

    const applicationId = appResult.insertId;

    res.status(201).json({
      message: 'Vehicle registration submitted to PASO successfully!',
      applicationId,
      appRef,
      vehicleId
    });
  } catch (error) {
    console.error('Error in registerVehicle:', error);
    res.status(500).json({ message: 'Failed to register vehicle', error: error.message });
  }
};

// Client applications & statuses
export const getMyApplications = async (req, res) => {
  try {
    const [apps] = await pool.query(`
      SELECT 
        a.id, a.app_ref_number, a.status, a.rejection_reason, 
        a.applicant_photo, a.driver_license_url, a.or_cr_url,
        a.receipt_or_number, a.receipt_photo_url, a.receipt_rejection_remark,
        a.created_at, a.updated_at,
        u.full_name as applicant_name, u.school_id, u.classification, u.contact_number,
        u.year_course, u.department_unit,
        v.id as vehicle_id, v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model,
        vp.id as pass_id, vp.pass_number, vp.valid_until, vp.qr_code_data, vp.status as pass_status,
        vp.issued_at as pass_issued_at
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN vehicles v ON a.vehicle_id = v.id
      LEFT JOIN vehicle_passes vp ON vp.vehicle_id = v.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `, [req.user.id]);

    // Format consistently for front-end consumption
    const formatted = apps.map((app) => ({
      id: app.app_ref_number || `APP-2026-${String(app.id).padStart(4, '0')}`,
      db_id: app.id,
      user_id: req.user.id,
      applicant_name: app.applicant_name,
      school_id: app.school_id,
      classification: app.classification || 'Student',
      department: app.year_course || app.department_unit || '',
      contact_number: app.contact_number || '',
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
      documents: {
        driverLicense: app.driver_license_url,
        orCr: app.or_cr_url,
      },
      status: app.status,
      rejection_reason: app.rejection_reason,
      receiptRejectionRemark: app.receipt_rejection_remark,
      created_at: app.created_at,
      updated_at: app.updated_at,
      receipt: app.receipt_or_number ? {
        orNumber: app.receipt_or_number,
        receiptPhoto: app.receipt_photo_url,
        submittedAt: app.updated_at,
      } : null,
      pass: app.pass_number ? {
        id: app.pass_id,
        passNumber: app.pass_number,
        validUntil: app.valid_until,
        qrData: app.qr_code_data,
        status: app.pass_status || 'ACTIVE',
        issuedAt: app.pass_issued_at || app.updated_at,
      } : null,
      submittedDate: new Date(app.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error in getMyApplications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Client submits Official Cashier Receipt proof (Milestone 3)
export const submitReceipt = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { orNumber, or_number, receiptPhoto, receipt_photo_url } = req.body;

    const finalOr = (orNumber || or_number || '').trim();
    const finalPhoto = receiptPhoto || receipt_photo_url || null;

    if (!finalOr) {
      return res.status(400).json({ message: 'Official Receipt (OR) Number is required' });
    }

    // Resolve app id (can be numeric id or APP-2026-XXXX)
    let appCondition = 'id = ?';
    let appParam = applicationId;
    if (isNaN(Number(applicationId))) {
      appCondition = 'app_ref_number = ?';
    }

    const [result] = await pool.query(
      `UPDATE applications 
       SET status = 'RECEIPT_SUBMITTED', 
           receipt_or_number = ?, 
           receipt_photo_url = ?, 
           receipt_rejection_remark = NULL 
       WHERE ${appCondition} AND user_id = ?`,
      [finalOr, finalPhoto, appParam, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    res.json({ message: 'Receipt submitted successfully for PASO verification' });
  } catch (error) {
    console.error('Error in submitReceipt:', error);
    res.status(500).json({ message: 'Failed to submit cashier receipt', error: error.message });
  }
};

// Resubmit rejected application
export const resubmitApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { 
      plateNumber, plate_number,
      vehicleType, vehicle_type,
      make, model, color, year, year_model,
      driverLicense, driver_license_url,
      orCr, or_cr_url,
      applicant_photo 
    } = req.body;

    let appCondition = 'a.id = ?';
    let appParam = applicationId;
    if (isNaN(Number(applicationId))) {
      appCondition = 'a.app_ref_number = ?';
    }

    const [apps] = await pool.query(
      `SELECT a.id, a.vehicle_id FROM applications a WHERE ${appCondition} AND a.user_id = ?`,
      [appParam, req.user.id]
    );

    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    const app = apps[0];
    const finalPlate = (plateNumber || plate_number || '').trim().toUpperCase();

    // Update vehicle
    if (finalPlate || make || model || color) {
      await pool.query(
        `UPDATE vehicles 
         SET plate_number = COALESCE(NULLIF(?, ''), plate_number),
             vehicle_type = COALESCE(NULLIF(?, ''), vehicle_type),
             make = COALESCE(NULLIF(?, ''), make),
             model = COALESCE(NULLIF(?, ''), model),
             color = COALESCE(NULLIF(?, ''), color),
             year_model = COALESCE(?, year_model)
         WHERE id = ?`,
        [finalPlate, vehicleType || vehicle_type, make, model, color, year || year_model, app.vehicle_id]
      );
    }

    // Update application back to PENDING
    await pool.query(
      `UPDATE applications 
       SET status = 'PENDING',
           rejection_reason = NULL,
           driver_license_url = COALESCE(?, driver_license_url),
           or_cr_url = COALESCE(?, or_cr_url),
           applicant_photo = COALESCE(?, applicant_photo)
       WHERE id = ?`,
      [driverLicense || driver_license_url, orCr || or_cr_url, applicant_photo, app.id]
    );

    res.json({ message: 'Application corrected and resubmitted to PASO queue!' });
  } catch (error) {
    console.error('Error in resubmitApplication:', error);
    res.status(500).json({ message: 'Failed to resubmit application', error: error.message });
  }
};
