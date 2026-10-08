# 🧭 Navigation & Header Components

> **Location**: `frontend/src/components/layout/` & `frontend/src/layouts/`

---

## 1. Main Navigation Bar (`Navbar.jsx`)

Top navigation bar used on public marketing pages and public auth routes.

### Layout Frame in Figma:
- **Height**: `64px` (`h-16`).
- **Background**: Dark Glass `bg-[#0A1A1A]/80 backdrop-blur-md border-b border-white/10`.
- **Left Side**: Brand Logo Icon (`FiHeart` inside `#102A2A` box) + Title `"FoodBridge AI"`.
- **Center Nav Links**: `Home`, `About`, `Impact`, `Map Discovery`, `Contact`.
- **Right Side Actions**:
  - `Login` button (Outline / Ghost mint text).
  - `Register` button (Solid Mint `#79D6B2` rounded-full).

---

## 2. Collapsible Left Sidebar (`Sidebar.jsx`)

Primary dashboard navigation menu used in Donor, NGO, and Admin Portals (`DashboardLayout.jsx`).

### Two Figma Component States:

#### State 1: Expanded Sidebar (`240px` width)
- **Width**: `240px` (`w-60`).
- **Header**: Active Portal Title (e.g. `Donor Portal`, `NGO Portal`, `Admin Portal`) + Collapse Toggle Chevron button (`FiChevronLeft`).
- **Nav List Item**:
  - Height: `44px` (`h-11`).
  - Corner Radius: `12px` (`rounded-xl`).
  - **Inactive Item**: Text `#A7B8B3`, Icon `20px`, Hover `bg-white/5 text-white`.
  - **Active Item**: Background `#79D6B2`, Text `#0A1A1A` font-extrabold, Icon `#0A1A1A` with subtle mint glow shadow.
- **Footer**: User profile summary & Quick Logout button (`FiLogOut`).

#### State 2: Collapsed Sidebar (`64px` width)
- **Width**: `64px` (`w-16`).
- Icons only view with tooltip popovers on hover.
- Expand button (`FiChevronRight`).

---

## 3. Top Dashboard Header (`DashboardLayout.jsx Header`)

Unified top header present inside all portal dashboards.

- **Height**: `61px`.
- **Background**: `bg-white` (Light theme) or `bg-[#102A2A]` (Dark theme).
- **Elements**:
  - Mobile Hamburger Menu Toggle (`FiMenu`).
  - Breadcrumb / Portal Badge (`Donor Portal`, `NGO Portal`, `Admin Portal`).
  - Notifications Bell with Unread Badge counter.
  - User Name & Logout Pill button.

---

## 4. Notifications & Profile Dropdowns (`NotificationsDropdown.jsx`, `ProfileDropdown.jsx`)

- **Notifications Dropdown**:
  - Width `360px`, max height `400px` with vertical scroll.
  - Header: `"Notifications"` + `"Mark all as read"`.
  - Item List: Alert Icon, Title, Short Description, Time (`10 mins ago`), Unread Dot indicator.
- **Profile Dropdown**:
  - Width `220px`.
  - Options: `View Profile`, `Edit Profile`, `Change Password`, `Settings`, `Divider`, `Log Out` (Red).
