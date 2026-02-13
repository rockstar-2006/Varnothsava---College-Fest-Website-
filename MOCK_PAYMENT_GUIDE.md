# 🎭 Mock Payment Flow - Development Guide

## Overview

For **local development**, you can use the **mock payment flow** that simulates Razorpay without requiring actual API credentials or internet connection. This allows you to test the complete payment integration locally.

---

## 🚀 Quick Setup (30 seconds)

### 1. Enable Mock Mode

Your `.env.local` already has mock mode enabled:

```bash
NEXT_PUBLIC_MOCK_PAYMENT=true
```

### 2. That's it! 

No Razorpay credentials needed. The system will automatically use mock payments.

---

## 🎬 How Mock Payment Works

### User Flow (Same as Real Payment)

1. **User clicks "PAY NOW"**
   - System checks authentication
   - Checks if already paid
   - Creates mock order (no Razorpay API call)

2. **Mock Payment Processing**
   - Shows loading state for 2 seconds (simulates payment)
   - Generates mock payment ID: `pay_mock_1234567890`
   - Generates mock signature
   - No Razorpay SDK loaded

3. **Backend Verification**
   - Detects mock payment by ID prefix (`pay_mock_`)
   - Skips signature verification
   - Creates dummy payment details
   - Stores in Firestore (real database)

4. **Success**
   - User status updated to "hasPaid: true"
   - QR code generated
   - Success modal shown

---

## 🔄 Switching Between Mock and Real

### Development Mode (Mock Payments)
```bash
# .env.local
NEXT_PUBLIC_MOCK_PAYMENT=true
```

**Features:**
- ✅ No Razorpay credentials needed
- ✅ No internet required
- ✅ Instant payment (2-second delay)
- ✅ Full flow testing
- ✅ Database operations are REAL
- ⚠️ Signature verification skipped
- ⚠️ No actual Razorpay API calls

### Production Mode (Real Payments)
```bash
# .env.local
NEXT_PUBLIC_MOCK_PAYMENT=false

# Also add real credentials:
RAZORPAY_KEY_SECRET=rzp_live_YOUR_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
```

**Features:**
- ✅ Real Razorpay integration
- ✅ Actual payment processing
- ✅ Full signature verification
- ✅ Real payment methods (UPI/Card/etc)
- ⚠️ Requires Razorpay credentials
- ⚠️ Requires internet connection

---

## 🧪 Testing Mock Payments

### Test Scenario 1: SODE Student (₹200)

1. Login with email ending in `@sode-edu.in`
2. Go to `/notify`
3. Click "PAY NOW"
4. Wait 2 seconds
5. ✅ Payment successful
6. Check profile → Should show ₹200 payment

### Test Scenario 2: External Student (₹300)

1. Login with any other email
2. Go to `/notify`
3. Click "PAY NOW"
4. Wait 2 seconds
5. ✅ Payment successful
6. Check profile → Should show ₹300 payment

### Test Scenario 3: Duplicate Payment

1. Complete payment once
2. Try to pay again
3. ✅ Should show "Already Registered"

### Test Scenario 4: QR Code Generation

1. Complete payment
2. Go to `/profile`
3. ✅ Should see payment badge (Active)
4. ✅ Should see QR code
5. ✅ Should see payment details

---

## 🔍 What's Different in Mock Mode?

### Frontend (`useRazorpayPayment.ts`)

**Mock Mode:**
```typescript
// Skips Razorpay SDK loading
// Generates mock payment response
const mockResponse = {
  razorpay_order_id: orderData.order.id,
  razorpay_payment_id: `pay_mock_${Date.now()}`,
  razorpay_signature: `mock_signature_${Date.now()}`
}
```

**Real Mode:**
```typescript
// Loads Razorpay SDK from CDN
// Opens real Razorpay checkout
// User selects payment method
// Real payment processing
```

### Backend (`/api/payment/create-order`)

**Mock Mode:**
```typescript
// Creates dummy order
order = {
  id: `order_mock_${Date.now()}`,
  amount: amountInPaise,
  currency: 'INR',
  receipt: `rcpt_mock_${Date.now()}`
}
```

**Real Mode:**
```typescript
// Calls Razorpay API
order = await createRazorpayOrder(...)
```

### Backend (`/api/payment/verify`)

**Mock Mode:**
```typescript
// Detects mock payment
if (paymentId.startsWith('pay_mock_')) {
  // Skip signature verification
  // Create dummy payment details
}
```

**Real Mode:**
```typescript
// Verifies signature with HMAC SHA-256
// Fetches real payment details from Razorpay
```

---

## 📊 Mock Payment Details

When you complete a mock payment, the following data is stored in Firestore:

```json
{
  "razorpay_payment_id": "pay_mock_1707674400000",
  "razorpay_order_id": "order_mock_1707674398000",
  "razorpay_signature": "mock_signature_1707674400000",
  "amount": 20000,
  "currency": "INR",
  "status": "captured",
  "user_email": "student@sode-edu.in",
  "student_type": "internal",
  "payment_method": "upi",
  "payment_method_details": {
    "type": "upi",
    "upi_transaction_id": "success@razorpay"
  },
  "paid_at": "2024-02-11T15:20:00.000Z",
  "notes": {
    "mock": "true",
    "environment": "development"
  },
  "created_at": "2024-02-11T15:20:00.000Z",
  "updated_at": "2024-02-11T15:20:00.000Z"
}
```

---

## 🎯 What's Real vs Mock

### ✅ Real (Even in Mock Mode)

- Firebase Authentication
- Firestore Database Operations
- User Status Updates
- QR Code Generation
- Payment Record Storage
- API Route Logic
- Frontend State Management
- Error Handling

### 🎭 Mock (Only in Mock Mode)

- Razorpay SDK Loading
- Payment Gateway UI
- Signature Verification
- Payment Details from Razorpay
- Order Creation on Razorpay
- Actual Money Transfer

---

## 🔒 Security Note

**Mock mode is ONLY for development!**

- ⚠️ Never use mock mode in production
- ⚠️ Always verify `NEXT_PUBLIC_MOCK_PAYMENT=false` before deploying
- ⚠️ Mock payments bypass signature verification
- ⚠️ Anyone can create fake payment IDs in mock mode

**Production Checklist:**
```bash
# Before deploying to production:
1. Set NEXT_PUBLIC_MOCK_PAYMENT=false
2. Add real Razorpay credentials
3. Test with Razorpay test mode first
4. Then switch to live credentials
5. Verify signature verification is working
```

---

## 🐛 Troubleshooting Mock Mode

### Issue: "Failed to load Razorpay SDK"
**Solution:** Make sure `NEXT_PUBLIC_MOCK_PAYMENT=true` in `.env.local`

### Issue: Payment not completing
**Solution:** Check browser console for errors. Mock payment should complete in 2 seconds.

### Issue: Payment not saving to database
**Solution:** Check Firebase credentials. Database operations are real even in mock mode.

### Issue: QR code not showing
**Solution:** Ensure payment was successful. Check `/api/payment/status` endpoint.

---

## 📝 Console Logs in Mock Mode

You'll see these logs in the browser console:

```
🎭 MOCK PAYMENT MODE - Simulating Razorpay checkout...
✅ Mock payment successful: {razorpay_order_id: "order_mock_...", ...}
```

And in the server console:

```
🎭 MOCK PAYMENT MODE - Creating dummy order
🎭 MOCK PAYMENT - Skipping signature verification
🎭 MOCK PAYMENT - Using dummy payment details
```

---

## 🎉 Benefits of Mock Mode

1. **Faster Development**
   - No waiting for Razorpay API
   - No internet required
   - Instant payment completion

2. **Easier Testing**
   - Test payment flow without credentials
   - No need to sign up for Razorpay
   - Test duplicate payments easily

3. **Offline Development**
   - Work without internet
   - No external dependencies
   - Full control over payment flow

4. **Cost-Free Testing**
   - No Razorpay account needed
   - No test transactions
   - Unlimited testing

---

## 🚀 Ready for Production?

When you're ready to use real payments:

1. **Get Razorpay Credentials**
   - Sign up at https://dashboard.razorpay.com
   - Get test keys first
   - Test thoroughly
   - Get live keys when ready

2. **Update Environment**
   ```bash
   NEXT_PUBLIC_MOCK_PAYMENT=false
   RAZORPAY_KEY_SECRET=rzp_live_YOUR_SECRET
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
   ```

3. **Test Everything**
   - Test with real Razorpay test mode
   - Verify signature verification works
   - Test all payment methods
   - Test error scenarios

4. **Deploy**
   - Deploy to production
   - Monitor first few payments
   - Set up error tracking

---

**Happy Testing! 🎭**

The mock payment system gives you a complete, realistic payment flow for development without needing any external services or credentials.
