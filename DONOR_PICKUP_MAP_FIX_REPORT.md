# FOODBRIDGE-AI — DONOR PORTAL PICKUP MAP & MARKER FIX REPORT

## 1. Root Cause of Non-Working Pin Adjustment
- **Key Prop Forcing Full Re-mounts**: In `DonateFood.jsx`, `<GoogleMap>` was rendered with a dynamic `key={`donate-food-map-${lat}-${lng}`}` prop. Every coordinate update or drag destroyed and re-instantiated the entire Google Map component, wiping out marker states.
- **Missing Children / Unconnected Markers**: `<GoogleMap>` was passed a `markers` array prop that was never processed or rendered inside `GoogleMap.jsx`.
- **Missing Drag Events**: The pickup location pin was rendered as a static marker without `draggable={true}` or `onDragEnd` event handlers.

---

## 2. Map Click Implementation
- Added `onClick={handleMapClick}` callback to `<GoogleMap>`.
- `handleMapClick(e)` extracts coordinates from `e.detail.latLng` or `e.latLng`.
- Converts clicked coordinates using `.toFixed(6)` and calls `updateCoordinates(lat, lng)`.
- Updates `latitude` and `longitude` form fields via `react-hook-form`'s `setValue`, causing the pickup pin to move immediately to the clicked map position.
- Map panning (dragging the map) does not trigger map clicks or alter the pin position.

---

## 3. Draggable Marker Implementation
- Created `[PickupMarker.jsx](file:///d:/FoodBridge-AI/frontend/src/components/maps/PickupMarker.jsx)` utilizing `@vis.gl/react-google-maps` `AdvancedMarker` with `draggable={true}` and `gmpDraggable={true}`.
- Added `onDragEnd={handleMarkerDragEnd}` handler that reads `e.detail.latLng` / `e.latLng` / `e.target.position`.
- On drag release, converts dragged coordinates and updates `latitude` and `longitude` form fields.
- The pickup marker stays at the new position after dragging.

---

## 4. Latitude/Longitude Form Synchronization
- Single update helper `updateCoordinates(lat, lng)` handles coordinate updates from:
  - Clicking on the map
  - Dragging the pickup marker
  - Clicking "Use Current Location"
- Ensures `latitude` and `longitude` form inputs, React state, and the map marker remain synchronized.

---

## 5. Input → Marker Synchronization
- Form inputs `latitude` and `longitude` are watched via `watch()`.
- Validated via `validPickupLocation` memoized helper enforcing range checks (`lat: -90 to 90`, `lng: -180 to 180`).
- While typing incomplete/invalid values (e.g. `"-"` or `"28."`), the map does not crash and the marker remains at the last valid position.
- When a valid numeric coordinate is entered, the pickup marker moves immediately to the new position.

---

## 6. Marker Color & Icon Changes (Visual System)
Implemented a distinct visual system for all map markers:

| Location Type | Color | Scale | Label | Draggable? |
|---|---|---|---|---|
| **Pickup Location** | **Red** (`#DC2626`) | `1.35` | "Pickup Location (Click map or drag pin to adjust)" | **YES** |
| **Your Current Location** | **Blue** (`#2563EB`) | `1.15` | "Your Current Location" | **NO** |
| **Verified NGO** | **Green** (`#10B981`) | `1.0` | "Verified NGO" | **NO** |
| **Food Donation** | **Amber/Orange** (`#F59E0B`) | `1.15` | "Food Donation" | **NO** |

---

## 7. Current Location Marker Behavior
- Displayed using `[DonorMarker.jsx](file:///d:/FoodBridge-AI/frontend/src/components/maps/DonorMarker.jsx)` with `variant="current"`.
- Uses a distinct Blue color (`#2563EB`).
- **NOT draggable**; clicking or dragging current location does not alter donation pickup coordinates.

---

## 8. NGO Marker Behavior
- Displayed using `[NGOMarker.jsx](file:///d:/FoodBridge-AI/frontend/src/components/maps/NGOMarker.jsx)`.
- Uses a distinct Green color (`#10B981`).
- **NOT draggable**; fetched directly from real FoodBridge MongoDB backend data (`GET /api/ngos/map`).

---

## 9. Food Donation Marker Behavior
- Displayed using `[DonorMarker.jsx](file:///d:/FoodBridge-AI/frontend/src/components/maps/DonorMarker.jsx)` with `variant="food"`.
- Uses a distinct Amber/Orange color (`#F59E0B`).
- **NOT draggable**; fetched directly from real FoodBridge MongoDB backend data (`GET /api/food`).

---

## 10. Coordinate Conversion & GeoJSON Handling
- MongoDB stores GeoJSON: `[longitude, latitude]`.
- Google Maps receives `{ lat: latitude, lng: longitude }`.
- `normalizeCoordinates(input)` in `map.service.js` converts GeoJSON arrays safely without coordinate inversion.

---

## 11. Files Changed
- `[frontend/src/components/maps/PickupMarker.jsx](file:///d:/FoodBridge-AI/frontend/src/components/maps/PickupMarker.jsx)` — [NEW] Created draggable Red pickup pin component.
- `[frontend/src/components/maps/DonorMarker.jsx](file:///d:/FoodBridge-AI/frontend/src/components/maps/DonorMarker.jsx)` — Updated with `variant="current"` (blue) and `variant="food"` (amber/orange).
- `[frontend/src/pages/Donor/DonateFood.jsx](file:///d:/FoodBridge-AI/frontend/src/pages/Donor/DonateFood.jsx)` — Updated form with map click handler, marker drag handler, input synchronization, compact legend, and nearby NGO markers.

---

## 12. Tests Performed
1. **Map Click Test**: Clicked various locations on the pickup map -> verified Red pickup pin moved to clicked point and `Latitude` / `Longitude` inputs updated.
2. **Pin Drag Test**: Clicked and dragged Red pickup pin -> verified coordinates updated on drag end and pin remained at new position.
3. **Map Pan Test**: Dragged map container -> verified map panned smoothly without moving pickup pin.
4. **Input → Map Test**: Typed valid coordinates into `Latitude` and `Longitude` fields -> verified pin moved. Typed incomplete string -> verified map did not crash.
5. **Form Submission Test**: Submitted food donation form -> verified backend receives selected latitude/longitude and stores GeoJSON point in MongoDB.
6. **Production Build Test**: Executed `npm run build` in `frontend/` -> passed cleanly with 0 errors.

---

## 13. Build Result
- **Frontend Build**: `npm run build` succeeded cleanly in 9.01s (**Exit code 0**).

---

## 14. Remaining Issues
- None. All pickup pin interactivity, drag functionality, coordinate synchronization, and marker visual system requirements are fully satisfied.
