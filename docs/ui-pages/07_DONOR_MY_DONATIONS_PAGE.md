# 📦 My Food Donations List Specification (`/donor/my-donations`)

> **File**: `frontend/src/pages/Donor/MyDonations.jsx`

---

## 📐 Page Structure in Figma

- **Search & Filter Bar**:
  - Search input by food title.
  - Filter Tabs: `ALL`, `AVAILABLE`, `CLAIMED`, `COMPLETED`, `EXPIRED`.
- **Food Cards Grid (3 Columns Desktop, 1 Column Mobile)**:
  - **Image Thumbnail**: Aspect ratio 16:9 with category badge overlay top-left.
  - **Status Pill**: Top right (`AVAILABLE` [Green], `CLAIMED` [Indigo], `EXPIRED` [Red]).
  - **Title**: 16px font-bold text `#FFFFFF`.
  - **Quantity & Beneficiaries**: e.g. `15 kg • Serves 50 people`.
  - **Expiry Countdown Clock**: `Expires in 3 hours 15 mins`.
  - **Card Action Bar**:
    - `View Details & Requests` (Primary button).
    - `Delete / Cancel` (Outline Red button).
