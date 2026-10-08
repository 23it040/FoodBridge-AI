# 🗺️ NGO Geographic Discovery & Map Page Specification (`/ngo/nearby`)

> **File**: `frontend/src/pages/NGO/NearbyFood.jsx`

---

## 📐 Split-Screen Layout Frame in Figma (Desktop 1440px)

```text
┌──────────────────────────────────────┬──────────────────────────────────────┐
│ LEFT SIDE: FEED & FILTERS            │ RIGHT SIDE: INTERACTIVE MAP VIEW     │
│ • Distance Slider: [ 10 km  ────O── ]│ • Full Height OpenStreetMap / Google │
│ • Category Pills: [Cooked] [Bakery]  │   Map Container                      │
│ • Search bar input                   │ • Custom Map Pin Markers:            │
│                                      │   - 🟢 Green Pin: Available Food     │
│ ┌──────────────────────────────────┐ │   - 🟡 Amber Pin: High Expiry Urgency│
│ │ 🍲 50 Packs Vegetable Curry      │ │ • Map Controls & Recenter Button     │
│ │ GreenBites Restaurant (1.2 km)   │ │ • Clickable Pin Info Window Popovers │
│ │ Expiry: 3h remaining • 50 meals  │ │                                      │
│ │ [ Request Pickup ]               │ │                                      │
│ └──────────────────────────────────┘ │                                      │
└──────────────────────────────────────┴──────────────────────────────────────┘
```
