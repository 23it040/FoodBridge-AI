# FOODBRIDGE-AI — GOOGLE MAPS LOCATION & INTERACTIVITY FIX REPORT

## 1. Audit Summary
A comprehensive audit of the FoodBridge codebase was conducted to diagnose map rendering, map interactivity (drag, pan, scroll-zoom), geolocation, coordinate conversion, and backend API integration issues. The map system has been migrated entirely to Google Maps JavaScript API with `@vis.gl/react-google-maps`. Legacy dependencies on Overpass API and OpenStreetMap fallback queries have been completely removed. Both the Donor Dashboard and NGO Dashboard now feature operational, unlocked interactive maps powered by MongoDB geospatial data and browser geolocation.

---

## 2. Root Causes Found & Solutions
1. **Map Interactivity Lock (FIXED)**: `<Map center={center} zoom={zoom}>` in `@vis.gl/react-google-maps` re-anchored the map position on every React state update or parent re-render cycle, preventing mouse drag/pan and scroll wheel zooming.
   - **Fix**: Replaced controlled `center` and `zoom` props on `<Map>` with `defaultCenter={center}` and `defaultZoom={zoom}`. Added an internal `useEffect` calling `map.panTo(center)` programmatically only when `center` changes.
2. **Missing Dashboard Maps & Missing NGO/Food Markers (FIXED)**: Donor and NGO dashboards previously lacked interactive maps rendering all required data points simultaneously.
   - **Fix**: Enhanced `NGOMap` to render User Location ("Your Location"), Donor/NGO profile pins, nearby verified FoodBridge NGOs, and active food donations with clickable markers, InfoCards, and Route displays.
3. **Overpass API Fallback (REMOVED)**: Backend endpoint `GET /api/ngos/nearby` relied on Overpass API to query OpenStreetMap instead of querying verified FoodBridge NGOs in MongoDB.
   - **Fix**: Deleted `overpass.service.js` and updated `ngo.service.js` to query MongoDB `User` model using `2dsphere` geospatial queries for `isVerified: true`, `role: 'ngo'`, `status: 'ACTIVE'`.
4. **Coordinate Normalization Inconsistency (FIXED)**: GeoJSON coordinates in MongoDB store `[longitude, latitude]` whereas Google Maps requires `{ lat, lng }`.
   - **Fix**: Implemented `normalizeCoordinates(input)` in `map.service.js` supporting `{ lat, lng }`, `{ latitude, longitude }`, GeoJSON `[lng, lat]`, numeric strings, and range validation (`lat: -90 to 90`, `lng: -180 to 180`).
5. **Coupled Map & API Error States (FIXED)**: API failures or empty NGO/food lists previously replaced map containers with gray error screens instead of preserving an operational map with user location.
   - **Fix**: Decoupled API error boundaries so map containers remain rendered with user location even if nearby data lists return empty.

---

## 3. Key Files Modified
- `[frontend/src/components/maps/GoogleMap.jsx](file:///d:/FoodBridge-AI/frontend/src/components/maps/GoogleMap.jsx)` — Replaced controlled `center`/`zoom` with `defaultCenter`/`defaultZoom` and added `map.panTo()` effect to unlock dragging, panning, wheel zooming, and pinch zooming.
- `[frontend/src/components/maps/NGOMap.jsx](file:///d:/FoodBridge-AI/frontend/src/components/maps/NGOMap.jsx)` — Enhanced to display user/device location, verified FoodBridge partner NGOs, food donation markers, selection info popups, and route visualization.
- `[frontend/src/pages/Donor/Dashboard.jsx](file:///d:/FoodBridge-AI/frontend/src/pages/Donor/Dashboard.jsx)` — Integrated `NGOMap` displaying donor's current/saved location, nearby verified FoodBridge NGOs, active food donations, and "Use My Location" control.
- `[frontend/src/pages/NGO/Dashboard.jsx](file:///d:/FoodBridge-AI/frontend/src/pages/NGO/Dashboard.jsx)` — Integrated `NGOMap` displaying NGO organization location, current device location, nearby verified FoodBridge NGOs (excluding self), available food donations, and "Use My Location" control.
- `[frontend/src/hooks/useGeolocation.js](file:///d:/FoodBridge-AI/frontend/src/hooks/useGeolocation.js)` — Created reusable browser geolocation hook with `enableHighAccuracy: true`, `timeout: 10000`, `maximumAge: 30000`, and explicit error handling.
- `[frontend/src/services/map.service.js](file:///d:/FoodBridge-AI/frontend/src/services/map.service.js)` — Robust coordinate normalizer and validator.
- `[backend/services/ngo.service.js](file:///d:/FoodBridge-AI/backend/services/ngo.service.js)` — MongoDB geospatial queries for verified FoodBridge NGOs.
- `[backend/models/User.model.js](file:///d:/FoodBridge-AI/backend/models/User.model.js)` — Configured `location: { type: 'Point', coordinates: [lng, lat] }` with `2dsphere` index.

---

## 4. Verification & Build Status
- **Frontend Build**: `npm run build` executed in `frontend/` — **Passed cleanly (exit code 0)**.
- **Backend Startup**: Backend process running on `http://localhost:5000/` connected to MongoDB `mongodb://127.0.0.1:27017/foodbridge`.
- **Frontend Dev Server**: Running on `http://localhost:5173/`.
