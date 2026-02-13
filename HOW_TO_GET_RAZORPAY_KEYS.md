# 🔑 How to Get Razorpay Test Keys - Step by Step

## 📋 Complete Guide (5 Minutes)

---

## Step 1: Create Razorpay Account

### 1.1 Go to Razorpay Signup Page

**URL:** https://dashboard.razorpay.com/signup

### 1.2 Fill the Form

- **Email:** Your email address
- **Password:** Create a strong password
- **Mobile:** Your phone number
- **Company Name:** Any name (e.g., "Varnothsava" or "Test Company")

### 1.3 Click "Sign Up"

### 1.4 Verify Email

- Check your email inbox
- Click the verification link
- Email will be verified

---

## Step 2: Login to Dashboard

### 2.1 Go to Login Page

**URL:** https://dashboard.razorpay.com/signin

### 2.2 Enter Credentials

- Email
- Password

### 2.3 Click "Sign In"

You'll see the Razorpay Dashboard

---

## Step 3: Switch to Test Mode

### 3.1 Look at Top-Right Corner

You'll see a toggle switch that says:
- **"Live Mode"** or **"Test Mode"**

### 3.2 Click the Toggle

Make sure it shows **"Test Mode"** (usually blue/green color)

**IMPORTANT:** Always use Test Mode for development!

---

## Step 4: Generate API Keys

### 4.1 Open Settings

- Look at the **left sidebar**
- Click on **"Settings"** (gear icon ⚙️)

### 4.2 Go to API Keys

- In Settings menu, click **"API Keys"**
- Or directly go to: https://dashboard.razorpay.com/app/website-app-settings/api-keys

### 4.3 Generate Test Keys

You'll see a section that says **"Test Mode"** or **"Test Keys"**

**If keys are already generated:**
- You'll see them listed
- Click **"Regenerate Test Key"** if needed

**If no keys exist:**
- Click **"Generate Test Keys"** button

### 4.4 Copy the Keys

You'll see TWO keys:

**1. Key ID** (Public Key)
```
Format: rzp_test_XXXXXXXXXXXX
Example: rzp_test_1DP5mmOlF5G5ag
```

**2. Key Secret** (Private Key)
```
Format: rzp_test_YYYYYYYYYYYY
Example: rzp_test_ThisisSecretKey123
```

**⚠️ IMPORTANT:** 
- Copy **BOTH** keys
- Keep them safe
- Never share Key Secret publicly

---

## Step 5: Add Keys to Your Project

### 5.1 Open `.env.local`

File location: `d:\web\.env.local`

### 5.2 Find These Lines

```bash
RAZORPAY_KEY_SECRET=rzp_test_xxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxxx
```

### 5.3 Replace with Your Keys

```bash
# Replace with your ACTUAL keys from Razorpay dashboard
RAZORPAY_KEY_SECRET=rzp_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
```

**Example:**
```bash
RAZORPAY_KEY_SECRET=rzp_test_ThisisSecretKey123
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
```

### 5.4 Make Sure Mock Mode is OFF

```bash
NEXT_PUBLIC_MOCK_PAYMENT=false
```

### 5.5 Save the File

Press `Ctrl+S` to save `.env.local`

---

## Step 6: Restart Server

### 6.1 Stop Current Server

In terminal, press `Ctrl+C`

### 6.2 Start Again

```bash
npm run dev
```

### 6.3 Wait for Server to Start

You'll see:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

## Step 7: Test Payment!

### 7.1 Open Your App

Go to: http://localhost:3000/notify

### 7.2 Login

Use any test account

### 7.3 Click "PAY NOW"

**Razorpay's official checkout will open!** 🎉

### 7.4 Test Payment

Use these test credentials:

**UPI (Easiest):**
```
UPI ID: success@razorpay
```

**Card:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Name: Any name
```

### 7.5 Complete Payment

- Select payment method
- Enter test credentials
- Click Pay
- ✅ Payment successful!

---

## 🎯 Visual Guide

### Dashboard Navigation:

```
Razorpay Dashboard
├── Top Right: [Test Mode] ← Make sure this is ON
├── Left Sidebar
│   └── Settings ⚙️
│       └── API Keys
│           ├── Test Mode Section
│           │   ├── Key ID: rzp_test_XXXX (Copy this)
│           │   └── Key Secret: rzp_test_YYYY (Copy this)
│           └── [Generate Test Keys] button
```

---

## 📸 What You'll See

### 1. Settings Page
```
┌─────────────────────────────────────┐
│  Settings                           │
│                                     │
│  → Account & Settings               │
│  → API Keys          ← Click here  │
│  → Webhooks                         │
│  → Payment Methods                  │
└─────────────────────────────────────┘
```

### 2. API Keys Page
```
┌─────────────────────────────────────┐
│  API Keys                           │
│                                     │
│  Test Mode                          │
│  ┌─────────────────────────────┐   │
│  │ Key ID                      │   │
│  │ rzp_test_1DP5mmOlF5G5ag    │   │
│  │ [Copy] [Regenerate]         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Key Secret                  │   │
│  │ rzp_test_************       │   │
│  │ [Show] [Copy]               │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## ⚠️ Common Issues

### Issue 1: Can't Find API Keys Section

**Solution:**
1. Make sure you're logged in
2. Look for Settings (⚙️ icon) in left sidebar
3. Click "API Keys" under Settings
4. If not visible, go directly to: https://dashboard.razorpay.com/app/website-app-settings/api-keys

### Issue 2: Keys Not Showing

**Solution:**
1. Make sure you're in **Test Mode** (toggle at top-right)
2. Click "Generate Test Keys" button
3. Keys will appear

### Issue 3: Still Getting Error After Adding Keys

**Solution:**
1. Double-check keys are copied correctly (no extra spaces)
2. Make sure `NEXT_PUBLIC_MOCK_PAYMENT=false`
3. **Restart server** (very important!)
4. Clear browser cache

---

## ✅ Verification Checklist

Before testing, make sure:

- [ ] Razorpay account created
- [ ] Email verified
- [ ] Logged into dashboard
- [ ] Switched to **Test Mode**
- [ ] Generated test keys
- [ ] Copied **both** Key ID and Key Secret
- [ ] Added keys to `.env.local`
- [ ] `NEXT_PUBLIC_MOCK_PAYMENT=false`
- [ ] Saved `.env.local`
- [ ] Restarted server
- [ ] Logged into your app

---

## 🎉 Success!

If everything is correct, when you click "PAY NOW":

1. ✅ Razorpay's checkout modal opens
2. ✅ Shows your app name "Varnothsava 2K26"
3. ✅ Shows amount (₹200 or ₹300)
4. ✅ Shows all payment methods (UPI, Cards, etc.)
5. ✅ You can test payment with test credentials

---

## 🔗 Quick Links

- **Signup:** https://dashboard.razorpay.com/signup
- **Login:** https://dashboard.razorpay.com/signin
- **API Keys:** https://dashboard.razorpay.com/app/website-app-settings/api-keys
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-card-details/
- **Support:** https://razorpay.com/support/

---

## 📞 Need Help?

If you're stuck:

1. **Check** that you're in Test Mode (not Live Mode)
2. **Verify** keys are copied correctly
3. **Restart** server after adding keys
4. **Check** browser console for errors
5. **Contact** Razorpay support if needed

---

## 🚀 Alternative: Use Mock Mode

If you don't want to sign up for Razorpay right now:

1. Open `.env.local`
2. Set: `NEXT_PUBLIC_MOCK_PAYMENT=true`
3. Restart server
4. Test with mock payment flow

You can switch to real Razorpay later!

---

**Follow these steps and you'll have Razorpay working in 5 minutes!** 🎯
