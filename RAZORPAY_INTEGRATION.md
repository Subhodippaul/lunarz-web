# Razorpay Payment Integration

This document explains the Razorpay payment integration implemented in the Lunarz e-commerce platform.

## Overview

The integration supports both **Cash on Delivery (COD)** and **Online Payment** methods using Razorpay's secure payment gateway.

## Features

- ✅ **Dual Payment Methods**: COD and Online payments
- ✅ **Secure Payment Processing**: Using Razorpay's encrypted gateway
- ✅ **Payment Verification**: Server-side signature verification
- ✅ **Dynamic Shipping**: COD orders have shipping charges based on order value
- ✅ **Order Management**: Seamless integration with existing order system
- ✅ **User Experience**: Clean UI with payment method selection

## Setup Instructions

### 1. Razorpay Account Setup

1. Create a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Go to Dashboard → Settings → API Keys
4. Generate API Keys (Test/Live mode)

### 2. Environment Configuration

Add the following to your `.env.local` file:

```bash
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx  # Your Key ID
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx     # Your Key Secret (keep secret!)
```

**Important**: 
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is exposed to frontend (safe)
- `RAZORPAY_KEY_SECRET` is server-only (never expose to frontend)

### 3. Test Mode vs Live Mode

- **Test Mode**: Use `rzp_test_` keys for development
- **Live Mode**: Use `rzp_live_` keys for production

## Implementation Details

### Files Structure

```
lib/
├── razorpay-service.ts          # Main Razorpay service
├── order-services.ts            # Updated with payment fields
└── shipping-services.ts         # COD shipping logic

app/
├── api/razorpay/
│   ├── create-order/route.ts    # Server-side order creation
│   └── verify-payment/route.ts  # Payment verification
└── checkout/page.tsx            # Updated checkout page
```

### Payment Flow

#### Online Payment Flow:
1. User selects "Online Payment" method
2. Fills billing/shipping information
3. Clicks "Pay Now"
4. System creates Razorpay order on server
5. Razorpay checkout modal opens
6. User completes payment
7. Payment verification on server
8. Order created in database
9. Redirect to thank you page

#### COD Payment Flow:
1. User selects "Cash on Delivery"
2. Fills billing/shipping information
3. Clicks "Place Order (COD)"
4. Order created directly in database
5. Redirect to thank you page

### Payment Methods Supported

**Online Payment includes:**
- Credit Cards (Visa, MasterCard, RuPay, etc.)
- Debit Cards
- UPI (Google Pay, PhonePe, Paytm, etc.)
- Net Banking (All major banks)
- Wallets (Paytm, Mobikwik, etc.)
- EMI options (for eligible cards)

### Shipping Logic

- **COD Orders**: 
  - Below ₹999: ₹50 shipping charge
  - Above ₹999: Free shipping
- **Online Payment Orders**: 
  - Free shipping (no additional charges)

## Security Features

### Payment Security
- ✅ PCI DSS compliant payment processing
- ✅ 256-bit SSL encryption
- ✅ Server-side signature verification
- ✅ No card details stored on our servers

### Implementation Security
- ✅ Environment variables for sensitive data
- ✅ Server-side payment verification
- ✅ HMAC signature validation
- ✅ Order amount verification

## Testing

### Test Cards (Test Mode Only)

**Successful Payments:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payments:**
- Card: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI IDs
- `success@razorpay` - Successful payment
- `failure@razorpay` - Failed payment

## Error Handling

The integration handles various error scenarios:

1. **Payment Failures**: User-friendly error messages
2. **Network Issues**: Retry mechanisms
3. **Verification Failures**: Secure fallback handling
4. **Order Creation Errors**: Proper error reporting

## Monitoring & Analytics

### Available Metrics
- Payment success/failure rates
- Payment method preferences
- Order value analysis
- Geographic payment patterns

### Razorpay Dashboard
Access detailed analytics at: [https://dashboard.razorpay.com](https://dashboard.razorpay.com)

## Webhooks (Future Enhancement)

For production, consider implementing Razorpay webhooks for:
- Payment status updates
- Refund notifications
- Dispute management
- Settlement reports

## Support & Troubleshooting

### Common Issues

1. **"Razorpay key not configured"**
   - Check environment variables
   - Ensure correct key format

2. **Payment verification failed**
   - Verify RAZORPAY_KEY_SECRET
   - Check server logs for details

3. **Checkout not opening**
   - Check browser console for errors
   - Ensure Razorpay script is loaded

### Getting Help

- **Razorpay Documentation**: [https://razorpay.com/docs](https://razorpay.com/docs)
- **Support**: [https://razorpay.com/support](https://razorpay.com/support)
- **Integration Guide**: [https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)

## Production Checklist

Before going live:

- [ ] Switch to live API keys
- [ ] Test with real payment methods
- [ ] Configure webhooks
- [ ] Set up monitoring
- [ ] Review security settings
- [ ] Test refund process
- [ ] Verify tax calculations
- [ ] Check compliance requirements

## Compliance

- **PCI DSS**: Razorpay handles PCI compliance
- **RBI Guidelines**: Compliant with Indian regulations
- **Data Protection**: No sensitive payment data stored locally
- **GST**: Tax calculations handled separately

---

**Note**: This integration is production-ready but requires proper Razorpay account setup and API key configuration.