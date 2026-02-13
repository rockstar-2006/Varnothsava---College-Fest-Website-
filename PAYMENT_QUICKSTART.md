# 🚀 Quick Start Guide - Razorpay Payment Integration

## ⚡ 5-Minute Setup

### Step 1: Get Razorpay Test Credentials
1. Go to https://dashboard.razorpay.com/signup
2. Create a free account
3. Navigate to Settings → API Keys
4. Generate Test Keys
5. Copy both `Key ID` and `Key Secret`

### Step 2: Configure Environment
Edit `d:\web\.env.local`:

```bash
# Replace these with your actual test keys
RAZORPAY_KEY_SECRET=rzp_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

### Step 3: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Start again
npm run dev
```

### Step 4: Test the Integration
1. Open http://localhost:3000/notify
2. Login with a test account
3. Click "PAY NOW"
4. Use test payment credentials:
   - **UPI**: `success@razorpay`
   - **Card**: `4111 1111 1111 1111`, CVV: `123`, Expiry: Any future date

---

## 📍 Key Files Created

```
d:\web\
├── .env.local                              # ✅ Updated with Razorpay config
├── src\
│   ├── types\
│   │   └── payment.ts                      # ✅ Payment type definitions
│   ├── lib\
│   │   ├── razorpay.ts                     # ✅ Razorpay server utilities
│   │   └── paymentService.ts               # ✅ Firestore payment operations
│   ├── hooks\
│   │   └── useRazorpayPayment.ts           # ✅ Payment hook for frontend
│   ├── components\
│   │   └── payment\
│   │       └── PaymentQR.tsx               # ✅ Payment status & QR component
│   └── app\
│       ├── notify\
│       │   └── page.tsx                    # ✅ Registration/Payment page
│       └── api\
│           └── payment\
│               ├── create-order\
│               │   └── route.ts            # ✅ Create Razorpay order
│               ├── verify\
│               │   └── route.ts            # ✅ Verify payment
│               └── status\
│                   └── route.ts            # ✅ Check payment status
└── PAYMENT_INTEGRATION.md                  # ✅ Full documentation
```

---

## 🎯 How It Works

### Pricing Logic
```typescript
// Automatic pricing based on email domain
if (email.endsWith('@sode-edu.in')) {
  amount = ₹200  // SODE students
} else {
  amount = ₹300  // External students
}
```

### Payment Flow
```
User clicks "Register" 
  → System checks if already paid
  → If not paid, creates Razorpay order
  → Opens Razorpay checkout
  → User pays
  → Backend verifies signature (SECURE)
  → Stores payment in Firestore
  → Updates user status
  → Shows QR code in profile
```

---

## 🧪 Testing Checklist

- [ ] Login with `@sode-edu.in` email → Should show ₹200
- [ ] Login with other email → Should show ₹300
- [ ] Complete payment with test UPI → Should succeed
- [ ] Try to pay again → Should show "Already Registered"
- [ ] Check profile page → Should show payment badge
- [ ] Check profile page → Should show QR code
- [ ] Logout and login → Payment status should persist

---

## 🔧 Troubleshooting

### "Razorpay credentials not configured"
→ Add keys to `.env.local` and restart server

### "Failed to load Razorpay SDK"
→ Check internet connection

### Payment not reflecting
→ Check browser console for errors
→ Verify Firebase authentication is working

### QR code not showing
→ Ensure payment was successful
→ Check `/api/payment/status` endpoint

---

## 📱 Pages to Test

1. **Registration Page**: http://localhost:3000/notify
   - Payment button
   - Razorpay checkout
   - Success modal

2. **Profile Page**: http://localhost:3000/profile
   - Payment status badge
   - Payment details
   - QR code (if paid)

---

## 🎨 Customization

### Change Pricing
Edit `src/app/api/payment/create-order/route.ts`:
```typescript
const amountInRupees = isSodeStudent ? 200 : 300  // Change these values
```

### Change Theme Color
Edit `src/hooks/useRazorpayPayment.ts`:
```typescript
theme: {
  color: '#10b981'  // Change to your brand color
}
```

---

## 🚀 Next Steps

1. **Test thoroughly** with all payment methods
2. **Get live Razorpay keys** when ready for production
3. **Update environment variables** with live keys
4. **Enable payment methods** in Razorpay dashboard
5. **Set up webhooks** (optional, for extra security)
6. **Monitor payments** in Razorpay dashboard

---

## 📞 Need Help?

- **Full Documentation**: See `PAYMENT_INTEGRATION.md`
- **Razorpay Docs**: https://razorpay.com/docs
- **Razorpay Dashboard**: https://dashboard.razorpay.com

---

**You're all set! 🎉**

The payment system is production-ready and follows industry best practices for security and scalability.
