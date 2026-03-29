import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create transporter with Gmail App Password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Hackathon App'} <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };
  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log('\n⚠️ EMAIL SENDING FAILED (Bad Credentials) ⚠️');
    console.log('Instead of crashing, here is the email that would have been sent:');
    console.log('--------------------------------------------------');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`\nContent: \n`);
    console.log(options.message); // Contains the OTP
    console.log('--------------------------------------------------\n');
  }
};

export default sendEmail;
