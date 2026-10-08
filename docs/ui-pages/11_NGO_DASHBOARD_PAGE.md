# 🤝 NGO Partner Dashboard Specification (`/ngo/dashboard`)

> **File**: `frontend/src/pages/NGO/Dashboard.jsx`  
> **Layout Wrapper**: `DashboardLayout.jsx` (`portalName="NGO Portal"`)

---

## 📐 Page Structure in Figma

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Welcome, Helping Hands NGO!                          [ 🟢 Verified NGO ]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ METRICS GRID (4 STAT CARDS)                                                 │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐               │
│ │ ACTIVE REQS  │ APPROVED PICK│ TOTAL CLAIMED│ PEOPLE SERVED│               │
│ │ 3 Requests   │ 2 Pending    │ 2,840 kg     │ 6,500 Meals  │               │
│ └──────────────┴──────────────┴──────────────┴──────────────┘               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🗺️ NEARBY FOOD RADAR QUICK MAP PREVIEW                                      │
│ Mini map showing 5 available surplus food listings within 5 km radius        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🤖 AI MATCHING RECOMMENDATIONS FOR YOUR NGO                                 │
│ Recommended food listings sorted by distance, expiry urgency, and capacity  │
└─────────────────────────────────────────────────────────────────────────────┘
```
