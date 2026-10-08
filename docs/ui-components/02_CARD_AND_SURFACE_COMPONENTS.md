# 🃏 Cards & Surface Components

> **Location**: `frontend/src/components/ui/` & `frontend/src/components/`

---

## 1. Base Card Component (`Card.jsx`)

The foundational surface container used across all dashboards and content lists.

### Figma Styles:
- **Background**: `#102A2A` (Dark Teal Glass Surface) or `rgba(16, 42, 42, 0.85)` with backdrop-filter blur `16px`.
- **Border**: `1px solid rgba(255, 255, 255, 0.1)` (`border-white/10`).
- **Corner Radius**: `24px` (`rounded-[24px]` for major auth cards) or `16px` (`rounded-2xl` for dashboard cards).
- **Shadow**: `0 20px 50px rgba(0, 0, 0, 0.5)` (Deep soft dark shadow).

---

## 2. KPI Metric Stat Card (`StatCard.jsx`)

Used in Admin, Donor, and NGO Dashboards to summarize high-level impact metrics.

### Frame Layout for Figma:
```text
┌─────────────────────────────────────────────────────────┐
│  TOTAL FOOD DONATED                              [ 🍲 ] │ ⬅ Icon Pill
│  14,850 kg                                              │ ⬅ 32px Bold Counter
│  ▲ +12% from last month                      [ Active ] │ ⬅ Trend Badge
└─────────────────────────────────────────────────────────┘
```
- **Label**: 12px uppercase font-extrabold text `#A7B8B3`.
- **Value**: 28px - 36px font-black text `#FFFFFF`.
- **Icon Container**: Top right `44px x 44px` rounded 12px box `bg-[#061918] text-[#79D6B2] border border-[#79D6B2]/30`.
- **Trend Badge**: `+X%` in green `#DCFCE7` text `#16A34A` or `-Y%` in red `#FEE2E2` text `#DC2626`.

---

## 3. AI Food Spoilage Risk Alert Card (`AIFoodSpoilageRiskCard.jsx`)

Specialized AI alert card highlighting food listings near expiration.

### Visual States in Figma:
- **High Risk**: Red border highlight (`border-red-500/40 bg-red-950/20`), text `#FF6B6B`.
- **Medium Risk**: Amber border highlight (`border-amber-500/40 bg-amber-950/20`), text `#FBBF24`.
- **Low Risk**: Green border highlight (`border-emerald-500/40 bg-emerald-950/20`), text `#79D6B2`.
- **Elements**:
  - Expiry countdown timer (HH:MM:SS format).
  - AI Recommended pickup deadline.
  - Quick CTA button: *"Urgent Request Pickup"*.

---

## 4. NGO Recommendation & Nearby Cards (`NGORecommendationCard.jsx`, `NearbyNGOCard.jsx`)

Used by Donors and NGOs to view distance, match score, and organization details.

### Elements:
- **Match Score Badge**: `94% AI Match` pill (Mint border, dark green background).
- **Distance Pill**: `1.2 km away`.
- **Beneficiary Capacity**: `Serves ~250 people / day`.
- **Action Triggers**: `View NGO Profile`, `Accept Request`.
