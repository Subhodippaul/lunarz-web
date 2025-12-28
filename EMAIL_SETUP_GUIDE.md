# Email Setup Guide for Lunarz

This guide will help you set up email notifications for order confirmations and admin notifications.

## 🚀 Quick Setup (Gmail - Recommended for Development)

### Step 1: Enable Gmail SMTP
1. Go to your Gmail account settings
2. Enable 2-factor authentication if not already enabled
3. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update Your .env.local File
Add these variables to your `.env.local` file:

```bash
# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM="Lunarz <your-gmail@gmail.com>"

# Admin Email (where you want to receive order notifications)
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com
```

### Step 3: Install Dependencies
Run this command to install nodemailer:

```bash
npm install nodemailer @types/nodemailer
```

### Step 4: Test Email Setup
1. Place a test order on your website
2. Check the browser console for email sending logs
3. Check your email inbox for order confirmation
4. Check admin email for order notification

## 📧 Email Types

### Customer Emails
- **Subject**: Order Confirmation - [Order ID]
- **Content**: Order details, items, shipping address, next steps
- **Sent to**: Customer's email address

### Admin Emails  
- **Subject**: 🚨 New Order Received - [Order ID]
- **Content**: Customer info, items to ship, action items
- **Sent to**: Admin email address

## 🔧 Alternative Email Services

### Option 1: Custom SMTP (Production)
For production, use a dedicated email service:

```bash
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM="Lunarz <noreply@yourdomain.com>"
```

**Recommended Services:**
- **SendGrid**: https://sendgrid.com/
- **Mailgun**: https://www.mailgun.com/
- **AWS SES**: https://aws.amazon.com/ses/
- **Postmark**: https://postmarkapp.com/

### Option 2: Ethereal Email (Testing Only)
For testing without real emails, the system will automatically use Ethereal Email if no configuration is provided. Check console logs for preview URLs.

## 🛠️ Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Make sure you're using an App Password, not your regular Gmail password
   - Verify 2-factor authentication is enabled

2. **"Connection timeout"**
   - Check your internet connection
   - Verify SMTP settings are correct

3. **"Emails not received"**
   - Check spam/junk folders
   - Verify email addresses are correct
   - Check console logs for error messages

4. **"Module not found: nodemailer"**
   - Run: `npm install nodemailer @types/nodemailer`
   - Restart your development server

### Debug Steps:
1. Check browser console for email sending logs
2. Verify environment variables are loaded correctly
3. Test with a simple email first
4. Check email provider's documentation

## 📱 Email Templates

The system includes professional HTML email templates with:
- **Responsive design** for mobile and desktop
- **Order details** with itemized breakdown
- **Shipping information** and tracking details
- **Branded styling** matching your website
- **Call-to-action buttons** for customer engagement

## 🔒 Security Notes

- Never commit email passwords to version control
- Use App Passwords instead of regular passwords
- Keep SMTP credentials in environment variables only
- Consider using dedicated email services for production
- Monitor email sending logs for suspicious activity

## 📊 Email Analytics

Monitor email performance:
- Delivery rates
- Open rates (if using advanced email services)
- Customer engagement
- Admin response times

## 🚀 Production Deployment

For production:
1. Use a dedicated email service (SendGrid, Mailgun, etc.)
2. Set up proper DNS records (SPF, DKIM, DMARC)
3. Monitor email delivery rates
4. Set up email templates in your email service
5. Configure webhooks for delivery tracking

## 💡 Tips

- Test email setup in development before deploying
- Use different email addresses for testing
- Keep email templates simple and mobile-friendly
- Include unsubscribe links for marketing emails
- Monitor spam scores and delivery rates

---

Need help? Check the console logs or contact support!