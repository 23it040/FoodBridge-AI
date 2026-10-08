# 🗺️ FoodBridge AI - Comprehensive Frontend Navigation & UI Architecture Map

> **Purpose**: This document provides a complete navigation hierarchy, page layout structure, component mapping, user flows, and state breakdown for the **FoodBridge AI** frontend application. Use this document as the authoritative blueprint to design high-fidelity wireframes and design systems in **Figma**.

---

## 📐 1. Global Layout Architecture & Theme Guidelines

FoodBridge utilizes 3 primary structural layout wrappers:

```
                          ┌──────────────────────────┐
                          │     App Routing Entry    │
                          └────────────┬─────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
 ┌───────────────┐             ┌───────────────┐             ┌───────────────┐
 │  MainLayout   │              │  AuthLayout   │             │DashboardLayout│
 ├───────────────┤             ├───────────────┤             ├───────────────┤
 │ • Top Navbar  │              │ • Split Brand │             │ • Top Header  │
 │ • Main Body   │              │   Side Banner │             │ • Left Sidebar│
 │ • Footer      │              │ • Auth Card   │             │   (Collapsible)│
 └───────────────┘             └───────────────┘             └───────────────┘
```

### 🎨 Color Palette & UI Tokens (for Figma Styles)
- **Primary Brand / Emerald**: `#2F8F72` (Buttons, Active Icons, Highlights)
- **Primary Dark**: `#102A2A` (Header Brand Badge, High-contrast text)
- **Light Mint / Accent**: `#E8F6F0` (Active Badges, Soft Pill Backgrounds)
- **Background Main**: `#F6F7F4` (Soft Grayish Off-White page background)
- **Card Background**: `#FFFFFF` (Clean White with 1px border `#DDE5E1`)
- **Text Main**: `#17201F` (Charcoal Black)
- **Text Muted**: `#687370` (Slate Gray)
- **Status Colors**:
  - `ACCEPTED` / `CLAIMED` / `ACTIVE`: Green `#16A34A` / `#DCFCE7`
  - `PENDING`: Amber `#D97706` / `#FEF3C7`
  - `REJECTED` / `EXPIRED`: Red `#DC2626` / `#FEE2E2`

---

## 🌐 2. Navigation Architecture Tree

### 🔹 Level 1: Public & Authentication Pages

#### 1. **Public Marketing Layout** (`MainLayout`)
- **Header Navigation Bar (`Navbar.jsx`)**:
  - Brand Logo & Name (`FoodBridge`)
  - Nav Links: `Home`, `About`, `Impact`, `Contact`
  - Action Buttons: `Login` (Outline), `Register` (Solid Emerald)
- **Page: Home Page** (`/` -> `HomePage.jsx`):
  - **Hero Section**: Headline, Subtitle, CTA ("Post Food Surplus" / "Discover Nearby Food"), Hero Banner Image.
  - **Live Impact Counter**: Metrics cards (Kilograms Saved, Meals Distributed, Verified NGOs).
  - **How It Works Step-by-Step**: Donor Post -> AI Match -> NGO Pickup Request -> Distribution.
  - **Feature Showcase**: Real-time Maps, AI Spoilage Risk Detection, Automated Beneficiary Matching.
  - **Call to Action Banner**: Dual CTA for Donors and NGO Partners.
- **Footer (`Footer.jsx`)**:
  - Quick links, Social handles, Copyright, Privacy Policy, Terms of Service.

#### 2. **Auth Layout** (`AuthLayout`)
- **Visual Design**: 2-Column Split View (Desktop)
  - Left Panel: Brand Illustration / Impact Statistics / Testimonial Carousel.
  - Right Panel: Dynamic Auth Form Card.
- **Sub-Pages**:
  - 🔑 **Login Page** (`/auth/login` -> `LoginPage.jsx`):
    - Email & Password Inputs.
    - "Remember Me" checkbox & "Forgot Password?" link.
    - Login CTA button.
    - Quick Switch link to Registration.
    - Demo Login quick-fill helper pills (Admin, NGO, Donor).
  - 📝 **Register Page** (`/auth/register` -> `RegisterPage.jsx`):
    - **Role Selector Tabs**: `Donor` vs `NGO Partner`.
    - **Shared Fields**: Full Name, Email, Password, Confirm Password, Phone.
    - **Role-Specific Fields**:
      - *Donor*: Organization / Establishment Name, Address, City.
      - *NGO*: NGO Registration Number, Operating Address, GPS Coordinates, Capacity / Beneficiaries Served.
    - Terms & Conditions Checkbox.
  - 🔒 **Forgot Password Page** (`/auth/forgot-password` -> `ForgotPasswordPage.jsx`):
    - Email Address Input.
    - Send Reset Link button with success state confirmation.

---

## 📦 3. Donor Portal Architecture (`/donor/*`)

**Layout Wrapper**: `DashboardLayout` (`portalName="Donor Portal"`)
**Sidebar Menu Items**:
1. 📊 `Dashboard` (`/donor/dashboard`)
2. 🍲 `Donate Food` (`/donor/donate`)
3. 📦 `My Donations` (`/donor/my-donations`)
4. 📬 `Requests` (`/donor/requests`)
5. 🔔 `Notifications` (`/donor/notifications`)
6. 👤 `Profile` (`/donor/profile`)

---

### Page Breakdown & Component Layout for Figma:

#### 1. **Donor Dashboard** (`/donor/dashboard` -> `DonorDashboard.jsx`)
- **Header Section**: Welcome Banner ("Welcome back, [Donor Name]!"), Quick "Post New Food" CTA Button.
- **Summary Metrics Grid (4 Stat Cards)**:
  - Total Food Donated (kg)
  - Active Listings
  - Pending NGO Pickup Requests
  - Completed Distributions
- **AI Spoilage Risk Alerts Widget**:
  - Warning banner highlighting donations nearing expiration with calculated risk level (`High`, `Medium`, `Low`).
- **Active Food Listings Quick View**:
  - Horizontal scrollable or compact grid of active donation cards.
- **Recent NGO Pickup Requests Table**:
  - Columns: NGO Name, Food Item, Beneficiaries Count, Pickup Time, Status (`PENDING`), Actions (`Accept`, `Reject`).

#### 2. **Donate Surplus Food Form** (`/donor/donate` -> `DonateFood.jsx`)
- **Form Card Layout**:
  - **Section 1: Food Details**:
    - Item Name / Title input.
    - Category dropdown (Cooked Meals, Bakery, Raw Grains, Dairy, Packaged Food, Fruits/Veg).
    - Quantity input + Unit selector (kg, meals, boxes, items).
    - Servings Count / Estimated beneficiaries.
  - **Section 2: Expiry & Preparation**:
    - Preparation Date & Time picker.
    - Best Before / Expiration Date & Time picker.
    - Storage Conditions checkboxes (Refrigerated, Room Temp, Heated).
  - **Section 3: Image Upload Widget**:
    - Drag-and-Drop / File input for food photos with live preview thumbnail.
  - **Section 4: Pickup Address & GPS Coordinates**:
    - Street Address, Landmark, City, Pincode.
    - Interactive Google Maps Address Pin picker.
  - **Submit Button**: "Publish Food Donation".

#### 3. **My Donations List** (`/donor/my-donations` -> `MyDonations.jsx`)
- **Filter Bar**:
  - Search bar by title.
  - Status tabs (`ALL`, `AVAILABLE`, `CLAIMED`, `COMPLETED`, `EXPIRED`).
- **Donation Cards Grid**:
  - Image preview thumbnail.
  - Title, Category badge, Quantity, Expiry Countdown timer.
  - Status pill badge.
  - Action menu: `View Details`, `Edit Listing`, `Cancel/Delete`.

#### 4. **Donation Details & Request Manager** (`/donor/donations/:id` -> `DonationDetails.jsx`)
- **Top Bar**: Back arrow button, Title, Status Badge, Edit/Delete Action.
- **2-Column View**:
  - **Left Column**: Food image gallery, Expiry timer, Storage guidelines, GPS Location map view.
  - **Right Column (NGO Requests Section)**:
    - List of incoming NGO pickup requests for this item.
    - AI NGO Compatibility Score (e.g. 94% Match based on distance & capacity).
    - Request details: NGO Name, Distance (km), Requested Quantity, Contact Person, Phone.
    - Action Buttons: `Accept Request` (Green) / `Decline Request` (Outline Red).

#### 5. **Donor Incoming Requests Manager** (`/donor/requests` -> `FoodRequests.jsx`)
- Filter tabs: `All`, `Pending Approval`, `Accepted`, `Completed/History`.
- Request cards list with NGO profile summaries and quick contact trigger.

---

## 🤝 4. NGO Partner Portal Architecture (`/ngo/*`)

**Layout Wrapper**: `DashboardLayout` (`portalName="NGO Portal"`)
**Sidebar Menu Items**:
1. 📊 `Dashboard` (`/ngo/dashboard`)
2. 🗺️ `Nearby Food` (`/ngo/nearby`)
3. 📋 `My Requests` (`/ngo/my-requests`)
4. 📜 `Request History` (`/ngo/history`)
5. 🔔 `Notifications` (`/ngo/notifications`)
6. 👤 `Profile` (`/ngo/profile`)

---

### Page Breakdown & Component Layout for Figma:

#### 1. **NGO Dashboard** (`/ngo/dashboard` -> `NGODashboard.jsx`)
- **Header Section**: NGO Organization Title, Verification Status Badge (`Verified NGO`).
- **Metric Cards**:
  - Active Pickup Requests.
  - Approved Pickups Pending.
  - Total Food Claimed (kg).
  - People Served / Beneficiaries Reached.
- **Interactive Radar / Nearby Food Map Quick Preview**:
  - Mini map view showing food donations within 5-10 km radius.
- **AI Matching Recommendations Widget**:
  - Recommended food donations sorted by distance, expiry urgency, and NGO capacity.

#### 2. **Geographic Discovery & Nearby Map** (`/ngo/nearby` -> `NGONearbyFood.jsx`)
- **Split Screen Layout (Map + Feed)**:
  - **Left Side Filter & Feed Panel**:
    - Distance Radius Slider (1 km - 25 km).
    - Food Category Filters (Cooked Meals, Bakery, Packaged, etc.).
    - Search bar.
    - List of nearby available food cards.
  - **Right Side Full Map View**:
    - Interactive OpenStreetMap / Google Map view.
    - Custom Map Pins (Green for available food, Amber for high-urgency/nearing expiry).
    - Popover Info Windows on marker click with quick "Request Pickup" CTA.

#### 3. **Food Details & Pickup Request Modal** (`/ngo/food/:id` & `RequestFood.jsx`)
- **Food Listing Overview**: Photo, Donor establishment, Pickup location details, Expiry clock.
- **Pickup Request Form Card**:
  - Estimated Number of Beneficiaries to feed.
  - Contact Person Name & Direct Phone Number.
  - Preferred Pickup Time Slot picker.
  - Transport Vehicle Type dropdown (Two-wheeler, Van, Refrigerated Truck, On Foot).
  - Notes for Donor textarea.
  - **Submit Button**: "Submit Pickup Request".

#### 4. **My Active Requests Tracker** (`/ngo/my-requests` -> `NGOMyRequests.jsx`)
- Cards list of all submitted active requests.
- Live Status Progress Bar:
  `Submitted` ➔ `Donor Reviewing` ➔ `Accepted (Ready for Pickup)` / `Rejected`.
- Donor contact info reveal upon acceptance.

#### 5. **Request History Log** (`/ngo/history` -> `NGORequestHistory.jsx`)
- Log table of finalized requests.
- Filters: `ALL`, `ACCEPTED`, `REJECTED`.
- Columns: Date, Food Item, Donor Name, Quantity, Decision Outcome.

---

## 🛡️ 5. Admin Portal Architecture (`/admin/*`)

**Layout Wrapper**: `DashboardLayout` (`portalName="Admin Portal"`)
**Sidebar Menu Items**:
1. 📊 `Dashboard` (`/admin/dashboard`)
2. 👥 `Users` (`/admin/users`)
3. ✅ `NGO Verification` (`/admin/ngo-verification`)
4. 🍲 `Donations` (`/admin/donations`)
5. 📬 `Requests` (`/admin/requests`)
6. 📈 `Reports` (`/admin/reports`)
7. 📉 `Analytics` (`/admin/analytics`)
8. 🛡️ `Audit Logs` (`/admin/audit-logs`)
9. 🔔 `Notifications` (`/admin/notifications`)
10. 👤 `Profile` (`/admin/profile`)

---

### Page Breakdown & Component Layout for Figma:

#### 1. **Admin System Dashboard** (`/admin/dashboard` -> `AdminDashboard.jsx`)
- Executive System Overview KPIs (Total Users, Registered Donors, Verified NGOs, Total Food Redistributed in Tons).
- Real-time Platform Health & Activity Monitor.

#### 2. **User Management** (`/admin/users` -> `AdminUsers.jsx`)
- Comprehensive User Data Table with Search, Filter by Role (`Donor`, `NGO`, `Admin`), Block/Unblock Actions.

#### 3. **NGO Verification Center** (`/admin/ngo-verification` -> `AdminNGOVerification.jsx`)
- Review queues for newly registered NGOs.
- Document preview modal (Govt License, NGO Registration Cert, Tax Exemption docs).
- Approval / Rejection action triggers.

#### 4. **Global Analytics & Reports** (`/admin/analytics` -> `AdminAnalytics.jsx`)
- Recharts visualizations: Food Redistribution Over Time, Regional Heatmaps, Waste Avoidance Trends.

---

## 👤 6. Account & Settings Pages (`/profile/*`)

Available across all authenticated user roles (`Donor`, `NGO`, `Admin`):

1. **Profile View** (`/profile` -> `ProfileView.jsx`): User details card, role badges, joined date, contact info.
2. **Edit Profile** (`/profile/edit` -> `EditProfile.jsx`): Update organization details, logo upload, GPS address.
3. **Change Password** (`/profile/change-password` -> `ChangePassword.jsx`): Current password, new password, confirm password.
4. **Settings** (`/settings` -> `Settings.jsx`): Email alert toggles, SMS notification preferences.

---

## 🔄 7. System UI States & Feedback Components

For a complete Figma UI kit, design the following shared states:

### 1. **Loading & Skeleton States**
- `LoadingSpinner.jsx`: Full-screen blur overlay spinner & inline button spinners.
- `LoadingSkeleton.jsx`: Animated gray placeholder shimmer cards for:
  - Food Cards Grid Skeleton
  - Table Rows Skeleton
  - Map Loading Overlay

### 2. **System Error & Feedback Pages**
- `404` Page Not Found (`/404` -> `NotFoundPage.jsx`)
- `500` Internal Server Error (`/500` -> `InternalErrorPage.jsx`)
- `401` Unauthorized (`/401` -> `UnauthorizedPage.jsx`)
- `403` Forbidden Access (`/403` -> `ForbiddenPage.jsx`)
- `Offline` Network Connection Interrupted (`/offline` -> `OfflinePage.jsx`)

---

## 🎨 8. Summary Checklist for Figma Designers

When building your Figma UI kit for FoodBridge AI, ensure you create component frames for:

- [ ] **Global Header / Top Navigation Bar** (Public Navbar & Dashboard Header)
- [ ] **Collapsible Left Sidebar** (Expanded 240px width & Collapsed 64px width states)
- [ ] **Auth Cards** (Login, Register with Role Tabs, Forgot Password)
- [ ] **Food Card Component** (Image, Expiry Badge, Category Pill, Location, Action Button)
- [ ] **Form Inputs & Map Pickers** (Text inputs, File Upload dropzone, Leaflet/Google Map pin overlay)
- [ ] **Status Badges & Modals** (`PENDING`, `ACCEPTED`, `REJECTED`, `EXPIRED`)
- [ ] **Skeleton & Loading Screens** (Shimmer placeholder cards)
