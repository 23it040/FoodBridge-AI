# 🛡️ Admin Control Center Dashboard Specification (`/admin/dashboard`)

> **File**: `frontend/src/pages/Admin/Dashboard.jsx`  
> **Layout Wrapper**: `DashboardLayout.jsx` (`portalName="Admin Portal"`)

---

## 📐 Dashboard Layout Frame in Figma (Desktop 1440px)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Admin Control Center                                     [ 🔄 Refresh Data ]│
├─────────────────────────────────────────────────────────────────────────────┤
│ METRICS GRID (5 STAT CARDS)                                                 │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┐ │
│ │ TOTAL USERS │ DONORS      │ PARTNER NGOS│ VERIFIED    │ PENDING VERIF.  │ │
│ │ 1,240       │ 450         │ 320         │ 280         │ 40 Pending ⚠️   │ │
│ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘ │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ DONATIONS & REQUESTS BAR CHART       │ CATEGORY DISTRIBUTION PIE CHART      │
│ (Monthly trend of posts vs claims)   │ (Cooked, Bakery, Dairy, Grains, etc) │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ RECENT DONATIONS TABLE               │ RECENT NGO REQUESTS TABLE            │
│ Columns: Food | Donor | Qty | Status │ Columns: NGO | Food | Benef. | Status│
└──────────────────────────────────────┴──────────────────────────────────────┘
```
