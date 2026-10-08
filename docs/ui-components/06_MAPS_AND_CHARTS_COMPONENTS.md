# 🗺️ Maps, Pin Markers & Recharts Analytics Components

> **Location**: `frontend/src/components/maps/` & `frontend/src/components/charts/`

---

## 1. Geographic Discovery Maps (`NGOMap.jsx`, `GoogleMap.jsx`)

Interactive mapping components for NGO food discovery and donor pickup location selection.

### Map Container Specs in Figma:
- **Aspect Ratio / Height**: `450px` (Card preview mode) or `Full Height 100vh` (Split screen discovery mode).
- **Map Theme**: Dark Mode or Custom Leaflet / OpenStreetMap tiles.
- **Controls**:
  - Zoom Controls (`+ / -` buttons top right).
  - Recenter / Current Location button (`FiNavigation`).
  - Radius Slider overlay (1 km - 25 km slider pill top-left).

---

## 2. Custom Map Pin Markers (`FoodDonationMarker.jsx`, `NGOMarker.jsx`, `PickupMarker.jsx`)

Pin variants rendered on the interactive map:

| Marker Type | Icon | Color Pin | Description |
| :--- | :--- | :--- | :--- |
| **Available Food Pin** | 🍲 Food Box | Green `#16A34A` Pin | Active food donation available for pickup |
| **Urgent Food Pin** | ⏳ Expiry Clock | Amber `#D97706` Pin | Donation nearing expiration |
| **NGO Organization Pin** | 🛡️ NGO Shield | Blue `#2563EB` Pin | Verified NGO operating location |
| **Pickup Route Line** | 📍 Destination Pin | Teal `#79D6B2` Dashed Path | Live route line connecting NGO to Donor |

### Map Pin Popover Card (`NGOInfoCard.jsx`):
- Clickable popup frame over pin marker.
- Image thumbnail, Title, Servings count, Expiration time, `"Request Food"` CTA button.

---

## 3. Analytics & Recharts Components (`BarChart.jsx`, `PieChart.jsx`, `LineChart.jsx`)

Visual data charts used in Admin Analytics and Reports pages.

### 1. Bar Chart (`BarChart.jsx`)
- **Use Case**: Monthly Surplus Food Donated vs. Claimed.
- **Bar Colors**:
  - Bar 1 (Donated): Mint `#79D6B2`.
  - Bar 2 (Claimed): Dark Emerald `#2F8F72`.
- **Axes**: Dark text `#A7B8B3`, gridlines `rgba(255,255,255,0.05)`.

### 2. Pie / Donut Chart (`PieChart.jsx`)
- **Use Case**: Food Category Breakdown (Cooked Meals, Bakery, Dairy, Grains, Packaged).
- **Color Palette**:
  - Slice 1 (Cooked): Mint `#79D6B2`
  - Slice 2 (Bakery): Amber `#FBBF24`
  - Slice 3 (Dairy): Blue `#60A5FA`
  - Slice 4 (Grains): Emerald `#34D399`
  - Slice 5 (Other): Purple `#A78BFA`

### 3. Line Chart (`LineChart.jsx`)
- **Use Case**: AI Match Accuracy Rate (%) & NGO Response Time over 12 months.
- **Line Style**: Curved spline (`type="monotone"`), stroke width `3px`, gradient fill underneath.
