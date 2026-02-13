# 🎯 Razorpay Payment Integration - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Setup Instructions](#setup-instructions)
5. [API Endpoints](#api-endpoints)
6. [Frontend Integration](#frontend-integration)
7. [Payment Flow](#payment-flow)
8. [Security Measures](#security-measures)
9. [Testing](#testing)
10. [Error Handling](#error-handling)

---

## 🏗️ Overview

This is a **production-grade Razorpay payment integration** for Varnothsava 2K26 college fest registration. The system handles:

- ✅ Dynamic pricing (₹200 for SODE students, ₹300 for external students)
- ✅ Secure payment processing via Razorpay
- ✅ Server-side payment verification
- ✅ Payment status tracking
- ✅ QR code generation for payment verification
- ✅ Idempotent payment handling (prevents duplicates)
- ✅ Comprehensive error handling
- ✅ Mobile and desktop responsive

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT SYSTEM ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend (Client)                                                │
│  ├── /notify (Registration Page)                                 │
│  ├── /profile (Payment Status & QR Code)                         │
│  └── useRazorpayPayment Hook                                     │
│                                                                   │
│  Backend (API Routes)                                             │
│  ├── POST /api/payment/create-order                              │
│  ├── POST /api/payment/verify                                    │
│  └── GET  /api/payment/status                                    │
│                                                                   │
│  Services                                                         │
│  ├── razorpay.ts (Razorpay SDK wrapper)                          │
│  ├── paymentService.ts (Firestore operations)                    │
│  └── firebaseAdmin.ts (Authentication)                           │
│                                                                   │
│  Database (Firestore)                                             │
│  ├── payments/ (Payment records)                                 │
│  └── users/ (User payment status)                                │
│                                                                   │
│  External                                                         │
│  └── Razorpay API                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Firestore Collections

#### `payments` Collection
```typescript
{
  // Document ID: razorpay_payment_id
  
  // Razorpay identifiers
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
  
  // Payment details
  amount: number // in paise (₹200 = 20000)
  currency: string // 'INR'
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded'
  
  // User information
  user_id: string
  user_email: string
  student_type: 'internal' | 'external'
  
  // Payment method
  payment_method: string // 'card', 'upi', 'netbanking', 'wallet'
  payment_method_details: {
    type: string
    upi_transaction_id?: string // UTR for UPI
    card_last4?: string
    card_network?: string
    bank?: string
    wallet?: string
  }
  
  // Timestamps
  created_at: string // ISO 8601
  updated_at: string
  paid_at: string
  
  // Optional
  event_ids?: string[]
  notes?: object
  error_description?: string
}
```

#### `users` Collection Update
```typescript
{
  // Existing fields...
  
  // Payment fields (added)
  hasPaid: boolean
  paymentId: string // razorpay_payment_id
  updatedAt: string
}
```

---

## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
npm install razorpay qrcode crypto
```

### 2. Configure Environment Variables

Edit `.env.local` and add your Razorpay credentials:

```bash
# Get these from: https://dashboard.razorpay.com/app/website-app-settings/api-keys

# Backend Secret Key (NEVER expose to frontend)
RAZORPAY_KEY_SECRET=rzp_test_XXXXXXXXXXXXXXXX

# Public Key ID (Safe to expose to frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX

# App Configuration
NEXT_PUBLIC_APP_NAME=Varnothsava 2K26
NEXT_PUBLIC_APP_LOGO=https://varnothsava.sode-edu.in/logo.png
```

### 3. Test Mode vs Production Mode

**Test Mode** (Current Setup):
- Use test API keys (start with `rzp_test_`)
- Use test payment methods provided by Razorpay
- No real money is charged

**Production Mode**:
- Replace with live API keys (start with `rzp_live_`)
- Real payments will be processed
- Ensure proper testing before going live

---

## 🔌 API Endpoints

### 1. Create Order
**Endpoint:** `POST /api/payment/create-order`

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_XXXXX",
    "amount": 20000,
    "currency": "INR",
    "receipt": "rcpt_XXXXX"
  },
  "user": {
    "email": "student@sode-edu.in",
    "student_type": "internal"
  },
  "razorpay_key": "rzp_test_XXXXX"
}
```

### 2. Verify Payment
**Endpoint:** `POST /api/payment/verify`

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Body:**
```json
{
  "razorpay_order_id": "order_XXXXX",
  "razorpay_payment_id": "pay_XXXXX",
  "razorpay_signature": "signature_XXXXX"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and recorded successfully",
  "payment": {
    "id": "pay_XXXXX",
    "amount": 200,
    "currency": "INR",
    "status": "captured",
    "paid_at": "2026-02-11T20:00:00.000Z",
    "payment_method": "upi"
  }
}
```

### 3. Check Payment Status
**Endpoint:** `GET /api/payment/status`

**Headers:**
```
Authorization: Bearer <firebase_token>
```

**Response:**
```json
{
  "hasPaid": true,
  "payment": {
    "id": "pay_XXXXX",
    "amount": 200,
    "currency": "INR",
    "status": "captured",
    "paid_at": "2026-02-11T20:00:00.000Z",
    "payment_method": "upi",
    "student_type": "internal"
  },
  "message": "Payment completed"
}
```

---

## 🎨 Frontend Integration

### Registration Page (`/notify`)

The registration page handles the complete payment flow:

1. **Check Login Status**: Redirects to login if not authenticated
2. **Check Payment Status**: Shows "Already Registered" if paid
3. **Initiate Payment**: Opens Razorpay checkout on button click
4. **Handle Success**: Shows success modal after payment
5. **Handle Errors**: Displays error messages

**Usage:**
```tsx
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment'

const { initiatePayment, isLoading, error } = useRazorpayPayment()

// Trigger payment
await initiatePayment()
```

### Profile Page (`/profile`)

The profile page shows:
- Payment status badge (Active/Pending)
- Payment details (amount, method, date)
- QR code for verification (if paid)
- "Complete Payment" button (if not paid)

**Usage:**
```tsx
import { PaymentQR } from '@/components/payment/PaymentQR'

<PaymentQR
  userId={userData.id}
  userName={userData.name}
  userEmail={userData.email}
  profileCode={userData.profileCode}
/>
```

---

## 🔄 Payment Flow

### User Journey

```
1. User clicks "Register Now" button
   ↓
2. System checks if user is logged in
   ├─ Not logged in → Redirect to /login
   └─ Logged in → Continue
   ↓
3. System checks payment status
   ├─ Already paid → Show success modal
   └─ Not paid → Continue
   ↓
4. System creates Razorpay order
   ├─ Determines amount based on email domain
   │  ├─ @sode-edu.in → ₹200
   │  └─ Others → ₹300
   └─ Sends order to backend
   ↓
5. Razorpay checkout opens
   ├─ User selects payment method (UPI/Card/NetBanking/Wallet)
   └─ User completes payment
   ↓
6. Payment verification
   ├─ Frontend receives payment response
   ├─ Sends to backend for signature verification
   ├─ Backend verifies signature (CRITICAL SECURITY)
   ├─ Fetches payment details from Razorpay
   └─ Stores payment record in Firestore
   ↓
7. Success
   ├─ User status updated to "hasPaid: true"
   ├─ Success modal shown
   └─ QR code generated for verification
```

---

## 🔒 Security Measures

### 1. Server-Side Signature Verification
**Critical:** Payment verification MUST happen on the server to prevent tampering.

```typescript
// Backend only
const isValid = verifyRazorpaySignature(
  orderId,
  paymentId,
  signature
)
```

### 2. Authentication
All payment APIs require Firebase authentication token.

### 3. Idempotency
Prevents duplicate payment processing:
```typescript
const isDuplicate = await isDuplicatePayment(orderId, paymentId)
if (isDuplicate) {
  return { success: true, duplicate: true }
}
```

### 4. Environment Variables
Secrets are stored in `.env.local` and NEVER exposed to frontend.

### 5. HTTPS Only
All payment communication happens over HTTPS.

---

## 🧪 Testing

### Test Payment Methods (Razorpay Test Mode)

#### UPI
- UPI ID: `success@razorpay`
- Status: Success

#### Card
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Status: Success

#### NetBanking
- Select any bank
- Use credentials provided by Razorpay

### Test Scenarios

1. **Successful Payment**
   - Login with SODE email → Amount should be ₹200
   - Login with external email → Amount should be ₹300
   - Complete payment → Status should update

2. **Duplicate Payment Prevention**
   - Complete payment once
   - Try to pay again → Should show "Already Registered"

3. **Payment Failure**
   - Use failure test credentials
   - Verify error handling

4. **QR Code Verification**
   - Complete payment
   - Check profile → QR code should appear
   - Scan QR → Should contain user data

---

## ⚠️ Error Handling

### Common Errors

#### 1. "Razorpay credentials not configured"
**Solution:** Add `RAZORPAY_KEY_SECRET` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` to `.env.local`

#### 2. "Failed to load Razorpay SDK"
**Solution:** Check internet connection. Razorpay script loads from CDN.

#### 3. "Invalid payment signature"
**Solution:** This indicates payment tampering. Payment is rejected.

#### 4. "Payment already processed"
**Solution:** This is expected behavior for duplicate payments (idempotency).

#### 5. "Unauthorized"
**Solution:** User needs to login again. Token may have expired.

---

## 📊 Database Indexes (Recommended)

For optimal performance, create these Firestore indexes:

```
Collection: payments
- user_id (Ascending) + created_at (Descending)
- user_id (Ascending) + status (Ascending) + created_at (Descending)
```

---

## 🚀 Going Live Checklist

- [ ] Replace test Razorpay keys with live keys
- [ ] Test all payment flows in production
- [ ] Set up Razorpay webhooks (optional, for additional security)
- [ ] Enable Razorpay payment methods you want to support
- [ ] Configure payment success/failure URLs
- [ ] Set up proper error logging (Sentry, etc.)
- [ ] Test on multiple devices and browsers
- [ ] Verify QR code scanning works
- [ ] Set up payment reconciliation process
- [ ] Configure automatic refund policy (if needed)

---

## 📞 Support

For Razorpay-specific issues:
- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs
- Support: https://razorpay.com/support

---

## 🎉 Features Implemented

✅ Dynamic pricing based on email domain  
✅ Secure server-side payment verification  
✅ Idempotent payment handling  
✅ Payment status tracking  
✅ QR code generation for verification  
✅ Mobile-responsive design  
✅ Comprehensive error handling  
✅ Payment method details capture  
✅ Transaction history support  
✅ Real-time payment status updates  

---

**Built with ❤️ for Varnothsava 2K26**
