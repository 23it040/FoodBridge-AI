# 📊 Data Tables, Status Badges & Loading Feedback

> **Location**: `frontend/src/components/ui/` & `frontend/src/components/ui/data/`

---

## 1. Data Table Component (`DataTable.jsx`)

Reusable table component used in Admin Users, Admin Donations, NGO Requests, and Audit Logs.

### Figma Component Layout:
```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search table...                      [ All Roles ▼ ]   [ All Statuses ▼ ]│
├─────────────────────────────────────────────────────────────────────────────┤
│ USER / ENTITY        │ ROLE       │ STATUS     │ DATE       │ ACTIONS       │
├──────────────────────┼────────────┼────────────┼────────────┼───────────────┤
│ John Doe             │ DONOR      │ ACTIVE     │ 12 Oct 26  │ [👁️]  [✏️]    │
│ john@example.com     │            │            │            │               │
├──────────────────────┼────────────┼────────────┼────────────┼───────────────┤
│ Helping Hands NGO    │ NGO        │ PENDING    │ 14 Oct 26  │ [✅]  [❌]    │
└──────────────────────┴────────────┴────────────┴────────────┴───────────────┘
│ Showing 1-10 of 48 entries                        [ ◄ Prev ]  [ Next ► ]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Header Row**: Height `48px`, Surface `bg-[#061918]`, Text `12px uppercase font-bold text-[#A7B8B3]`.
- **Data Rows**: Height `56px` - `64px`, Hover state `bg-white/5`.
- **Sorting Indicators**: Interactive arrows `▲ / ▼` next to column title.
- **Pagination Footer**: Page summary text left, Page numbers and Prev/Next right.

---

## 2. Status Badge / Pill Component (`Badge.jsx`)

Standardized status pills used across tables, food cards, and details pages.

### Design Tokens for Figma:

| Status Code | Background Hex | Text Hex | Border Hex | Example Usage |
| :--- | :--- | :--- | :--- | :--- |
| **`ACCEPTED` / `ACTIVE` / `VERIFIED`** | `#DCFCE7` | `#16A34A` | `#86EFAC` | Approved NGO, Accepted Pickup, Active User |
| **`PENDING` / `IN_REVIEW`** | `#FEF3C7` | `#D97706` | `#FDE047` | Awaiting Donor Response, Pending Verification |
| **`REJECTED` / `SUSPENDED` / `EXPIRED`**| `#FEE2E2` | `#DC2626` | `#FCA5A5` | Declined Pickup, Suspended User, Expired Food |
| **`COMPLETED` / `CLAIMED`** | `#E0E7FF` | `#4338CA` | `#A5B4FC` | Finalized Food Redistribution |
| **`DRAFT` / `INACTIVE`** | `#F3F4F6` | `#4B5563` | `#D1D5DB` | Draft listing |

---

## 3. Loading Feedback & Branded Loader (`BrandedLoader.jsx`, `Skeleton.jsx`, `Spinner.jsx`)

1. **Branded Full-Page Loader (`BrandedLoader.jsx`)**:
   - Dark background `#0A1A1A`.
   - Pulsing FoodBridge heart icon with green shadow glow.
   - Bouncing mint loading dots (`● ● ●`).
2. **Skeleton Placeholder (`Skeleton.jsx`, `Skeletons.jsx`)**:
   - Animated shimmer gray boxes (`bg-white/10 animate-pulse`).
   - Card Skeleton, Table Row Skeleton, Map Skeleton.
3. **Inline Button Spinner (`Spinner.jsx`)**:
   - `20px x 20px` SVG rotating ring in mint `#79D6B2`.

---

## 4. Empty & Error States (`EmptyState.jsx`, `ErrorState.jsx`)

- **Empty State**: Centered illustration / icon (`FiInbox`), Title *"No Donations Found"*, Subtitle, CTA Button *"Post Food Now"*.
- **Error State**: Centered warning icon (`FiAlertTriangle`), Error message text, `"Retry"` button.
