import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration - you can use Gmail, Outlook, or any SMTP service
const createTransporter = () => {
  // Option 1: Gmail SMTP (recommended for development)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    // Remove spaces from app password (Gmail app passwords sometimes have spaces)
    const appPassword = process.env.EMAIL_APP_PASSWORD?.replace(/\s/g, '') || '';
    
    console.log('Gmail configuration:', {
      user: process.env.EMAIL_USER,
      hasPassword: !!appPassword,
      passwordLength: appPassword.length
    });

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: appPassword, // Gmail App Password (spaces removed)
      },
    });
  }
  
  // Option 2: Custom SMTP (for production)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Option 3: Ethereal Email (for testing - creates fake SMTP)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass'
    }
  });
};

interface EmailAttachment {
  filename: string;
  content: string; // base64 string, no "data:image/...;base64," prefix
  encoding: 'base64';
  cid?: string; // Content-ID for inline images referenced via cid: in the HTML
}

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, from, attachments } = await request.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = createTransporter();

    // Email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: from || process.env.EMAIL_FROM || 'Lunarz <lunarz.info@gmail.com>',
      to: to,
      subject: subject,
      html: html,
      ...(Array.isArray(attachments) && attachments.length > 0
        ? { attachments: attachments as EmailAttachment[] }
        : {}),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      to: to,
      subject: subject,
      attachmentCount: attachments?.length || 0,
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      preview: nodemailer.getTestMessageUrl(info), // Only for Ethereal
    });

  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error.message 
      },
      { status: 500 }
    );
  }
}