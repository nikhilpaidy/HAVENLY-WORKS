import nodemailer from 'nodemailer';
import { logger } from './logger.js';

interface ClientWelcomeEmailParams {
  to: string;
  companyName: string;
  clientName: string;
  email: string;
  temporaryPassword: string;
  loginUrl?: string;
}

interface MonthEndInvoiceEmailParams {
  to: string;
  companyName: string;
  periodText: string;
  grantedHours: number;
  consumedHours: number;
  overdraftHours: number;
  additionalHourlyRate: number;
  totalAmountDue: number;
  currency: string;
  upiId?: string;
  paymentQrCodeUrl?: string;
}

interface BookingConfirmationEmailParams {
  to: string;
  recipientName: string;
  bookingNumber: string;
  spaceName: string;
  workspaceType: string;
  startTime: Date | string;
  endTime: Date | string;
  totalAmount: number;
  currency: string;
  isGuest?: boolean;
}

interface GuestBookingAlertParams {
  adminEmail: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  spaceName: string;
  workspaceType: string;
  bookingNumber: string;
  totalAmount: number;
  currency: string;
  bookingDate: string;
}

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || '"Hubbly Coworking" <support@cwsone.com>';

export async function sendClientWelcomeEmail(params: ClientWelcomeEmailParams): Promise<boolean> {
  const transporter = createTransporter();
  const loginUrl = params.loginUrl || 'https://cwsone.in/login';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F9FC; margin: 0; padding: 24px; color: #1E293B; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
        .header { background: #00A859; padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; font-size: 15px; opacity: 0.95; }
        .body { padding: 32px 28px; line-height: 1.6; }
        .credentials-box { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .cred-item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; }
        .cred-label { font-weight: 600; color: #166534; }
        .cred-val { font-family: monospace; font-size: 16px; font-weight: 700; color: #00A859; }
        .button { display: inline-block; background: #00A859; color: #ffffff !important; padding: 14px 32px; border-radius: 30px; font-weight: 600; text-decoration: none; margin-top: 16px; text-align: center; }
        .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 13px; color: #64748B; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Welcome to Hubbly Coworking</h1>
          <p>Your workspace membership is now active!</p>
        </div>
        <div class="body">
          <p>Hello <strong>${params.clientName}</strong>,</p>
          <p>Your company <strong>${params.companyName}</strong> has been successfully registered on our coworking portal. You can now log in, manage your team members, reserve desks and meeting rooms, and track your quota.</p>
          
          <div class="credentials-box">
            <div class="cred-item">
              <span class="cred-label">Login Email:</span>
              <span class="cred-val">${params.email}</span>
            </div>
            <div class="cred-item" style="margin-bottom:0;">
              <span class="cred-label">Password:</span>
              <span class="cred-val">${params.temporaryPassword}</span>
            </div>
          </div>

          <p style="text-align: center;">
            <a href="${loginUrl}" class="button">Log In to Your Portal</a>
          </p>
          <p style="font-size: 13px; color: #64748B; margin-top: 24px;">For your security, we recommend changing your password after your first login.</p>
        </div>
        <div class="footer">
          CWS ONE Coworking • Prestige Meridian, MG Road, Bangalore • support@cwsone.com
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logger.info(`[SMTP: Mock Log] Welcome email sent to: ${params.to} | TempPass: ${params.temporaryPassword}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Welcome to Hubbly Coworking - Login Credentials for ${params.companyName}`,
      html
    });
    return true;
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function sendMonthEndInvoiceEmail(params: MonthEndInvoiceEmailParams): Promise<boolean> {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F9FC; margin: 0; padding: 24px; color: #1E293B; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
        .header { background: #0A3826; padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; color: #00C261; }
        .body { padding: 32px 28px; line-height: 1.6; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th, .invoice-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #E2E8F0; }
        .invoice-table th { background: #F8FAFC; color: #475569; font-size: 13px; text-transform: uppercase; }
        .total-box { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
        .total-val { font-size: 28px; font-weight: 800; color: #00A859; }
        .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 13px; color: #64748B; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Monthly Workspace Usage Statement</h1>
          <p style="margin: 4px 0 0; color: #E2E8F0;">Period: ${params.periodText}</p>
        </div>
        <div class="body">
          <p>Dear <strong>${params.companyName}</strong>,</p>
          <p>Here is your monthly workspace quota summary. Since your initial granted allowance was completed, the additional bookings made by your team during this period are detailed below:</p>

          <table class="invoice-table">
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Details</th>
            </tr>
            <tr>
              <td>Granted Allowance Hours</td>
              <td style="text-align: right; font-weight: 600;">${params.grantedHours} hrs</td>
            </tr>
            <tr>
              <td>Total Consumed Hours</td>
              <td style="text-align: right; font-weight: 600;">${params.consumedHours} hrs</td>
            </tr>
            <tr>
              <td>Billable Overdraft Hours</td>
              <td style="text-align: right; font-weight: 700; color: #DC2626;">${params.overdraftHours} hrs</td>
            </tr>
            <tr>
              <td>Overdraft Rate</td>
              <td style="text-align: right; font-weight: 600;">₹${params.additionalHourlyRate}/hr</td>
            </tr>
          </table>

          <div class="total-box">
            <div style="font-size: 13px; color: #166534; font-weight: 600; text-transform: uppercase;">Total Amount Payable</div>
            <div class="total-val">₹${params.totalAmountDue.toLocaleString('en-IN')}</div>
            <div style="font-size: 13px; color: #475569; margin-top: 6px;">UPI ID: <strong>${params.upiId || 'cwsone@icici'}</strong></div>
          </div>

          <p style="font-size: 14px; color: #475569;">Please complete payment via UPI QR code or bank transfer. If you have any questions, feel free to contact your coworking space manager.</p>
        </div>
        <div class="footer">
          CWS ONE Coworking • support@cwsone.com • +91 98450 12345
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logger.info(`[SMTP: Mock Log] Invoice email sent to: ${params.to} | Amount: ₹${params.totalAmountDue}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Monthly Statement: Overdraft Invoice for ${params.companyName} - ₹${params.totalAmountDue}`,
      html
    });
    return true;
  } catch (error) {
    logger.error('Failed to send invoice email:', error);
    return false;
  }
}

export async function sendBookingConfirmationEmail(params: BookingConfirmationEmailParams): Promise<boolean> {
  const transporter = createTransporter();

  const startStr = typeof params.startTime === 'string' ? params.startTime : new Date(params.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const endStr = typeof params.endTime === 'string' ? params.endTime : new Date(params.endTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F9FC; margin: 0; padding: 24px; color: #1E293B; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
        .header { background: #00A859; padding: 28px 24px; text-align: center; color: #ffffff; }
        .body { padding: 32px 28px; line-height: 1.6; }
        .badge { display: inline-block; background: #DCFCE7; color: #15803D; font-weight: 700; padding: 4px 12px; border-radius: 20px; font-size: 13px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 15px; }
        .footer { background: #F8FAFC; padding: 20px; text-align: center; font-size: 13px; color: #64748B; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin:0; font-size:24px;">Booking Confirmation</h1>
          <p style="margin:4px 0 0; opacity: 0.95;">Reservation Ref: #${params.bookingNumber}</p>
        </div>
        <div class="body">
          <p>Hello <strong>${params.recipientName}</strong>,</p>
          <p>Your workspace reservation has been confirmed. Below are your booking details:</p>
          
          <div style="margin: 20px 0;">
            <div class="detail-row">
              <span style="color:#64748B;">Workspace</span>
              <strong>${params.spaceName} (<span class="badge">${params.workspaceType}</span>)</strong>
            </div>
            <div class="detail-row">
              <span style="color:#64748B;">Start Time</span>
              <strong>${startStr}</strong>
            </div>
            <div class="detail-row">
              <span style="color:#64748B;">End Time</span>
              <strong>${endStr}</strong>
            </div>
            <div class="detail-row">
              <span style="color:#64748B;">Total Amount</span>
              <strong style="color:#00A859; font-size: 17px;">₹${params.totalAmount.toLocaleString('en-IN')}</strong>
            </div>
          </div>
          <p>Please present this confirmation or your mobile E-Receipt upon arrival at the front reception.</p>
        </div>
        <div class="footer">
          CWS ONE Coworking • support@cwsone.com • +91 98450 12345
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logger.info(`[SMTP: Mock Log] Booking confirmation sent to: ${params.to} | #${params.bookingNumber}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Booking Confirmed: ${params.spaceName} (#${params.bookingNumber})`,
      html
    });
    return true;
  } catch (error) {
    logger.error('Failed to send booking confirmation email:', error);
    return false;
  }
}

export async function sendGuestBookingAdminAlert(params: GuestBookingAlertParams): Promise<boolean> {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F9FC; margin: 0; padding: 24px; color: #1E293B; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
        .header { background: #0A3826; padding: 24px; text-align: center; color: #ffffff; }
        .body { padding: 28px; line-height: 1.6; }
        .alert-box { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 16px; margin: 20px 0; color: #92400E; font-weight: 600; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 15px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 style="margin:0; color:#00C261;">New Outer Guest Reservation Request</h2>
          <p style="margin:4px 0 0; color:#E2E8F0;">Action Required: Call Guest & Verify Payment</p>
        </div>
        <div class="body">
          <div class="alert-box">
            A visitor has requested a Day Pass / Desk and made a UPI QR payment. Please call them to confirm their reservation.
          </div>
          <div class="detail-row">
            <span style="color:#64748B;">Guest Name</span>
            <strong>${params.guestName}</strong>
          </div>
          <div class="detail-row">
            <span style="color:#64748B;">Phone Number</span>
            <strong><a href="tel:${params.guestPhone}" style="color:#00A859;">${params.guestPhone}</a></strong>
          </div>
          <div class="detail-row">
            <span style="color:#64748B;">Guest Email</span>
            <strong>${params.guestEmail}</strong>
          </div>
          <div class="detail-row">
            <span style="color:#64748B;">Workspace</span>
            <strong>${params.spaceName} (${params.workspaceType})</strong>
          </div>
          <div class="detail-row">
            <span style="color:#64748B;">Booking Ref</span>
            <strong>#${params.bookingNumber}</strong>
          </div>
          <div class="detail-row">
            <span style="color:#64748B;">Amount</span>
            <strong style="color:#00A859;">₹${params.totalAmount}</strong>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logger.info(`[SMTP: Mock Log] Guest booking alert to Admin: ${params.adminEmail} | Guest: ${params.guestName} (${params.guestPhone})`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: params.adminEmail,
      subject: `New Guest Booking Request: ${params.guestName} (${params.guestPhone}) - #${params.bookingNumber}`,
      html
    });
    return true;
  } catch (error) {
    logger.error('Failed to send admin guest booking alert:', error);
    return false;
  }
}
