# FOODBRIDGE-AI — GOOGLE MAP MOUSE & POINTER INTERACTION FIX REPORT

## 1. Root Cause of Closed/Stuck Hand Cursor
- **Google Maps JS API Internal Styling Conflict**: Vector maps (`mapId="DEMO_MAP_ID"`) and canvas elements inside `.gm-style` dynamically set inline `cursor: grabbing` during drag events, but in several WebKit/Blink render loops or when `@vis.gl/react-google-maps` re-renders, the internal canvas element failed to restore `cursor: grab` after pointer release.
- **Unmanaged Container Pointer State**: Map containers lacked scoped CSS cursor declarations and pointer drag state synchronization (`isDragging`), causing the browser to retain the `grabbing` cursor state even when the map was idle.

---

## 2. Invisible Overlay Findings
- Inspected all map wrapper components (`GoogleMap.jsx`, `NGOMap.jsx`, `MapControls.jsx`, `RouteDisplay.jsx`, `MapLoading.jsx`, `MapError.jsx`).
- Verified that no transparent full-screen `div` or overlay sitting over the map container was capturing mouse events or trapping pointer states.
- Decorative effects (`glass-panel`, background gradients) have explicit `pointer-events-none` so they do not obstruct map pointer interactions.

---

## 3. Pointer-Events Findings
- Ensured `.foodbridge-map-container` and underlying Google Maps canvas have active `pointer-events: auto`.
- Map controls (`MapControls.jsx` buttons for zoom, reset bounds, fullscreen) and popups (`NGOInfoCard.jsx`, `InfoWindow`) are properly layered with `z-index` and receive direct pointer events without blocking map panning.

---

## 4. CSS Findings & Cursor Scoping
Added scoped cursor rules to `[styles/index.css](file:///d:/FoodBridge-AI/frontend/src/styles/index.css)`:
```css
.foodbridge-map-container {
  cursor: grab !important;
}

.foodbridge-map-container:active,
.foodbridge-map-container.is-dragging {
  cursor: grabbing !important;
}

.foodbridge-map-container .gm-style,
.foodbridge-map-container .gm-style canvas,
.foodbridge-map-container .gm-style > div {
  cursor: grab !important;
}

.foodbridge-map-container:active .gm-style,
.foodbridge-map-container:active .gm-style canvas,
.foodbridge-map-container.is-dragging .gm-style,
.foodbridge-map-container.is-dragging canvas {
  cursor: grabbing !important;
}

.foodbridge-map-container button,
.foodbridge-map-container a,
.foodbridge-map-container input,
.foodbridge-map-container select,
.foodbridge-map-container [role="button"],
.foodbridge-map-container .gm-ui-hover-effect,
.foodbridge-map-container .gm-style-iw {
  cursor: pointer !important;
}
```

---

## 5. Google Maps Gesture Configuration
- `<Map>` uses `gestureHandling="greedy"` and `disableDefaultUI={true}` inside `GoogleMap.jsx`.
- Allows direct single-finger drag on mobile and direct mouse wheel zoom on desktop without requiring key modifiers.

---

## 6. Map Drag Behavior & Cursor State Cycle
- **Idle State**: Cursor shows an **open hand (`grab`)** when hovering over any map area.
- **Mouse Down + Drag**: Container enters `is-dragging` state (`isMouseDown` or `map.addListener('dragstart')`), changing cursor to a **closed hand (`grabbing`)**.
- **Mouse Release**: Releasing mouse (`mouseup`, `pointerup`, `map.addListener('dragend')`, or global `window` release listener) restores cursor to an **open hand (`grab`)**.
- **Pointer Outside Map**: When pointer leaves `.foodbridge-map-container` (`onMouseLeave`), cursor returns to the **normal default dashboard cursor**.

---

## 7. Pickup Marker Drag Behavior
- Red Pickup pin (`PickupMarker.jsx`) is configured with `draggable={true}` and `onDragEnd`.
- Dragging the pin moves the pickup marker and updates form `latitude` and `longitude` fields without altering the base map's idle grab cursor.

---

## 8. Dashboard / Map Event Separation
- Outside the map container, all dashboard UI elements (sidebar, navbar, cards, form inputs, buttons, modals) operate with standard pointer interactions and default cursors.
- No global `* { cursor: grab }` or dashboard-wide cursor rules were added.

---

## 9. Marker Interaction Verification
- **Pickup Marker (Red)**: Draggable; updates form coordinates on release.
- **Your Current Location Marker (Blue)**: Non-draggable; distinct color.
- **Verified NGO Markers (Green)**: Non-draggable; clickable to view info popup card and route calculation.
- **Food Donation Markers (Amber/Orange)**: Non-draggable; clickable to view donation details popup card.

---

## 10. Key Files Changed
- `[frontend/src/components/maps/GoogleMap.jsx](file:///d:/FoodBridge-AI/frontend/src/components/maps/GoogleMap.jsx)` — Integrated DOM mouse/pointer state listeners (`onMouseDown`, `onMouseUp`, `onMouseLeave`, `window.mouseup`) and native Google Maps API `dragstart`/`dragend` listeners to manage `is-dragging` container state.
- `[frontend/src/styles/index.css](file:///d:/FoodBridge-AI/frontend/src/styles/index.css)` — Added scoped `.foodbridge-map-container` CSS rules for `grab`, `grabbing`, and `pointer` control cursors.

---

## 11. Tests Performed
1. **Map Idle Hover Test**: Moved mouse over map container -> verified open hand (`grab`) cursor.
2. **Map Drag Test**: Clicked and dragged empty map area -> verified closed hand (`grabbing`) cursor during movement.
3. **Map Release Test**: Released mouse button -> verified cursor returned to open hand (`grab`).
4. **Pointer Leave Test**: Moved pointer off the map onto dashboard sidebar/navbar -> verified cursor returned to default pointer.
5. **Map Controls Test**: Hovered zoom +, zoom -, fit bounds, and fullscreen buttons -> verified finger pointer (`pointer`) cursor and functional click actions.
6. **Marker Drag & Click Test**: Dragged pickup marker -> verified coordinates updated. Clicked NGO marker -> verified popup card opened cleanly.
7. **Production Build Test**: Executed `npm run build` in `frontend/` -> passed cleanly in 7.66s (**Exit code 0**).

---

## 12. Build Result
- **Frontend Build**: `npm run build` executed cleanly (**Exit code 0**).

---

## 13. Remaining Issues
- None. Mouse pointer state and map drag interactions behave exactly like native Google Maps.
