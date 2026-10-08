# 🌐 Home Page Wireframe Specification (`/`)

> **File**: `frontend/src/pages/Home/HomePage.jsx`  
> **Layout Wrapper**: `MainLayout.jsx` (Navbar + Main Content + Footer)  
> **Visual Theme**: Dark Cinematic SaaS (`bg-[#0A1A1A]`, `text-white`, Mint `#79D6B2` accents)

---

## 📐 Page Frame Structure in Figma (Desktop 1440px)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🌿 Navbar (Logo | Home | Impact | Live Map | Contact | [Login] [Register])  │
├─────────────────────────────────────────────────────────────────────────────┤
│ HERO SECTION                                                                │
│ [ 🌿 FOOD REDISTRIBUTION PLATFORM ]                                         │
│ COME TOGETHER. YOU AND US WILL FEED THE NEEDY.                              │
│ "NO FOOD SHOULD GO TO WASTE."                                               │
│ [ Get Started → ]   [ ▷ Explore Food ]                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ METRIC STRIP (14.8k kg Food Saved | 42k Meals | 180 Verified NGOs)         │
├─────────────────────────────────────────────────────────────────────────────┤
│ HOW IT WORKS (1. Donor Posts ➔ 2. AI Matches ➔ 3. NGO Picks Up)             │
├─────────────────────────────────────────────────────────────────────────────┤
│ LIVE MAP DISCOVERY PREVIEW                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ AI SMART MATCHING & SPOILAGE RISK SHOWCASE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ IMPACT & TESTIMONIALS                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ FINAL CTA BANNER ("Join FoodBridge Today")                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Footer (Logo, Quick Links, Social Handles, Copyright)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Section Breakdown

1. **Hero Section (`HeroSection.jsx`)**:
   - Hero Background Image: `/images/foodbridge-hero.png` with dark gradient overlay (`rgba(10,26,26,0.92)`).
   - Glass Pill Badge: `"🌿 FOOD REDISTRIBUTION PLATFORM"` (Mint pulsing dot).
   - Headline: `"COME TOGETHER. YOU AND US WILL FEED THE NEEDY."` (Font size 60px, Bold).
   - Accent Tag: `"NO FOOD SHOULD GO TO WASTE."` (Red tint `#D94A4A`/25).
   - CTA Buttons:
     - `Get Started` (`glass-btn-primary`, solid mint shadow glow).
     - `Explore Food` (`glass-btn-secondary`, transparent outline).

2. **Metric Strip (`MetricStrip.jsx`)**:
   - 4-column counter cards with mint icons (`FiBox`, `FiHeart`, `FiShield`, `FiUsers`).

3. **How It Works Step-by-Step (`HowItWorks.jsx`)**:
   - 3 Process Step Cards connected by dashed arrows.

4. **Live Map & AI Smart Matching (`LiveMapSection.jsx`, `SmartMatchingSection.jsx`)**:
   - Interactive OpenStreetMap preview with custom pin icons.
   - AI Spoilage Risk Badge card demonstration.

5. **Final CTA Banner (`FinalCTA.jsx`)**:
   - Full-width dark glass banner with dual CTA for Donors and NGO Partners.
