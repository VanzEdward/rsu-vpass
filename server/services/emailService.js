import { BrevoClient } from '@getbrevo/brevo';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

/**
 * Brevo (Sendinblue) Email Notification Service for RSU VPASS
 * Physical Assets and Security Office (PASO) - Romblon State University
 */

const getBrevoClient = () => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_brevo_api_key')) {
    return null;
  }
  return new BrevoClient({ apiKey: apiKey.trim() });
};

const getSender = () => {
  return {
    name: process.env.EMAIL_FROM_NAME || 'RSU VPASS (PASO)',
    email: process.env.EMAIL_FROM || 'paso@rsu.edu.ph',
  };
};

/**
 * Common HTML email wrapper with Romblon State University emerald branding
 */
const renderEmailHtml = ({ title, preheader, badgeText, badgeColor = '#059669', contentHtml, actionButton }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%); padding: 28px 24px; text-align: left; color: #ffffff; }
    .header-logo { font-size: 22px; font-weight: 900; letter-spacing: 1px; color: #ffffff; margin: 0; }
    .header-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #a7f3d0; margin-top: 4px; font-weight: 600; }
    .body { padding: 28px 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; background-color: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}40; }
    .content-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0; font-size: 13px; line-height: 1.6; }
    .table-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .table-label { color: #64748b; font-weight: 500; }
    .table-value { color: #0f172a; font-weight: 700; text-align: right; }
    .remark-box { background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 14px; border-radius: 8px; margin: 18px 0; font-size: 13px; color: #881337; }
    .success-box { background-color: #ecfdf5; border-left: 4px solid #059669; padding: 14px; border-radius: 8px; margin: 18px 0; font-size: 13px; color: #064e3b; }
    .btn { display: inline-block; background-color: #047857; color: #ffffff !important; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 13px; text-decoration: none; margin: 20px 0 10px 0; }
    .footer { background-color: #f8fafc; padding: 20px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5; }
    .footer-bold { font-weight: 700; color: #334155; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">RSU VPASS</div>
      <div class="header-sub">Romblon State University • Physical Assets and Security Office</div>
    </div>
    <div class="body">
      ${badgeText ? `<div class="badge">${badgeText}</div>` : ''}
      <h2 style="font-size: 19px; font-weight: 800; margin-top: 0; color: #0f172a;">${title}</h2>
      ${contentHtml}
      ${actionButton ? `<div style="text-align: center;"><a href="${actionButton.url}" class="btn">${actionButton.text}</a></div>` : ''}
    </div>
    <div class="footer">
      <div class="footer-bold">Physical Assets and Security Office (PASO)</div>
      <div>Romblon State University — Main Campus, Odiongan, Romblon 5505</div>
      <div style="margin-top: 6px; font-size: 10px; color: #94a3b8;">This is an automated notification from RSU VPASS. Please do not reply directly to this email.</div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Base sender using Brevo Transactional Email Client
 */
export const sendEmail = async ({ toEmail, recipientName, subject, htmlContent }) => {
  const client = getBrevoClient();

  if (!toEmail) {
    console.warn('[Brevo Email Service] Skipped email: missing recipient email address.');
    return { success: false, reason: 'Missing toEmail' };
  }

  // If no Brevo API key is configured, log mock in development without breaking app
  if (!client) {
    console.log(`\n======================================================`);
    console.log(`[Brevo Email Service - DEMO / SIMULATION MODE]`);
    console.log(`To: ${recipientName || 'Applicant'} <${toEmail}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Status: Brevo API key not set. Set BREVO_API_KEY in server/.env to send real emails.`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }

  try {
    const sender = getSender();
    const sendPayload = {
      subject,
      sender,
      to: [{ email: toEmail.trim(), name: recipientName || 'RSU Member' }],
      htmlContent,
    };

    const response = await client.transactionalEmails.sendTransacEmail(sendPayload);
    console.log(`[Brevo Email Service] Email successfully dispatched to ${toEmail} (Subject: "${subject}")`);
    return { success: true, response };
  } catch (error) {
    console.error(`[Brevo Email Service Error] Failed to send email to ${toEmail}:`, error?.message || error);
    // Don't re-throw to prevent breaking business logic
    return { success: false, error: error?.message || error };
  }
};

/* ========================================================================== */
/* RECOMMENDED EMAIL TRIGGERS FOR RSU VPASS                                  */
/* ========================================================================== */

/**
 * Trigger 1: Vehicle Registration Application APPROVED (Milestone 2 Approval)
 */
export const sendRegistrationApprovedEmail = async ({
  toEmail,
  recipientName,
  vehicle,
  plateNumber,
  fee = '150.00',
}) => {
  const title = 'Vehicle Registration Approved — Proceed to Cashier';
  const subject = `[RSU VPASS] Vehicle Registration Approved (${plateNumber})`;

  const contentHtml = `
    <p>Good day, <strong>${recipientName || 'Applicant'}</strong>,</p>
    <p>We are pleased to inform you that your vehicle registration documents have been verified and approved by the <strong>Physical Assets and Security Office (PASO)</strong>.</p>
    
    <div class="content-box">
      <div class="table-row">
        <span class="table-label">Registered Vehicle:</span>
        <span class="table-value">${vehicle || 'Motor Vehicle'}</span>
      </div>
      <div class="table-row">
        <span class="table-label">Plate / Temp Number:</span>
        <span class="table-value">${plateNumber || 'N/A'}</span>
      </div>
      <div class="table-row">
        <span class="table-label">Registration Status:</span>
        <span class="table-value" style="color: #059669;">Approved (Milestone 2 Completed)</span>
      </div>
      <div class="table-row" style="border-bottom: none;">
        <span class="table-label">Sticker Clearance Fee:</span>
        <span class="table-value">₱${fee}</span>
      </div>
    </div>

    <div class="success-box">
      <strong>Next Step (Milestone 3):</strong><br>
      1. Visit the <strong>RSU University Cashier Window</strong> at the Administration Building.<br>
      2. Pay the vehicle sticker fee and request an <strong>Official Receipt (OR)</strong>.<br>
      3. Log into your RSU VPASS account and upload a clear photo of your Cashier receipt under the <strong>Payments</strong> menu.
    </div>
  `;

  const htmlContent = renderEmailHtml({
    title,
    badgeText: 'Milestone 2 • Approved',
    badgeColor: '#059669',
    contentHtml,
  });

  return sendEmail({ toEmail, recipientName, subject, htmlContent });
};

/**
 * Trigger 2: Vehicle Registration Application REJECTED / DECLINED by PASO (Milestone 2 Rejection)
 */
export const sendRegistrationRejectedEmail = async ({
  toEmail,
  recipientName,
  vehicle,
  plateNumber,
  reason,
}) => {
  const title = 'Registration Form Returned for Correction';
  const subject = `[RSU VPASS] Action Required: Vehicle Registration Returned (${plateNumber})`;

  const contentHtml = `
    <p>Dear <strong>${recipientName || 'Applicant'}</strong>,</p>
    <p>The Physical Assets and Security Office (PASO) reviewed your vehicle registration application and found issues that require your correction before it can be approved.</p>
    
    <div class="content-box">
      <div class="table-row">
        <span class="table-label">Vehicle Details:</span>
        <span class="table-value">${vehicle || 'Motor Vehicle'}</span>
      </div>
      <div class="table-row" style="border-bottom: none;">
        <span class="table-label">Plate Number:</span>
        <span class="table-value">${plateNumber || 'N/A'}</span>
      </div>
    </div>

    <div class="remark-box">
      <strong>PASO Evaluation Remark:</strong><br>
      "${reason || 'Incomplete or unreadable documents uploaded. Please re-check vehicle plate and license.'}"
    </div>

    <p style="font-size: 13px; line-height: 1.6;">
      <strong>How to fix this:</strong> You do not need to restart from scratch. Simply log in to your RSU VPASS portal, go to the <strong>Applications</strong> menu, and click <strong>"Edit & Resubmit Application"</strong> to update the required information.
    </p>
  `;

  const htmlContent = renderEmailHtml({
    title,
    badgeText: 'Action Required • Form Returned',
    badgeColor: '#e11d48',
    contentHtml,
  });

  return sendEmail({ toEmail, recipientName, subject, htmlContent });
};

/**
 * Trigger 3: Cashier Payment Receipt DECLINED / REJECTED by PASO (Milestone 3 Rejection)
 */
export const sendReceiptRejectedEmail = async ({
  toEmail,
  recipientName,
  vehicle,
  plateNumber,
  orNumber,
  reason,
}) => {
  const title = 'Cashier Receipt Proof Declined by PASO';
  const subject = `[RSU VPASS] Action Required: Cashier Receipt Declined (OR #${orNumber || 'N/A'})`;

  const contentHtml = `
    <p>Dear <strong>${recipientName || 'Applicant'}</strong>,</p>
    <p>Your uploaded Cashier payment receipt proof for vehicle <strong>${vehicle || 'Vehicle'} (${plateNumber || 'N/A'})</strong> was evaluated by the PASO Administration Office and could not be verified.</p>
    
    <div class="content-box">
      <div class="table-row">
        <span class="table-label">Official Receipt (OR) Number:</span>
        <span class="table-value">#${orNumber || 'N/A'}</span>
      </div>
      <div class="table-row" style="border-bottom: none;">
        <span class="table-label">Vehicle Plate:</span>
        <span class="table-value">${plateNumber || 'N/A'}</span>
      </div>
    </div>

    <div class="remark-box">
      <strong>Reason for Receipt Rejection:</strong><br>
      "${reason || 'Receipt image is blurry, unreadable, or payment amount does not match university vehicle sticker fees.'}"
    </div>

    <div class="success-box" style="background-color: #f8fafc; border-left-color: #3b82f6; color: #1e3a8a;">
      <strong>How to resolve:</strong><br>
      1. Open the <strong>Payments</strong> menu in your RSU VPASS account.<br>
      2. Take a fresh, well-lit photograph of your Cashier receipt showing the OR number, date, and amount clearly.<br>
      3. Click <strong>"Re-upload Cashier Receipt Proof"</strong> to submit the corrected photo.
    </div>
  `;

  const htmlContent = renderEmailHtml({
    title,
    badgeText: 'Payment Proof Declined',
    badgeColor: '#e11d48',
    contentHtml,
  });

  return sendEmail({ toEmail, recipientName, subject, htmlContent });
};

/**
 * Trigger 4: Cashier Receipt VERIFIED & Official Gate Pass ISSUED (Milestone 4 Pass Release)
 */
export const sendPassIssuedEmail = async ({
  toEmail,
  recipientName,
  vehicle,
  plateNumber,
  passNumber,
  validUntil,
  academicYear = '2026-2027',
}) => {
  const title = `Official Gate Pass Issued: ${passNumber}`;
  const subject = `[RSU VPASS] Official Gate Pass ${passNumber} Active (${plateNumber})`;

  const contentHtml = `
    <p>Congratulations, <strong>${recipientName || 'Applicant'}</strong>!</p>
    <p>Your Cashier payment has been verified by the Physical Assets and Security Office (PASO). Your official university vehicle clearance pass is now <strong>ACTIVE</strong> for campus gate entry.</p>
    
    <div class="content-box">
      <div class="table-row">
        <span class="table-label">Official Pass Series:</span>
        <span class="table-value" style="color: #047857; font-size: 15px;">${passNumber}</span>
      </div>
      <div class="table-row">
        <span class="table-label">Vehicle:</span>
        <span class="table-value">${vehicle || 'Motor Vehicle'}</span>
      </div>
      <div class="table-row">
        <span class="table-label">Plate Number:</span>
        <span class="table-value">${plateNumber}</span>
      </div>
      <div class="table-row">
        <span class="table-label">Academic Year:</span>
        <span class="table-value">A.Y. ${academicYear}</span>
      </div>
      <div class="table-row" style="border-bottom: none;">
        <span class="table-label">Valid Until:</span>
        <span class="table-value" style="color: #0f172a;">${validUntil || '1 Year from Issuance'}</span>
      </div>
    </div>

    <div class="success-box">
      <strong>Your Pass Credentials:</strong><br>
      • <strong>Official Wearable ID Pass (PNG)</strong>: Download from the <em>My Pass</em> menu to wear on your lanyard or keep on your phone.<br>
      • <strong>Official Vehicle Pass Sticker (PNG)</strong>: Download the high-resolution sticker to print and adhere to your vehicle's windshield or front fork.<br>
      • <strong>Gate Scanner Clearance</strong>: Present either the sticker or digital pass to on-duty security officers at any university gate.
    </div>
  `;

  const htmlContent = renderEmailHtml({
    title,
    badgeText: 'Milestone 4 • Pass Active',
    badgeColor: '#059669',
    contentHtml,
  });

  return sendEmail({ toEmail, recipientName, subject, htmlContent });
};

/**
 * Trigger 5: Gate Security Guard Account Provisioned
 */
export const sendGuardAccountCreatedEmail = async ({
  toEmail,
  guardName,
  schoolId,
  rawPassword,
  gatePost = 'Gate 1 (Main Campus)',
  shift = 'Day Shift',
}) => {
  const title = 'Security Guard Portal Access Credentials';
  const subject = `[RSU VPASS] Gate Security Guard Access Provisioned (${schoolId})`;

  const contentHtml = `
    <p>Officer <strong>${guardName}</strong>,</p>
    <p>Your security personnel account has been created by the PASO Administration Office. You are authorized to operate the mobile viewfinder gate scanner and log campus vehicle traffic.</p>
    
    <div class="content-box">
      <div class="table-row">
        <span class="table-label">Security Badge / Login ID:</span>
        <span class="table-value" style="color: #047857; font-size: 14px;">${schoolId}</span>
      </div>
      <div class="table-row">
        <span class="table-label">Temporary Password:</span>
        <span class="table-value" style="font-family: monospace;">${rawPassword}</span>
      </div>
      <div class="table-row">
        <span class="table-label">Assigned Duty Post:</span>
        <span class="table-value">${gatePost}</span>
      </div>
      <div class="table-row" style="border-bottom: none;">
        <span class="table-label">Duty Shift:</span>
        <span class="table-value">${shift}</span>
      </div>
    </div>

    <p style="font-size: 13px; line-height: 1.6;">
      <strong>Instructions:</strong> Open the RSU VPASS Login portal, click <em>Security Guard</em>, enter your badge ID and password, select your duty gate post, and begin scanning approaching vehicle passes.
    </p>
  `;

  const htmlContent = renderEmailHtml({
    title,
    badgeText: 'Guard Provisioned',
    badgeColor: '#3b82f6',
    contentHtml,
  });

  return sendEmail({ toEmail, recipientName: guardName, subject, htmlContent });
};
