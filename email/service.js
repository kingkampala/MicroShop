const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"Microshop" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`email sent to ${to}`);
  } catch (error) {
    console.error('error sending email:', error);
  }
};

module.exports = sendEmail;