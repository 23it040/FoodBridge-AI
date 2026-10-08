# 🍲 Donate Surplus Food Form Specification (`/donor/donate`)

> **File**: `frontend/src/pages/Donor/DonateFood.jsx`  
> **Layout Wrapper**: `DashboardLayout.jsx`

---

## 📐 Form Structure & Sections for Figma

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Post Surplus Food Listing                                                   │
│ Fill in food details, photos, and pickup location for verified NGOs        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. FOOD DETAILS                                                             │
│ • Food Title / Name: [ e.g. 50 Packs Fresh Vegetable Curry               ] │
│ • Category Dropdown: [ Cooked Meals ▼ ]  • Servings / People: [ 50       ] │
│ • Quantity & Unit:   [ 15 ] [ kg ▼ ]                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. EXPIRY & STORAGE GUIDELINES                                              │
│ • Preparation Date & Time: [ 14/10/2026, 06:00 PM ]                         │
│ • Best Before / Expiry:    [ 14/10/2026, 11:30 PM ]                         │
│ • Storage Checkboxes:  [x] Refrigerated  [ ] Heated  [x] Packaged Boxes     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. FOOD PHOTO UPLOAD DROPZONE                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 📷 Drag and drop food photo here or click to browse                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PICKUP LOCATION & GPS PIN PICKER                                         │
│ • Address Line: [ 102 Green Restaurant, SG Highway, Ahmedabad           ] │
│ • Interactive Google Maps Location Picker (Click to adjust pin location)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [                     Publish Food Donation  ➔                            ] │
└─────────────────────────────────────────────────────────────────────────────┘
```
