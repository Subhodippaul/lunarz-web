# Forgot Password Functionality Setup

## Overview
This document outlines the forgot password functionality implemented with email OTP verification.

## Features Implemented

### 1. Forgot Password Page (`/forgot-password`)
- **URL Structure**: `/forgot-password?uid={uniqueId}` (same as login/signup)
- **Three-step process**:
  1. **Email Entry**: User enters their email address
  2. **OTP Verification**: User enters 6-digit code sent to email
  3. **Password Reset**: User sets new password

### 2. Email OTP System
- **OTP Generation**: 6-digit random code
- **Expiry**: 5 minutes (300 seconds)
- **Attempts**: Maximum 3 verification attempts
- **Resend**: Available after timer expires

### 3. API Routes

#### `/api/auth/send-reset-otp`
- **Method**: POST
- **Body**: `{ email: string }`
- **Function**: Validates user exists and sends OTP via email
- **Response**: Success/error message

#### `/api/auth/verify-reset-otp`
- **Method**: POST
- **Body**: `{ email: string, otp: string }`
- **Function**: Verifies OTP and marks as validated
- **Response**: Success/error with remaining attempts

#### `/api/auth/reset-password`
- **Method**: POST
- **Body**: `{ email: string, otp: string, newPassword: string }`
- **Function**: Resets password after final OTP verification
- **Response**: Success/error message

### 4. Email Templates
- **Professional design** with Lunarz branding
- **Security warnings** and tips
- **Clear OTP display** with large, readable font
- **Expiry information** and support contact

### 5. Security Features
- **Session validation** with unique ID system
- **OTP expiry** (5 minutes)
- **Attempt limiting** (3 tries per OTP)
- **Email verification** (user must exist)
- **Password strength** validation (minimum 6 characters)

## URL Structure Consistency

### Before
- Login: `/login?uid={uniqueId}`
- Signup: `/signup` (no uid parameter)

### After
- Login: `/login?uid={uniqueId}`
- Signup: `/signup?uid={uniqueId}` ✅
- Forgot Password: `/forgot-password?uid={uniqueId}` ✅

## User Flow

1. **Access**: User clicks "Forgot Password" from login page
2. **Validation**: System validates unique ID from URL
3. **Email Entry**: User enters registered email address
4. **OTP Sent**: System sends 6-digit code to email
5. **OTP Entry**: User enters code within 5 minutes
6. **Verification**: System validates OTP (max 3 attempts)
7. **Password Reset**: User creates new password
8. **Completion**: User redirected to login page

## Technical Implementation

### Frontend Components
- **Forgot Password Page**: Multi-step form with validation
- **OTP Timer**: Countdown display with resend functionality
- **Error Handling**: Comprehensive error messages and states
- **Loading States**: Visual feedback during API calls

### Backend Services
- **Email Service**: OTP email template and sending
- **User Service**: User existence check and password reset
- **OTP Storage**: In-memory storage (production should use Redis/DB)

### Security Considerations
- **Rate Limiting**: Prevent OTP spam (implement in production)
- **HTTPS Only**: Secure transmission of sensitive data
- **Input Validation**: Server-side validation of all inputs
- **Session Management**: Proper cleanup of OTP data

## Production Recommendations

1. **OTP Storage**: Use Redis or database instead of in-memory storage
2. **Rate Limiting**: Implement rate limiting for OTP requests
3. **Logging**: Add comprehensive logging for security monitoring
4. **Firebase Admin**: Use Firebase Admin SDK for actual password resets
5. **Email Service**: Use production email service (SendGrid, AWS SES)
6. **Monitoring**: Add alerts for failed attempts and suspicious activity

## Environment Variables Required

```env
# Email service configuration (already configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin email for notifications
ADMIN_EMAIL=lunarz.info@gmail.com
```

## Testing

### Test Scenarios
1. **Valid Email**: Test with registered user email
2. **Invalid Email**: Test with non-existent email
3. **OTP Expiry**: Wait 5+ minutes and try to use OTP
4. **Wrong OTP**: Enter incorrect codes (test 3-attempt limit)
5. **Password Validation**: Test weak passwords
6. **Session Validation**: Test without proper uid parameter

### Development Testing
- OTP codes are logged to console for development
- Check browser console for OTP values during testing
- Test email delivery with configured SMTP settings

## Integration Points

### Existing Systems
- **Authentication Context**: Uses existing auth system
- **Email Service**: Extends existing email functionality
- **Firebase Services**: Integrates with user management
- **UI Components**: Uses existing design system
- **Unique ID System**: Follows established URL validation

### Navigation Links
- Login page "Forgot Password" link includes uid parameter
- Forgot password page "Back to Login" link includes uid parameter
- All signup links now include uid parameter for consistency

## Success Metrics
- **User Experience**: Seamless password recovery process
- **Security**: No unauthorized password resets
- **Reliability**: High email delivery rate
- **Performance**: Fast OTP generation and verification