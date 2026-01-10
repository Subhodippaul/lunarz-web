# Email Configuration Troubleshooting

## Current Issue
Getting "Failed to send email. Please try again." error when trying to use forgot password functionality.

## Quick Fix for Development

The forgot password system has been updated to work even without email configuration. When email fails:

1. **Check Console**: The OTP will be logged to the browser console
2. **Use Console OTP**: Copy the OTP from console and use it in the verification step
3. **Complete Flow**: You can complete the entire password reset flow using the console OTP

## Email Configuration Options

### Option 1: Gmail SMTP (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a 16-character app password
3. **Update .env.local**:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM="Lunarz <your-gmail@gmail.com>"
```

### Option 2: Custom SMTP

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM="Lunarz <noreply@yourdomain.com>"
```

### Option 3: Ethereal Email (Testing Only)

No configuration needed - the system will automatically use Ethereal for testing if no other email service is configured.

## Testing Email Configuration

### 1. Debug Email Settings
```bash
curl http://localhost:3000/api/debug-email
```

### 2. Test Email Sending
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json"
```

### 3. Test Forgot Password (Development Mode)
```bash
curl -X POST http://localhost:3000/api/test-forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Current Behavior

### With Email Configured
- OTP sent to user's email
- User receives professional email with OTP
- Normal flow continues

### Without Email Configured
- OTP generated and logged to console
- User sees message: "OTP generated. Check console for development testing."
- Developer can use console OTP to test the flow
- System provides helpful instructions

## Troubleshooting Steps

### 1. Check Environment Variables
```javascript
// In browser console or API route
console.log({
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  HAS_APP_PASSWORD: !!process.env.EMAIL_APP_PASSWORD
});
```

### 2. Check Console Logs
- Open browser developer tools
- Go to Console tab
- Look for "PASSWORD RESET OTP" messages
- Copy the OTP from console

### 3. Test Email API Directly
```javascript
// Test in browser console
fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<h1>Test</h1>'
  })
}).then(r => r.json()).then(console.log);
```

## Common Issues & Solutions

### Issue: "Authentication failed" (Gmail)
**Solution**: Use App Password, not regular password

### Issue: "Connection refused"
**Solution**: Check SMTP host and port settings

### Issue: "Invalid login"
**Solution**: Verify email credentials

### Issue: "Rate limited"
**Solution**: Wait and try again, or use different email service

## Development Workflow

1. **Start Development**: Use console OTP method
2. **Configure Email**: Set up Gmail or SMTP when ready
3. **Test Email**: Use test endpoints to verify configuration
4. **Production**: Ensure email service is properly configured

## Production Recommendations

1. **Use Professional Email Service**: SendGrid, AWS SES, Mailgun
2. **Set Up Domain**: Use your own domain for sender address
3. **Configure SPF/DKIM**: Improve email deliverability
4. **Monitor Delivery**: Track email success rates
5. **Rate Limiting**: Implement rate limiting for OTP requests

## Quick Start (No Email Setup)

1. Go to forgot password page
2. Enter any registered email
3. Open browser console (F12)
4. Look for "PASSWORD RESET OTP" log
5. Copy the OTP code
6. Enter OTP in the form
7. Complete password reset

This allows you to test the entire forgot password flow without email configuration!