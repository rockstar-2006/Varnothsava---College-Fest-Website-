

# 🎉 Varnothsava — College Fest Website

**Varnothsava** is the official web platform for the annual **state-level techno-cultural fest** of  
**Shri Madhwa Vadiraja Institute of Technology & Management (SMVITM), Bantakal, Udupi**.

This project showcases the spirit of innovation, culture, and youthful creativity through a modern, immersive, and highly interactive web experience.

---

## 🌐 Live Preview

🔗 Live URL: *(Add deployment link here — Vercel / Netlify)*  
[ https://varnothsava.sode-edu.in](https://varnothsava.sode-edu.in/)

---

## ✨ Key Highlights

-  Cultural, Technical & Gaming events in one platform
-  High-performance animations & smooth scrolling
-  Advanced event filtering & search
-  Firebase-powered authentication
-  Event registration with team management
-  Fully responsive (mobile-first)
-  Premium UI with dynamic backgrounds
-  Leaderboards & profiles
-  Dark, cinematic design language

---

## 🧰 Tech Stack

| Layer | Technology |
|------|------------|
| Framework | **Next.js 16 (App Router)** |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| Animations | **Framer Motion, GSAP** |
| Auth | **Firebase Authentication** |
| Database | **Firebase Firestore** |
| Images | **Next/Image Optimization** |
| Hosting | **Vercel / Static Hosting** |

---

## 📁 Detailed File Structure

```

Varnothsava---College-Fest-Website-
│
├── public/                          # Static assets
│   ├── img/                         # Images used across pages
│   ├── cultural-bg-new.png
│   └── favicon.ico
│
├── scripts/                         # Utility scripts
│   └── optimize-images.js
│
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── page.tsx                 # Home page
│   │   ├── events/
│   │   │   ├── page.tsx             # Events listing
│   │   │   └── [id]/page.tsx        # Event details page
│   │   ├── profile/page.tsx         # User profile
│   │   ├── leaderboard/page.tsx     # Leaderboard
│   │   ├── checkout/page.tsx        # Registration checkout
│   │   ├── not-found.tsx            # Custom 404 page
│   │   ├── template.tsx             # Route transition wrapper
│   │   └── globals.css              # Global styles
│   │
│   ├── components/
│   │   ├── layout/                  # Layout-level components
│   │   │   ├── InnovativeNavbar.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   └── ClientLayoutOverlays.tsx
│   │   │
│   │   ├── sections/                # Page sections
│   │   │   ├── EventGrid.tsx
│   │   │   └── CosmicJoystickGallery.tsx
│   │   │
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── MissionCard.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── RegistrationModal.tsx
│   │   │   ├── ProEventBackground.tsx
│   │   │   ├── DynamicEventBackground.tsx
│   │   │   ├── SmoothScroll.tsx
│   │   │   └── DomeGallery.tsx
│   │
│   ├── context/                     # Global state management
│   │   └── AppContext.tsx
│   │
│   ├── data/                        # Static & structured data
│   │   ├── missions.ts              # Event definitions
│   │   └── leaderboardImages.ts
│   │
│   ├── lib/                         # External integrations
│   │   └── firebaseClient.tsx       # Firebase config & helpers
│   │
│   ├── styles/                      # Custom CSS
│   │   └── event-card.css
│
├── .env.local                       # Environment variables (ignored)
├── next.config.ts                   # Next.js configuration
├── package.json                     # Dependencies & scripts
├── package-lock.json
├── proxy.ts                         # Middleware / proxy logic
└── README.md                        # Project documentation

````

---

## ⚙️ Environment Setup

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
````

⚠️ **Never commit `.env.local` to GitHub**

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Open 👉 [http://localhost:3000](http://localhost:3000)

---

## 🔐 Firebase Requirements

Enable the following in Firebase Console:

* Email & Google Authentication
* Firestore Database
* (Optional) Firebase Storage

---

## 🧠 Design Philosophy

* **Cinematic UI** over plain layouts
* **Performance-first animations**
* **State-level fest credibility**
* **Mobile-first experience**
* **Scalable architecture**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit changes
4. Push & open a Pull Request

---

## ❤️ Credits

This project was designed and developed with dedication by:

- **Bhushan Poojari**
- **Tejas Nayak**
- **Shivam Shetty**
- **Abhishek Kini**

Students of **Shri Madhwa Vadiraja Institute of Technology & Management (SMVITM)**  
Built with passion for Varnothsava.




Just say the word 🚀
```
