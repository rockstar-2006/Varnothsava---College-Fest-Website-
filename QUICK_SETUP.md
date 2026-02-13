# 🚀 Quick Setup - Choose Your Option

You have **2 options** to test the payment system:

---

## Option 1: Mock Mode (No Razorpay Account Needed) ⚡

**Best for:** Quick testing without signing up

### Steps:

1. **Open** `d:\web\.env.local`

2. **Change this line:**
   ```bash
   NEXT_PUBLIC_MOCK_PAYMENT=false
   ```
   
   **To:**
   ```bash
   NEXT_PUBLIC_MOCK_PAYMENT=true
   ```

3. **Restart server:**
   ```bash
   # Stop (Ctrl+C) and restart
   npm run dev
   ```

4. **Test now!**
   - Go to: http://localhost:3000/notify
   - Click "PAY NOW"
   - See mock payment modal
   - Click "Pay ₹200"
   - Done! ✅

**What you get:**
- ✅ Visual payment modal
- ✅ Full payment flow
- ✅ Database storage
- ✅ QR code generation
- ⚠️ Not real Razorpay UI

---

## Option 2: Real Razorpay (Official UI) 🎯

**Best for:** Testing with actual Razorpay checkout

### Steps:

1. **Sign up for Razorpay:**
   - Go to: https://dashboard.razorpay.com/signup
   - Create free account
   - Verify email

2. **Get Test Keys:**
   - Login to dashboard
   - Go to: Settings → API Keys
   - Switch to **Test Mode** (toggle at top)
   - Click "Generate Test Keys"
   - Copy both keys

3. **Add to `.env.local`:**
   
   Open `d:\web\.env.local` and replace:
   
   ```bash
   RAZORPAY_KEY_SECRET=rzp_test_xxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxx
   ```
   
   With your actual keys:
   
   ```bash
   RAZORPAY_KEY_SECRET=rzp_test_YOUR_SECRET_KEY
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
   ```

4. **Make sure mock mode is OFF:**
   ```bash
   NEXT_PUBLIC_MOCK_PAYMENT=false
   ```

5. **Restart server:**
   ```bash
   # Stop (Ctrl+C) and restart
   npm run dev
   ```

6. **Test with Razorpay's UI!**
   - Go to: http://localhost:3000/notify
   - Click "PAY NOW"
   - **Razorpay's official checkout opens!** 🎉
   - Test with: `success@razorpay` (UPI) or `4111 1111 1111 1111` (Card)

**What you get:**
- ✅ Razorpay's official UI
- ✅ All payment methods (UPI/Card/NetBanking/Wallet)
- ✅ Professional checkout experience
- ✅ Production-ready integration

---

## 🧪 Test Credentials (Option 2 - Real Razorpay)

### UPI (Easiest)
```
UPI ID: success@razorpay
```

### Card
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Name: Any name
```

### Other Test Cards
- `5555 5555 5555 4444` - Mastercard
- `6073 7490 0000 0000` - RuPay

---

## ❓ Which Option Should I Choose?

### Choose **Option 1 (Mock)** if:
- ✅ You want to test immediately
- ✅ You don't want to sign up for Razorpay yet
- ✅ You just want to see the flow

### Choose **Option 2 (Real Razorpay)** if:
- ✅ You want the actual Razorpay UI
- ✅ You want to test all payment methods
- ✅ You're preparing for production
- ✅ You want the exact experience users will get

---

## 🔄 Current Status

**Your current settings:**
```bash
NEXT_PUBLIC_MOCK_PAYMENT=false
RAZORPAY_KEY_SECRET=rzp_test_xxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxx
```

**This means:**
- ❌ Mock mode: OFF
- ❌ Real keys: NOT ADDED
- ⚠️ **You need to either:**
  - Add real Razorpay test keys, OR
  - Enable mock mode

---

## 🐛 Troubleshooting

### Error: "Razorpay credentials not configured"

**Solution:** You have 2 options:

**Option A:** Enable mock mode
```bash
NEXT_PUBLIC_MOCK_PAYMENT=true
```

**Option B:** Add real Razorpay test keys
```bash
RAZORPAY_KEY_SECRET=rzp_test_YOUR_ACTUAL_KEY
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY
```

Then restart server!

---

## 📞 Need Help?

- **Mock Mode Guide:** `MOCK_PAYMENT_GUIDE.md`
- **Real Razorpay Setup:** `RAZORPAY_SETUP.md`
- **Official Verification:** `RAZORPAY_OFFICIAL_VERIFICATION.md`

---

## ⚡ Recommended: Start with Mock Mode

If you're unsure, start with **Option 1 (Mock Mode)**:

1. Set `NEXT_PUBLIC_MOCK_PAYMENT=true`
2. Restart server
3. Test the flow
4. When ready, switch to real Razorpay

---

**Choose your option and start testing!** 🚀
