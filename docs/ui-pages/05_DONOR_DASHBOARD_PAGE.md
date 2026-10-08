# 📦 Donor Dashboard Wireframe Specification (`/donor/dashboard`)

> **File**: `frontend/src/pages/Donor/Dashboard.jsx`  
> **Layout Wrapper**: `DashboardLayout.jsx` (`portalName="Donor Portal"`)

---

## 📐 Page Frame Layout in Figma (Desktop 1440px)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Welcome Back, GreenBites Restaurant!                        [ + Post Food ]│
├─────────────────────────────────────────────────────────────────────────────┤
│ METRICS GRID (4 STAT CARDS)                                                 │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐               │
│ │ TOTAL DONATED│ ACTIVE FOOD  │ PENDING REQ  │ MEALS SERVED │               │
│ │ 1,420 kg     │ 4 Listings   │ 2 Requests   │ 3,250 Meals  │               │
│ └──────────────┴──────────────┴──────────────┴──────────────┘               │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ AI SPOILAGE RISK ALERT WIDGET                                           │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🚨 1 Listing Nearing Expiration (2 hours remaining)                     │ │
│ │ Item: "20 Servings Fresh Pasta" • Expiry: 11:30 PM • Risk: HIGH        │ │
│ │ [ View Listing ]  [ Auto-Match Nearby NGO ]                             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ ACTIVE FOOD LISTINGS QUICK VIEW (4 Food Cards)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ INCOMING NGO PICKUP REQUESTS TABLE                                          │
│ Columns: NGO Name | Food Item | Beneficiaries | Pickup Time | Status | Action│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Section Specs

1. **Header Banner**: Welcome heading with quick CTA button `"Post Food Surplus"`.
2. **Stat Cards Grid**: 4 stat cards with icons (`FiHeart`, `FiBox`, `FiInbox`, `FiCheckCircle`).
3. **AI Spoilage Risk Alert Widget**: Red alert card banner highlighting high-risk expiring food with countdown timer.
4. **Recent NGO Requests Table**: Columns (`NGO Organization`, `Food Item`, `Beneficiaries Count`, `Requested Pickup Slot`, `Status Pill`, `Accept/Decline Buttons`).
