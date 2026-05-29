import nodemailer from 'nodemailer';

/**
 * Create a Nodemailer transporter
 * @returns {import('nodemailer').Transporter}
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email body
 * @param {string} [options.text] - Plain text email body
 * @param {string} [options.from] - Sender email (defaults to EMAIL_USER)
 * @returns {Promise}
 */
const sendEmail = async ({ to, subject, html, text, from }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: from || `Dineway <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send contact form email
 * @param {Object} options - Contact form data
 * @param {string} options.name - Sender's name
 * @param {string} options.email - Sender's email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message
 * @returns {Promise}
 */
const sendContactEmail = async ({ name, email, subject, message }) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #C9A84C; color: #0D0D0D; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .field { margin-bottom: 15px; }
          .field-label { font-weight: bold; color: #555; }
          .field-value { margin-top: 5px; }
          .footer { text-align: center; padding: 15px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">Name:</div>
              <div class="field-value">${name}</div>
            </div>
            <div class="field">
              <div class="field-label">Email:</div>
              <div class="field-value">${email}</div>
            </div>
            <div class="field">
              <div class="field-label">Subject:</div>
              <div class="field-value">${subject}</div>
            </div>
            <div class="field">
              <div class="field-label">Message:</div>
              <div class="field-value">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from the Dineway contact form.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    New Contact Form Submission
    
    Name: ${name}
    Email: ${email}
    Subject: ${subject}
    
    Message:
    ${message}
  `;

  return sendEmail({
    to: process.env.EMAIL_USER,
    subject: `Contact Form: ${subject}`,
    html,
    text,
  });
};

/**
 * Send reservation confirmation email
 * @param {Object} options - Reservation details
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - User's name
 * @param {string} options.restaurantName - Restaurant name
 * @param {string} options.date - Reservation date
 * @param {string} options.timeSlot - Time slot
 * @param {number} options.guestCount - Number of guests
 * @param {string} options.status - Reservation status
 * @returns {Promise}
 */
const sendReservationConfirmation = async ({
  to,
  userName,
  restaurantName,
  date,
  timeSlot,
  guestCount,
  status,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #C9A84C; color: #0D0D0D; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .detail-label { font-weight: bold; }
          .status { display: inline-block; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
          .status-confirmed { background-color: #4CAF50; color: white; }
          .status-pending { background-color: #FF9800; color: white; }
          .status-cancelled { background-color: #f44336; color: white; }
          .footer { text-align: center; padding: 15px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reservation ${status === 'confirmed' ? 'Confirmed' : status === 'cancelled' ? 'Cancelled' : 'Pending'}</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Your reservation at <strong>${restaurantName}</strong> has been ${status}.<p>
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Restaurant:</span>
                <span>${restaurantName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span>${timeSlot}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Guests:</span>
                <span>${guestCount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status status-${status}">${status.toUpperCase()}</span>
              </div>
            </div>
            <p>Thank you for choosing Dineway. We look forward to serving you!</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Dineway.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Reservation ${status === 'confirmed' ? 'Confirmed' : status === 'cancelled' ? 'Cancelled' : 'Pending'} - ${restaurantName}`,
    html,
  });
};

/**
 * Send welcome email to new users
 * @param {Object} options - Welcome email options
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - User's name
 * @returns {Promise}
 */
const sendWelcomeEmail = async ({ to, userName }) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #C9A84C; color: #0D0D0D; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #C9A84C; color: #0D0D0D; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; padding: 15px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Dineway!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Thank you for joining Dineway! We're excited to help you discover exceptional dining experiences.</p>
            <p>With Dineway, you can:</p>
            <ul>
              <li>Browse hundreds of partner restaurants</li>
              <li>Make instant table reservations</li>
              <li>Explore menus and read reviews</li>
              <li>Manage your bookings easily</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}" class="button">Start Exploring</a>
            </p>
          </div>
          <div class="footer">
            <p>This email was sent to ${to} from Dineway.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Dineway!',
    html,
  });
};

export { sendEmail, sendContactEmail, sendReservationConfirmation, sendWelcomeEmail };