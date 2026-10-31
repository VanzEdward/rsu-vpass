import pool from '../config/db.js';

async function migrate() {
  console.log('Connected to Aiven DB. Upgrading schema...');

  // 1. Modify applications table
  await pool.query(`
    ALTER TABLE applications 
    MODIFY COLUMN status ENUM('PENDING','APPROVED','RECEIPT_SUBMITTED','PASS_ISSUED','REJECTED') DEFAULT 'PENDING',
    MODIFY COLUMN driver_license_url LONGTEXT NULL,
    MODIFY COLUMN or_cr_url LONGTEXT NULL
  `);
  console.log('applications table modified.');

  // Add missing columns if they do not exist
  const [appCols] = await pool.query('DESCRIBE applications');
  const existingCols = appCols.map(c => c.Field);

  if (!existingCols.includes('app_ref_number')) {
    await pool.query('ALTER TABLE applications ADD COLUMN app_ref_number VARCHAR(50) NULL AFTER id');
  }
  if (!existingCols.includes('applicant_photo')) {
    await pool.query('ALTER TABLE applications ADD COLUMN applicant_photo LONGTEXT NULL');
  }
  if (!existingCols.includes('or_url')) {
    await pool.query('ALTER TABLE applications ADD COLUMN or_url LONGTEXT NULL AFTER driver_license_url');
  }
  if (!existingCols.includes('cr_url')) {
    await pool.query('ALTER TABLE applications ADD COLUMN cr_url LONGTEXT NULL AFTER or_url');
  }
  if (!existingCols.includes('receipt_or_number')) {
    await pool.query('ALTER TABLE applications ADD COLUMN receipt_or_number VARCHAR(100) NULL');
  }
  if (!existingCols.includes('receipt_photo_url')) {
    await pool.query('ALTER TABLE applications ADD COLUMN receipt_photo_url LONGTEXT NULL');
  }
  if (!existingCols.includes('receipt_rejection_remark')) {
    await pool.query('ALTER TABLE applications ADD COLUMN receipt_rejection_remark TEXT NULL');
  }
  console.log('applications extra columns checked/added.');

  // 2. Modify vehicles table
  await pool.query('ALTER TABLE vehicles MODIFY COLUMN vehicle_photo_url LONGTEXT NULL');
  console.log('vehicles table modified.');

  // 3. Modify verification_logs table
  const [logCols] = await pool.query('DESCRIBE verification_logs');
  const existingLogCols = logCols.map(c => c.Field);
  if (!existingLogCols.includes('gate_station')) {
    await pool.query("ALTER TABLE verification_logs ADD COLUMN gate_station VARCHAR(50) DEFAULT 'Gate 1'");
  }
  if (!existingLogCols.includes('classification')) {
    await pool.query("ALTER TABLE verification_logs ADD COLUMN classification VARCHAR(50) DEFAULT 'STUDENT'");
  }
  console.log('verification_logs modified.');

  // 4. Modify temporary_passes table
  const [tempCols] = await pool.query('DESCRIBE temporary_passes');
  const existingTempCols = tempCols.map(c => c.Field);
  if (!existingTempCols.includes('destination')) {
    await pool.query('ALTER TABLE temporary_passes ADD COLUMN destination VARCHAR(100) NULL');
  }
  if (!existingTempCols.includes('purpose')) {
    await pool.query('ALTER TABLE temporary_passes ADD COLUMN purpose VARCHAR(255) NULL');
  }
  if (!existingTempCols.includes('contact')) {
    await pool.query('ALTER TABLE temporary_passes ADD COLUMN contact VARCHAR(50) NULL');
  }
  if (!existingTempCols.includes('id_presented')) {
    await pool.query('ALTER TABLE temporary_passes ADD COLUMN id_presented VARCHAR(100) NULL');
  }
  if (!existingTempCols.includes('entry_gate')) {
    await pool.query('ALTER TABLE temporary_passes ADD COLUMN entry_gate VARCHAR(50) NULL');
  }
  if (!existingTempCols.includes('exit_gate')) {
    await pool.query('ALTER TABLE temporary_passes ADD COLUMN exit_gate VARCHAR(50) NULL');
  }
  console.log('temporary_passes modified.');

  // 5. Make sure vehicle_passes qr_code_data and pass_number are ready
  await pool.query('ALTER TABLE vehicle_passes MODIFY COLUMN qr_code_data LONGTEXT NOT NULL');
  console.log('vehicle_passes modified.');

  console.log('Schema migration complete!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
