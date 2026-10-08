# 👥 Admin User Management Specification (`/admin/users`)

> **File**: `frontend/src/pages/Admin/Users.jsx`

---

## 📐 Page Structure & Modals in Figma

- **Filter Bar**: Search bar input, Role Filter (`All Roles`, `Donor`, `NGO`, `Admin`), Status Filter (`ACTIVE`, `SUSPENDED`, `PENDING`).
- **Data Table (`DataTable.jsx`)**:
  - Columns: `Name & Email`, `Role Badge`, `Account Status Badge`, `Registration Date`, `Actions`.
- **Modals to Wireframe**:
  - **User Details Modal**: Shows complete user profile info, phone, address, and audit history.
  - **Update Account Status Modal**: Status dropdown (`ACTIVE` vs `SUSPENDED`), Reason textarea, submit/cancel triggers.
