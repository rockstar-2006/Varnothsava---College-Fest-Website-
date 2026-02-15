# 🚀 Real Razorpay Integration - Setup Guide

## ✅ You're Now Using REAL Razorpay!

Mock mode is **disabled**. The system will now use Razorpay's official checkout UI with all payment methods.

---

## 📋 Step-by-Step Setup (5 Minutes)

### Step 1: Create Razorpay Account (2 minutes)

1. **Go to:** https://dashboard.razorpay.com/signup
2. **Sign up** with your email
3. **Verify email** and complete registration
4. **Skip KYC** for now (test mode doesn't require it)

### Step 2: Get Test API Keys (1 minute)

1. **Login to Dashboard:** https://dashboard.razorpay.com
2. **Go to Settings** (left sidebar) → **API Keys**
3. **Switch to Test Mode** (toggle at top)
4. **Generate Test Keys** (if not already generated)
5. **Copy both keys:**
   - `Key ID` (starts with `rzp_test_`)
   - `Key Secret` (starts with `rzp_test_`)

### Step 3: Add Keys to Your Project (30 seconds)

Open `d:\web\.env.local` and replace the placeholder values:

```bash
# Replace these with your actual keys:
RAZORPAY_KEY_SECRET=rzp_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

**Example:**
```bash
RAZORPAY_KEY_SECRET=rzp_test_XyZ789GhI012
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_AbC123DeF456
```

### Step 4: Restart Development Server (30 seconds)

```bash
# Stop current server (Ctrl+C in terminal)
# Start again
npm run dev
```

### Step 5: Test Payment! (1 minute)

1. **Open:** http://localhost:3000/notify
2. **Login** with any account
3. **Click "PAY NOW"**
4. **Razorpay Checkout Opens** 🎉

---

## 🎨 What You'll See (Real Razorpay UI)

### Razorpay Checkout Modal

When you click "PAY NOW", Razorpay's beautiful checkout modal will appear:

```
┌─────────────────────────────────────┐
│  Varnothsava 2K26                   │
│  Registration Fee - SODE Student    │
│                                     │
│  ₹200.00                            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📱 UPI                      │   │
│  │ 💳 Cards                    │   │
│  │ 🏦 Netbanking               │   │
│  │ 💰 Wallets                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Pay ₹200]                         │
└─────────────────────────────────────┘
```

### Payment Methods Available

✅ **UPI** - Google Pay, PhonePe, Paytm, etc.  
✅ **Cards** - Debit/Credit cards  
✅ **NetBanking** - All major banks  
✅ **Wallets** - Paytm, Mobikwik, etc.  

---

## 🧪 Test Payment Methods (Razorpay Test Mode)

### 1. UPI (Recommended for Testing)

**Test UPI ID:** `success@razorpay`

**Steps:**
1. Select UPI in Razorpay checkout
2. Enter: `success@razorpay`
3. Click Pay
4. ✅ Payment succeeds instantly

**Other Test UPIs:**
- `failure@razorpay` - Payment fails
- `pending@razorpay` - Payment stays pending

### 2. Cards

**Test Card Details:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date (e.g., 12/25)
Name: Any name
```

**Other Test Cards:**
- `5555 5555 5555 4444` - Mastercard (success)
- `4000 0000 0000 0002` - Card declined

### 3. NetBanking

1. Select any bank
2. Use test credentials provided by Razorpay
3. Payment succeeds

### 4. Wallets

1. Select Paytm/Mobikwik
2. Use test credentials
3. Payment succeeds

---

## 🔄 Payment Flow (Real Razorpay)

### User Journey

```
1. User clicks "PAY NOW"
   ↓
2. System creates Razorpay order
   ↓
3. Razorpay Checkout SDK loads
   ↓
4. Beautiful payment modal appears
   ├─ Shows amount (₹200 or ₹300)
   ├─ Shows all payment methods
   └─ User selects payment method
   ↓
5. User completes payment
   ├─ UPI: Enters VPA
   ├─ Card: Enters card details
   ├─ NetBanking: Selects bank
   └─ Wallet: Logs into wallet
   ↓
6. Razorpay processes payment
   ↓
7. Payment response sent to your app
   ↓
8. Backend verifies signature (SECURE)
   ↓
9. Payment stored in Firestore
   ↓
10. User status updated to "PAID"
    ↓
11. Success modal shown
    ↓
12. QR code generated
```

---

## 🎯 Features You Get with Real Razorpay

### ✅ Professional UI
- Razorpay's polished checkout interface
- Mobile-optimized design
- Smooth animations
- Brand customization

### ✅ Multiple Payment Methods
- UPI (most popular in India)
- Credit/Debit Cards
- NetBanking
- Wallets
- EMI options (if enabled)

### ✅ Security
- PCI DSS compliant
- 3D Secure for cards
- Encrypted transactions
- Fraud detection

### ✅ User Experience
- Auto-fill saved cards
- Remember payment methods
- Quick UPI payments
- Instant confirmations

### ✅ Developer Features
- Test mode for development
- Detailed transaction logs
- Webhook support
- Refund API
- Settlement reports

---

## 🔧 Customization Options

### 1. Change Brand Color

Edit `src/hooks/useRazorpayPayment.ts`:

```typescript
theme: {
    color: '#10b981'  // Change to your brand color
}
```

### 2. Add Logo

Update `.env.local`:

```bash
NEXT_PUBLIC_APP_LOGO=https://your-domain.com/logo.png
```

### 3. Change Description

Edit `src/hooks/useRazorpayPayment.ts`:

```typescript
description: 'Your custom description here'
```

### 4. Pre-fill User Details

Already implemented! User's name and email are auto-filled.

---

## 📊 Razorpay Dashboard Features

### Monitor Payments

1. **Go to:** https://dashboard.razorpay.com
2. **Payments** tab shows all transactions
3. **Filter by:**
   - Status (Success/Failed/Pending)
   - Date range
   - Amount
   - Payment method

### View Transaction Details

Click any payment to see:
- Payment ID
- Order ID
- Amount
- Payment method
- User details
- Timestamp
- UTR/Reference number

### Download Reports

- Export to Excel/CSV
- Settlement reports
- Tax invoices
- Custom date ranges

---

## 🔒 Security Best Practices

### ✅ Already Implemented

1. **Server-side verification** - Payment signature verified on backend
2. **Environment variables** - Secrets not exposed to frontend
3. **HTTPS only** - All communication encrypted
4. **Idempotent handling** - Duplicate payments prevented
5. **Firebase auth** - User authentication required

### 🔐 Additional Security (Optional)

1. **Webhooks** - Get real-time payment notifications
2. **IP Whitelisting** - Restrict API access
3. **Rate Limiting** - Prevent abuse
4. **Fraud Detection** - Razorpay's built-in system

---

## 🚀 Going Live (Production)

### When Ready for Real Payments

1. **Complete KYC** on Razorpay
   - Submit business documents
   - Bank account details
   - Wait for approval (1-2 days)

2. **Get Live API Keys**
   - Switch to Live Mode in dashboard
   - Generate live keys (start with `rzp_live_`)

3. **Update Environment**
   ```bash
   RAZORPAY_KEY_SECRET=rzp_live_YOUR_LIVE_SECRET
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   ```

4. **Test Thoroughly**
   - Test all payment methods
   - Verify webhooks work
   - Check settlement flow

5. **Deploy!** 🎉

---

## 🐛 Troubleshooting

### Issue: "Razorpay credentials not configured"

**Solution:**
1. Check `.env.local` has correct keys
2. Keys should start with `rzp_test_`
3. Restart dev server after adding keys

### Issue: Checkout modal doesn't open

**Solution:**
1. Check browser console for errors
2. Ensure internet connection is active
3. Verify Razorpay SDK loaded (check Network tab)

### Issue: Payment succeeds but not saved

**Solution:**
1. Check server console for errors
2. Verify Firebase credentials
3. Check Firestore security rules

### Issue: "Invalid signature" error

**Solution:**
1. Ensure `RAZORPAY_KEY_SECRET` is correct
2. Check it's the SECRET key, not KEY_ID
3. Restart server after updating

---

## 📞 Support & Resources

### Razorpay Documentation
- **Main Docs:** https://razorpay.com/docs
- **Checkout Docs:** https://razorpay.com/docs/payments/payment-gateway/web-integration/standard
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details
- **API Reference:** https://razorpay.com/docs/api

### Razorpay Dashboard
- **Login:** https://dashboard.razorpay.com
- **Support:** https://razorpay.com/support
- **Status:** https://status.razorpay.com

### Your Implementation
- **Full Guide:** `PAYMENT_INTEGRATION.md`
- **Quick Start:** `PAYMENT_QUICKSTART.md`
- **Mock Mode:** `MOCK_PAYMENT_GUIDE.md`

---

## ✅ Checklist

Before testing, make sure:

- [ ] Razorpay account created
- [ ] Test API keys generated
- [ ] Keys added to `.env.local`
- [ ] `NEXT_PUBLIC_MOCK_PAYMENT=false`
- [ ] Dev server restarted
- [ ] Logged into your app
- [ ] Ready to test!

---

## 🎉 You're All Set!

Your payment integration now uses:
- ✅ **Real Razorpay Checkout** - Professional UI
- ✅ **All Payment Methods** - UPI, Cards, NetBanking, Wallets
- ✅ **Secure Processing** - Industry-standard security
- ✅ **Test Mode** - Safe testing with test credentials
- ✅ **Production Ready** - Switch to live keys when ready

**Next Step:** Get your Razorpay test keys and start testing! 🚀

---

**Need Help?**

If you face any issues:
1. Check this guide first
2. Review Razorpay docs
3. Check browser/server console
4. Contact Razorpay support

**Happy Testing!** 💳✨
