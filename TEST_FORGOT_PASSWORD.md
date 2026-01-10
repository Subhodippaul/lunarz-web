# Testing Forgot Password Functionality

## Quick Test (No Email Setup Required)

### Step 1: Access Forgot Password
1. Go to login page: `http://localhost:3000/login?uid={uniqueId}`
2. Click "Forgot Password" link
3. You'll be redirected to: `http://localhost:3000/forgot-password?uid={uniqueId}`

### Step 2: Enter Email
1. Enter any registered email address (or create a test user first)
2. Click "Send Verification Code"
3. You should see: "OTP generated. Check console for development testing."

### Step 3: Get OTP from Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for log message: "=== PASSWORD RESET OTP ==="
4. Copy the 6-digit OTP code

### Step 4: Verify OTP
1. Enter the OTP from console
2. Click "Verify Code"
3. You should see: "OTP verified successfully"

### Step 5: Reset Password
1. Enter new password (minimum 6 characters)
2. Confirm password
3. Click "Update Password"
4. You should be redirected to login page

## Expected Console Output

```
=== PASSWORD RESET OTP ===
Email: test@example.com
OTP: 123456
Expires: 1/8/2026, 3:45:00 PM
========================
```

## API Testing

### Test OTP Generation
```bash
curl -X POST http://localhost:3000/api/auth/send-reset-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test OTP Verification
```bash
curl -X POST http://localhost:3000/api/auth/verify-reset-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### Test Password Reset
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","newPassword":"newpass123"}'
```

## Troubleshooting

### Issue: "No account found with this email address"
**Solution**: Create a user account first or use an existing registered email

### Issue: "Session Invalid"
**Solution**: Make sure you access the page with proper uid parameter from login page

### Issue: "OTP has expired"
**Solution**: Generate a new OTP (they expire in 5 minutes)

### Issue: "Invalid OTP"
**Solution**: Check console for the correct OTP code

## Email Configuration (Optional)

If you want to test actual email sending:

1. **Set up Gmail App Password**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_APP_PASSWORD=your-16-char-app-password
   ```

2. **Test email configuration**:
   ```bash
   curl http://localhost:3000/api/debug-email
   curl -X POST http://localhost:3000/api/test-email
   ```

## Success Indicators

✅ **OTP Generation**: Console shows OTP with expiry time
✅ **OTP Verification**: "OTP verified successfully" message
✅ **Password Reset**: "Password reset successfully" message
✅ **Redirect**: Automatic redirect to login page after reset
✅ **Login**: Can login with new password

## Development Features

- **Console Logging**: OTP codes logged for easy testing
- **Development Mode**: Clear messages when email isn't configured
- **Error Handling**: Comprehensive error messages and fallbacks
- **Session Validation**: Proper unique ID validation
- **Timer**: 5-minute countdown with resend functionality