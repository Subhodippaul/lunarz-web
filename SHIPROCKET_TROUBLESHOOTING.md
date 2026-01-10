# Shiprocket Integration Troubleshooting

## Common Issues and Solutions

### 1. Authentication Failed Error

**Error:** `"Failed to authenticate with Shiprocket"`

**Causes & Solutions:**

#### Missing Credentials
- **Check:** Ensure `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` are set in `.env.local`
- **Solution:** Add your Shiprocket login credentials to environment variables

```env
SHIPROCKET_EMAIL=your-shiprocket-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-password
```

#### Incorrect Credentials
- **Check:** Verify you can log in to [Shiprocket Dashboard](https://app.shiprocket.in/) with these credentials
- **Solution:** Update credentials in `.env.local` with correct values

#### Account Issues
- **Check:** Ensure your Shiprocket account is active and verified
- **Solution:** Complete account verification in Shiprocket dashboard

### 2. Order Tracking Failed

**Error:** `"Failed to track order"`

**Causes & Solutions:**

#### Invalid AWB/Order ID
- **Check:** Verify the AWB code or order ID exists in Shiprocket
- **Solution:** Use valid tracking numbers from your Shiprocket dashboard

#### Order Not Yet in System
- **Check:** Orders may take time to appear in Shiprocket after creation
- **Solution:** Wait 15-30 minutes after order creation before tracking

#### API Rate Limits
- **Check:** Shiprocket has API rate limits
- **Solution:** Implement retry logic with delays

### 3. Order Creation Failed

**Error:** `"Failed to create Shiprocket order"`

**Causes & Solutions:**

#### Missing Pickup Location
- **Check:** Ensure pickup location is configured in Shiprocket dashboard
- **Solution:** Go to Settings > Pickup Locations and add your address

#### Invalid Product Data
- **Check:** Ensure all required product fields are present
- **Solution:** Verify product name, SKU, price, and quantity are valid

#### Address Validation
- **Check:** Shipping address format and PIN code validity
- **Solution:** Ensure addresses follow Indian postal format

## Testing the Integration

### 1. Test Connection

Visit: `http://localhost:3000/api/shiprocket/test-connection`

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Shiprocket connection successful",
  "tokenReceived": true,
  "tokenLength": 500,
  "timestamp": "2025-01-04T..."
}
```

**Expected Response (Failure):**
```json
{
  "success": false,
  "error": "Shiprocket connection failed",
  "details": "Authentication failed: 401 Unauthorized",
  "timestamp": "2025-01-04T..."
}
```

### 2. Test Order Tracking

Visit: `http://localhost:3000/api/shiprocket/track-order?awb_code=YOUR_AWB_CODE`

Replace `YOUR_AWB_CODE` with a real AWB code from your Shiprocket dashboard.

### 3. Check Browser Console

Open browser developer tools and check the console for detailed error messages when testing tracking functionality.

## Environment Setup Checklist

- [ ] Shiprocket account created and verified
- [ ] Business details completed in Shiprocket dashboard
- [ ] Pickup location configured
- [ ] `SHIPROCKET_EMAIL` set in `.env.local`
- [ ] `SHIPROCKET_PASSWORD` set in `.env.local`
- [ ] Can log in to Shiprocket dashboard with these credentials
- [ ] Test connection API returns success

## Demo Mode

When Shiprocket credentials are not configured, the system automatically falls back to demo mode:

- **Order Creation:** Returns demo shipment IDs
- **Order Tracking:** Shows demo tracking data
- **No Errors:** Main order process continues normally

This allows development and testing without requiring Shiprocket setup.

## Production Checklist

Before going live:

- [ ] Real Shiprocket account with production credentials
- [ ] Pickup locations configured for all warehouses
- [ ] Test order creation with real products
- [ ] Test order tracking with real AWB codes
- [ ] Monitor error logs for any issues
- [ ] Set up webhook endpoints for status updates (future enhancement)

## Getting Help

### Shiprocket Support
- **Email:** support@shiprocket.in
- **Phone:** +91-11-4084-5555
- **Dashboard:** [app.shiprocket.in](https://app.shiprocket.in/)

### API Documentation
- **Docs:** [apidocs.shiprocket.in](https://apidocs.shiprocket.in/)
- **Postman Collection:** Available in Shiprocket dashboard

### Debug Steps

1. **Check Environment Variables**
   ```bash
   echo $SHIPROCKET_EMAIL
   echo $SHIPROCKET_PASSWORD
   ```

2. **Test API Connection**
   ```bash
   curl -X POST https://apiv2.shiprocket.in/v1/external/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email","password":"your-password"}'
   ```

3. **Check Server Logs**
   - Look for detailed error messages in your application logs
   - Check browser network tab for API response details

4. **Verify Account Status**
   - Log in to Shiprocket dashboard
   - Check account verification status
   - Ensure no pending actions required

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Unauthorized | Check credentials |
| 422 | Validation Error | Check required fields |
| 429 | Rate Limited | Implement retry with delay |
| 500 | Server Error | Contact Shiprocket support |

---

**Note:** The integration is designed to be resilient. Even if Shiprocket fails, your main order process will continue to work with demo data.